import * as cdk from 'aws-cdk-lib';
import { IConstruct } from 'constructs';

export interface TaggingProps {
    environment: string;
    repository: string;
    region: string;
}

/**
 * Global tagging utilities for stacks and apps
 */
export class GlobalTaggingUtils {
    private static instance: GlobalTaggingUtils;
    private props: TaggingProps;

    private constructor(props: TaggingProps) {
        this.props = props;
    }

    public static initialize(props: TaggingProps): void {
        if (!GlobalTaggingUtils.instance) {
            GlobalTaggingUtils.instance = new GlobalTaggingUtils(props);
        }
    }

    public static getInstance(): GlobalTaggingUtils {
        if (!GlobalTaggingUtils.instance) {
            throw new Error('GlobalTaggingUtils must be initialized before use');
        }
        return GlobalTaggingUtils.instance;
    }

    /**
     * Apply common tags to any resource
     * @param resource The resource to tag
     */
    public applyTags(resource: IConstruct): void {
        cdk.Tags.of(resource).add('Environment', this.props.environment.toString());
        cdk.Tags.of(resource).add('Repository', this.props.repository);
        cdk.Tags.of(resource).add('Region', this.props.region);

        // If it's a stack, add stack-specific tag
        if (resource instanceof cdk.Stack) {
            cdk.Tags.of(resource).add('CloudFormationStack', resource.stackName);
        }
    }

    /**
     * Apply common tags to the entire CDK app
     * @param app The CDK app to tag
     */
    public applyAppTags(app: cdk.App): void {
        this.applyTags(app);
    }
}
