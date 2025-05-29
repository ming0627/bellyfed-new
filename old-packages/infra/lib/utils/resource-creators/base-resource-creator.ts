import * as cdk from 'aws-cdk-lib';
import { Construct, IConstruct } from 'constructs';
import { IResource } from 'aws-cdk-lib';
import { StackUtils } from '../stack-utils';
import { GlobalTaggingUtils } from '../global-tagging-utils';

/**
 * Base class for resource creators with standard configuration.
 *
 * This class provides a standard way to:
 * 1. Create AWS resources with consistent naming (environment-prefixed)
 * 2. Apply standard tags (environment, managed by, project)
 *
 * Resource creators should extend this class and implement:
 * - createResource(): Create the actual AWS resource
 * - getResourceType(): Return the resource type for SSM parameter naming
 *
 * The create() method orchestrates:
 * 1. Resource creation
 * 2. Standard tag application
 */
export abstract class BaseResourceCreator<T extends IResource & IConstruct> {
    protected readonly scope: Construct;
    protected readonly id: string;
    protected readonly environment: string;

    constructor(scope: Construct, id: string, environment: string) {
        this.scope = scope;
        this.id = id;
        this.environment = environment;
    }

    /**
     * Create the resource and apply standard configuration
     */
    public create(): T {
        const resource = this.createResource();

        // Add standard tags
        this.addStandardTags(resource);

        return resource;
    }

    /**
     * Add standard tags to the resource
     */
    protected addStandardTags(resource: T): void {
        // Use global tagging utils if available
        try {
            const taggingUtils = GlobalTaggingUtils.getInstance();
            taggingUtils.applyTags(resource as IConstruct);
        } catch (error: unknown) {
            // Fallback to basic tags if global utils not initialized
            cdk.Tags.of(resource).add('Environment', this.environment);
            cdk.Tags.of(resource).add('ManagedBy', 'CDK');
            cdk.Tags.of(resource).add('Project', 'Bellyfed');
        }
    }

    /**
     * Create the resource
     */
    protected abstract createResource(): T;

    /**
     * Get the resource type for SSM parameter naming
     */
    protected abstract getResourceType(): string;
}
