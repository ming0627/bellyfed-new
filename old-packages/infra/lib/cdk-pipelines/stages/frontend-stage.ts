/**
 * Frontend deployment stage for CDK Pipelines
 */
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FrontendCicdStack } from '../../frontend-cicd-stack';
import { FrontendServiceStack } from '../../frontend-service-stack';
import { CONFIG } from '../../config';

export interface FrontendStageProps extends cdk.StageProps {
    environment: string;
    ecrRepositoryUri?: string;
}

/**
 * Stage for deploying frontend resources
 */
export class FrontendStage extends cdk.Stage {
    constructor(scope: Construct, id: string, props: FrontendStageProps) {
        super(scope, id, props);

        const { environment } = props;

        // Create the frontend CICD stack
        const frontendCicdStack = new FrontendCicdStack(
            this,
            `BellyfedFrontendCicdStack-${environment}`,
            {
                env: props.env,
                environment,
                frontendRepo: CONFIG.frontend.repo,
                frontendOwner: CONFIG.frontend.owner,
                frontendBranch:
                    CONFIG.frontend.branchMapping[
                        environment as keyof typeof CONFIG.frontend.branchMapping
                    ] || environment,
                ecrRepositoryUri: props.ecrRepositoryUri,
            }
        );

        // Create the frontend service stack
        const frontendServiceStack = new FrontendServiceStack(
            this,
            `BellyfedFrontendServiceStack-${environment}`,
            {
                env: props.env,
                environment,
                imageTag: 'latest',
            }
        );

        // Add dependency to ensure the frontend CICD stack is created before the frontend service stack
        frontendServiceStack.addDependency(frontendCicdStack);
    }
}
