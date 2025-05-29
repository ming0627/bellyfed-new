import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';

/**
 * Adds IAM policies to the ECS task role to allow access to the rankings S3 bucket.
 *
 * @param taskRole The IAM role to add policies to
 * @param environment The deployment environment (e.g., 'dev', 'staging', 'prod')
 */
export function addRankingsS3Permissions(taskRole: iam.IRole, environment: string): void {
    // Get the S3 bucket ARN from SSM Parameter Store
    // This parameter must be created by the RankingsBucketStack before this function is called
    const bucketArnParam = ssm.StringParameter.valueForStringParameter(
        taskRole.node.scope as any,
        `/bellyfed/${environment}/s3/rankings-bucket-arn`
    );
    console.log(`Retrieved S3 bucket ARN from SSM: ${bucketArnParam}`);

    // Create the policy statement
    const policyStatement = new iam.PolicyStatement({
        actions: ['s3:PutObject', 's3:GetObject', 's3:DeleteObject', 's3:ListBucket'],
        resources: [bucketArnParam, `${bucketArnParam}/*`],
    });

    // Add permissions to access the S3 bucket
    if (taskRole instanceof iam.Role) {
        taskRole.addToPolicy(policyStatement);
    } else {
        // For imported roles (IRole), we can't modify the policy directly
        console.warn(
            'Cannot add Rankings S3 permissions to imported role. Make sure the role has the necessary permissions.'
        );
    }
}
