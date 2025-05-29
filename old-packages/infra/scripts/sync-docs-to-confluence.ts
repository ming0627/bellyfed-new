import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import dotenv from 'dotenv';
import FormData from 'form-data';

// Load environment variables from .env.confluence
const envPath = path.resolve(__dirname, '../.env.confluence');
dotenv.config({ path: envPath });

// Validate required environment variables
const requiredEnvVars = [
    'CONFLUENCE_BASE_URL',
    'CONFLUENCE_USERNAME',
    'CONFLUENCE_API_TOKEN',
    'CONFLUENCE_SPACE_KEY',
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

interface ConfluenceConfig {
    baseUrl: string;
    username: string;
    apiToken: string;
    spaceKey: string;
    dryRun?: boolean;
    maxRetries?: number;
}

interface ConfluencePage {
    id: string;
    type: string;
    title: string;
    body: {
        storage: {
            value: string;
            representation: 'storage';
        };
    };
    space: {
        key: string;
    };
    version: {
        number: number;
    };
    ancestors?: Array<{ id: string }>;
}

interface PageHierarchy {
    title: string;
    path: string;
    parentPath?: string;
}

class ConfluenceSync {
    private config: ConfluenceConfig;
    private axiosInstance: any;
    private pageCache: Map<string, ConfluencePage> = new Map();
    private pageHierarchy: PageHierarchy[] = [];

    constructor(options: Partial<ConfluenceConfig> = {}) {
        this.config = {
            baseUrl: process.env.CONFLUENCE_BASE_URL!,
            username: process.env.CONFLUENCE_USERNAME!,
            apiToken: process.env.CONFLUENCE_API_TOKEN!,
            spaceKey: process.env.CONFLUENCE_SPACE_KEY!,
            dryRun: options.dryRun || false,
            maxRetries: options.maxRetries || 3,
        };

        // Ensure baseUrl is properly formatted
        let baseURL = this.config.baseUrl;
        if (!baseURL.startsWith('http://') && !baseURL.startsWith('https://')) {
            baseURL = 'https://' + baseURL;
        }
        if (baseURL.endsWith('/')) {
            baseURL = baseURL.slice(0, -1);
        }

        // For Atlassian cloud, we need to use /wiki/rest/api
        const apiPath = '/wiki/rest/api';

        this.axiosInstance = axios.create({
            baseURL: `${baseURL}${apiPath}`,
            auth: {
                username: this.config.username,
                password: this.config.apiToken,
            },
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });

        // Configure marked options
        marked.setOptions({
            breaks: true,
        });

        if (this.config.dryRun) {
            this.log('Starting in dry-run mode - no changes will be made');
            this.log(`Using Confluence space: ${this.config.spaceKey}`);
            this.log(`Base URL: ${baseURL}${apiPath}`);
            this.log(`Username: ${this.config.username}`);
        }
    }

    private log(message: string, level: 'info' | 'error' | 'warn' = 'info'): void {
        const timestamp = new Date().toISOString();
        const prefix = this.config.dryRun ? '[DRY RUN] ' : '';
        switch (level) {
            case 'error':
                console.error(`${timestamp} ${prefix}ERROR: ${message}`);
                break;
            case 'warn':
                console.warn(`${timestamp} ${prefix}WARN: ${message}`);
                break;
            default:
                console.log(`${timestamp} ${prefix}INFO: ${message}`);
        }
    }

    private async retryOperation<T>(
        operation: () => Promise<T>,
        retries: number = this.config.maxRetries || 3
    ): Promise<T> {
        let lastError: any;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await operation();
            } catch (error: unknown) {
                lastError = error;

                // Handle rate limiting
                if (error.response?.status === 429) {
                    const retryAfter = parseInt(error.response.headers['retry-after'] || '30', 10);
                    this.log(`Rate limited. Waiting ${retryAfter} seconds before retry...`, 'warn');
                    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
                    continue;
                }

                // Handle specific API errors
                if (error.response?.status === 400) {
                    this.log(
                        `Bad request: ${error.response.data?.message || error.message}`,
                        'error'
                    );
                    throw error;
                }

                if (error.response?.status === 403) {
                    this.log(
                        'Authentication failed. Please check your API token and permissions.',
                        'error'
                    );
                    throw error;
                }

                if (error.response?.status === 404) {
                    this.log(
                        'Resource not found. Please check your space key and page IDs.',
                        'error'
                    );
                    throw error;
                }

                // For other errors, retry with exponential backoff
                const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
                this.log(
                    `Operation failed (attempt ${attempt}/${retries}). Retrying in ${waitTime / 1000} seconds...`,
                    'warn'
                );
                await new Promise((resolve) => setTimeout(resolve, waitTime));
            }
        }
        throw lastError;
    }

    private async uploadAttachment(pageId: string, filePath: string): Promise<void> {
        await this.retryOperation(async () => {
            try {
                const fileName = path.basename(filePath);
                const fileStats = await fs.stat(filePath);
                const maxFileSize = 10 * 1024 * 1024; // 10MB limit

                if (fileStats.size > maxFileSize) {
                    throw new Error(`File ${fileName} exceeds maximum size of 10MB`);
                }

                if (this.config.dryRun) {
                    this.log(
                        `Would upload attachment: ${fileName} (${(fileStats.size / 1024).toFixed(2)}KB)`
                    );
                    return;
                }

                const fileContent = await fs.readFile(filePath);
                const formData = new FormData();
                formData.append('file', fileContent, {
                    filename: fileName,
                    contentType: this.getContentType(fileName),
                });

                await this.axiosInstance.post(`/content/${pageId}/child/attachment`, formData, {
                    headers: {
                        ...formData.getHeaders(),
                        'X-Atlassian-Token': 'no-check',
                    },
                });
                this.log(
                    `Uploaded attachment: ${fileName} (${(fileStats.size / 1024).toFixed(2)}KB)`
                );
            } catch (error: unknown) {
                if (error.response?.status === 409) {
                    this.log(
                        `Attachment ${path.basename(filePath)} already exists, skipping upload`,
                        'warn'
                    );
                    return;
                }
                throw error;
            }
        });
    }

    private getContentType(fileName: string): string {
        const ext = path.extname(fileName).toLowerCase();
        const contentTypes: { [key: string]: string } = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };
        return contentTypes[ext] || 'application/octet-stream';
    }

    private async processAttachments(content: string, pageId: string): Promise<string> {
        const imgRegex = /!\[.*?\]\((.*?)\)/g;
        const attachmentPromises: Promise<void>[] = [];
        let processedContent = content;
        const processedPaths = new Set<string>();

        for (const match of content.matchAll(imgRegex)) {
            const [fullMatch, imgPath] = match;
            if (processedPaths.has(imgPath)) continue;

            try {
                const absolutePath = path.resolve(path.dirname(imgPath), imgPath);
                const fileExists = await fs
                    .access(absolutePath)
                    .then(() => true)
                    .catch(() => false);

                if (fileExists) {
                    processedPaths.add(imgPath);
                    attachmentPromises.push(this.uploadAttachment(pageId, absolutePath));
                    const fileName = path.basename(imgPath);
                    processedContent = processedContent.replace(
                        new RegExp(this.escapeRegExp(fullMatch), 'g'),
                        `<ac:image><ri:attachment ri:filename="${fileName}"/></ac:image>`
                    );
                } else {
                    this.log(`Warning: Image file not found: ${imgPath}`, 'warn');
                }
            } catch (error: unknown) {
                this.log(`Error processing attachment ${imgPath}: ${error}`, 'error');
            }
        }

        await Promise.all(attachmentPromises);
        return processedContent;
    }

    private escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    private async processCodeBlocks(content: string): Promise<string> {
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

        return content.replace(codeBlockRegex, (_match: string, language: string, code: string) => {
            return `<pre><code class="language-${language || 'none'}">${code.trim()}</code></pre>`;
        });
    }

    async convertMarkdownToConfluence(markdown: string): Promise<string> {
        // Pre-process markdown
        let processedMarkdown = await this.processCodeBlocks(markdown);

        // Configure marked with GFM heading ID extension
        marked.use(gfmHeadingId());

        // Convert markdown to HTML with type assertion
        const html = marked(processedMarkdown) as string;

        // Post-process HTML for Confluence compatibility
        const processedHtml = html
            // Remove IDs from headers as they can cause issues
            .replace(/<h([1-6]) id="[^"]*">/g, '<h$1>')
            // Convert relative links to Confluence links
            .replace(/href="([^"]+)\.md"/g, (_match: string, p1: string) => {
                const pageName = path.basename(p1);
                return `href="ac:link"><ac:plain-text-link-body><![CDATA[${pageName}]]></ac:plain-text-link-body></ac:link`;
            })
            // Convert images to Confluence attachments
            .replace(/<img[^>]+src="([^"]+)"[^>]*>/g, (_match: string, src: string) => {
                return `<ac:image><ri:url ri:value="${src}"/></ac:image>`;
            })
            // Convert tables to Confluence format
            .replace(/<table>/g, '<table class="wrapped">')
            .replace(/<th>/g, '<th class="confluenceTh">')
            .replace(/<td>/g, '<td class="confluenceTd">')
            // Convert inline code to monospace
            .replace(
                /<code>([^<]+)<\/code>/g,
                '<code><span style="font-family: monospace;">$1</span></code>'
            )
            // Fix line breaks
            .replace(/\n/g, '');

        return processedHtml;
    }

    private toPascalCaseWithSpaces(text: string): string {
        return text
            .split(/[-_]/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    private async findOrCreateParentPages(filePath: string): Promise<string | null> {
        const relativePath = path.relative(
            path.resolve(__dirname, '../docs'),
            path.dirname(filePath)
        );
        if (relativePath === '') return null;

        const pathParts = relativePath.split(path.sep);
        let currentPath = '';
        let parentId: string | null = null;

        for (const part of pathParts) {
            currentPath = currentPath ? path.join(currentPath, part) : part;
            const title = this.toPascalCaseWithSpaces(part);

            const existingPage = await this.findPage(title);
            if (existingPage) {
                parentId = existingPage.id;
            } else {
                const newPage = await this.createPage(title, '<p>Directory index</p>', parentId);
                parentId = newPage.id;
            }

            this.pageHierarchy.push({
                title,
                path: currentPath,
                parentPath: path.dirname(currentPath),
            });
        }

        return parentId;
    }

    async findPage(title: string): Promise<ConfluencePage | null> {
        if (this.pageCache.has(title)) {
            return this.pageCache.get(title)!;
        }

        try {
            const response = await this.retryOperation(async () => {
                return await this.axiosInstance.get('/content', {
                    params: {
                        spaceKey: this.config.spaceKey,
                        title: title,
                        expand: 'version,body.storage',
                        status: 'current',
                        type: 'page',
                        limit: 1,
                    },
                });
            });

            if (response.data.results && response.data.results.length > 0) {
                const page = response.data.results[0];
                this.pageCache.set(title, page);
                return page;
            }
            return null;
        } catch (error: unknown) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }

    async getPageVersion(pageId: string): Promise<number> {
        try {
            const response = await this.axiosInstance.get(`/content/${pageId}`, {
                params: {
                    expand: 'version',
                },
            });
            return response.data.version.number;
        } catch (error: unknown) {
            this.log('Error getting page version: ' + error, 'error');
            throw error;
        }
    }

    private async createPage(
        title: string,
        content: string,
        parentId: string | null
    ): Promise<ConfluencePage> {
        const pageData: unknown = {
            type: 'page',
            title: title,
            space: { key: this.config.spaceKey },
            body: {
                storage: {
                    value: content,
                    representation: 'storage',
                },
            },
            status: 'current',
        };

        if (parentId) {
            pageData.ancestors = [{ id: parentId }];
        }

        try {
            const response = await this.retryOperation(async () => {
                const page = await this.axiosInstance.post('/content', pageData);
                return page.data;
            });
            return response;
        } catch (error: unknown) {
            this.log(`Error creating page "${title}": ${error}`, 'error');
            throw error;
        }
    }

    async createOrUpdatePage(filePath: string, content: string): Promise<void> {
        try {
            const parentId = await this.findOrCreateParentPages(filePath);
            const title = this.toPascalCaseWithSpaces(path.basename(filePath, '.md'));

            if (this.config.dryRun) {
                this.log(`Would create/update page: ${title}`);
                return;
            }

            let confluenceContent = await this.convertMarkdownToConfluence(content);
            const existingPage = await this.findPage(title);

            if (existingPage) {
                try {
                    const currentVersion = await this.getPageVersion(existingPage.id);
                    confluenceContent = await this.processAttachments(
                        confluenceContent,
                        existingPage.id
                    );

                    // Check if content has actually changed
                    if (existingPage.body.storage.value === confluenceContent) {
                        this.log(`No changes detected for page: ${title}, skipping update`);
                        return;
                    }

                    const updateData = {
                        version: {
                            number: currentVersion + 1,
                            message: `Updated via sync script at ${new Date().toISOString()}`,
                        },
                        title: title,
                        type: 'page',
                        body: {
                            storage: {
                                value: confluenceContent,
                                representation: 'storage',
                            },
                        },
                        space: {
                            key: this.config.spaceKey,
                        },
                    };

                    await this.retryOperation(async () => {
                        try {
                            await this.axiosInstance.put(`/content/${existingPage.id}`, updateData);
                            this.log(`Updated page: ${title} (version ${currentVersion + 1})`);
                        } catch (error: unknown) {
                            if (error.response?.status === 409) {
                                this.log(
                                    `Conflict detected while updating ${title}. Retrying with latest version...`,
                                    'warn'
                                );
                                const latestVersion = await this.getPageVersion(existingPage.id);
                                updateData.version.number = latestVersion + 1;
                                await this.axiosInstance.put(
                                    `/content/${existingPage.id}`,
                                    updateData
                                );
                                this.log(
                                    `Successfully updated page: ${title} (version ${latestVersion + 1})`
                                );
                            } else {
                                throw error;
                            }
                        }
                    });
                } catch (error: unknown) {
                    this.log(
                        `Failed to update page ${title}: ${error.response?.data?.message || error.message}`,
                        'error'
                    );
                    throw error;
                }
            } else {
                try {
                    const newPage = await this.retryOperation(async () => {
                        const page = await this.createPage(title, confluenceContent, parentId);
                        this.log(`Created new page: ${title}`);
                        return page;
                    });

                    // Process attachments after page creation
                    confluenceContent = await this.processAttachments(
                        confluenceContent,
                        newPage.id
                    );
                    if (confluenceContent !== newPage.body.storage.value) {
                        // Update the page with processed attachments
                        await this.createOrUpdatePage(filePath, content);
                    }
                } catch (error: unknown) {
                    this.log(
                        `Failed to create page ${title}: ${error.response?.data?.message || error.message}`,
                        'error'
                    );
                    throw error;
                }
            }
        } catch (error: unknown) {
            const errorMessage = error.response?.data?.message || error.message;
            this.log(`Error processing file "${filePath}": ${errorMessage}`, 'error');
            if (error.response?.status === 400) {
                this.log(
                    'This might be due to invalid content format or missing required fields',
                    'error'
                );
            }
            throw error;
        }
    }

    async syncDirectory(dirPath: string): Promise<void> {
        try {
            this.log(`Starting sync of directory: ${dirPath}`);
            const files = await fs.readdir(dirPath, { withFileTypes: true });
            let processedFiles = 0;
            let errors = 0;

            for (const file of files) {
                const fullPath = path.join(dirPath, file.name);

                try {
                    if (file.isDirectory()) {
                        await this.syncDirectory(fullPath);
                    } else if (file.name.endsWith('.md')) {
                        const content = await fs.readFile(fullPath, 'utf-8');
                        await this.createOrUpdatePage(fullPath, content);
                        processedFiles++;
                    }
                } catch (_error: unknown) {
                    errors++;
                    // Continue processing other files even if one fails
                    continue;
                }
            }

            this.log(
                `Completed sync of directory ${dirPath}. Processed ${processedFiles} files with ${errors} errors.`
            );
        } catch (error: unknown) {
            this.log(`Failed to sync directory ${dirPath}: ${error.message}`, 'error');
            throw error;
        }
    }
}

async function main() {
    try {
        const docsDir = process.argv[2] || path.resolve(__dirname, '../docs');
        const confluenceSync = new ConfluenceSync();
        await confluenceSync.syncDirectory(docsDir);
    } catch (error: unknown) {
        console.error('Error:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

export { ConfluenceSync };
