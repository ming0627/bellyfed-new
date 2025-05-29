# Data Import Patterns

Version: v1.0.0
Last Updated: 2024-12-09 11:16:36 +08:00
Status: Active

## Overview

Common patterns and solutions for data import operations in the Oishiiteru platform.

## Data Validation Patterns

### Schema Validation

```typescript
interface ImportSchema {
    required: string[];
    types: Record<string, string>;
    constraints?: Record<string, any>;
}

function validateData(data: any, schema: ImportSchema): void {
    // Check required fields
    for (const field of schema.required) {
        if (!(field in data)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    // Validate types
    for (const [field, type] of Object.entries(schema.types)) {
        if (field in data && typeof data[field] !== type) {
            throw new Error(`Invalid type for ${field}: expected ${type}`);
        }
    }
}
```

### Batch Processing Pattern

```typescript
async function processBatch(items: any[], batchSize: number = 25): Promise<void> {
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await Promise.all(
            batch.map(async (item) => {
                try {
                    await processItem(item);
                } catch (error) {
                    console.error('Failed to process item:', {
                        item,
                        error: error instanceof Error ? error.message : error,
                    });
                }
            })
        );
    }
}
```

## Error Handling Patterns

### Retry Pattern

```typescript
async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt === maxRetries) break;

            await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        }
    }

    throw lastError;
}
```

## Data Transformation Patterns

### Data Normalization

```typescript
interface RawData {
    [key: string]: any;
}

interface NormalizedData {
    id: string;
    type: string;
    attributes: Record<string, any>;
    relationships?: Record<string, any>;
}

function normalizeData(raw: RawData): NormalizedData {
    return {
        id: raw.id || generateId(),
        type: raw.type,
        attributes: {
            ...raw,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    };
}
```

## Monitoring Patterns

### Import Progress Tracking

```typescript
interface ImportProgress {
    total: number;
    processed: number;
    failed: number;
    startTime: string;
    lastUpdated: string;
}

class ImportTracker {
    private progress: ImportProgress;

    constructor(total: number) {
        this.progress = {
            total,
            processed: 0,
            failed: 0,
            startTime: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
        };
    }

    updateProgress(success: boolean): void {
        this.progress.processed++;
        if (!success) this.progress.failed++;
        this.progress.lastUpdated = new Date().toISOString();

        console.log('Import progress:', {
            ...this.progress,
            successRate: `${(((this.progress.processed - this.progress.failed) / this.progress.total) * 100).toFixed(2)}%`,
        });
    }
}
```
