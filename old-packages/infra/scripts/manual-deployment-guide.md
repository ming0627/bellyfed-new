# Manual Deployment Guide for Bellyfed

This guide provides step-by-step instructions for manually deploying the Bellyfed application without relying on GitHub Actions.

## Prerequisites

- AWS CLI configured with appropriate credentials
- Docker installed locally
- Node.js and npm installed
- Access to both repositories: `bellyfed-infra` (backend) and `bellyfed` (frontend)

## 1. Update CDK Bootstrap Stack (If Needed)

If you're experiencing issues with the CDK bootstrap stack, you can update it manually:

```bash
# Navigate to the bellyfed-infra repository
cd /path/to/bellyfed-infra

# Run the bootstrap script for your environment (dev, qa, or prod)
./scripts/update-cdk-bootstrap.sh dev
```

## 2. Deploy the Frontend CICD Stack (If Needed)

If you need to update the CodePipeline configuration:

```bash
# Navigate to the bellyfed-infra repository
cd /path/to/bellyfed-infra

# Deploy the frontend CICD stack for your environment
./scripts/deploy-frontend-cicd.sh dev
```

## 3. Build and Deploy the Frontend Docker Image

### 3.1. Get the ECR Repository URI

```bash
# Get the ECR repository URI for your environment
ECR_REPOSITORY_URI=$(aws ssm get-parameter --name "/bellyfed/dev/ecs/repository-uri" --query "Parameter.Value" --output text)
echo "ECR Repository URI: $ECR_REPOSITORY_URI"
```

### 3.2. Build the Docker Image

```bash
# Navigate to the frontend repository
cd /path/to/bellyfed

# Build the Docker image
docker build -t bellyfed-frontend:latest .
```

### 3.3. Tag and Push the Image to ECR

```bash
# Log in to ECR
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin $(echo $ECR_REPOSITORY_URI | cut -d'/' -f1)

# Tag the image
docker tag bellyfed-frontend:latest $ECR_REPOSITORY_URI:latest

# Push the image to ECR
docker push $ECR_REPOSITORY_URI:latest
```

## 4. Update the ECS Service

### 4.1. Get ECS Cluster and Service Names

```bash
# Get the ECS cluster name
CLUSTER_NAME="bellyfed-dev"

# Get the ECS service name
SERVICE_NAME="bellyfed-frontend-service"
```

### 4.2. Update the ECS Service with the New Image

#### Option 1: Force a New Deployment

This is the simplest approach and will use the latest image in ECR:

```bash
# Force a new deployment of the ECS service
aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --force-new-deployment
```

#### Option 2: Update the Task Definition and Service

This approach gives you more control over the deployment:

```bash
# Get the current task definition
TASK_FAMILY="bellyfed-frontend-dev"
aws ecs describe-task-definition --task-definition $TASK_FAMILY --query "taskDefinition" > task-definition.json

# Update the image in the task definition
jq --arg IMAGE "$ECR_REPOSITORY_URI:latest" '.containerDefinitions[0].image = $IMAGE' task-definition.json > new-task-definition.json

# Remove read-only fields
jq 'del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)' new-task-definition.json > final-task-definition.json

# Register the new task definition
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition --cli-input-json file://final-task-definition.json --query "taskDefinition.taskDefinitionArn" --output text)

# Update the service to use the new task definition
aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --task-definition $NEW_TASK_DEF_ARN
```

## 5. Verify the Deployment

### 5.1. Wait for the Deployment to Complete

```bash
# Wait for the service to stabilize
aws ecs wait services-stable --cluster $CLUSTER_NAME --services $SERVICE_NAME
```

### 5.2. Check the Deployment Status

```bash
# Get the deployment status
aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --query "services[0].deployments"
```

### 5.3. Check the Running Tasks

```bash
# List the running tasks
aws ecs list-tasks --cluster $CLUSTER_NAME --service-name $SERVICE_NAME

# Get details of a specific task (replace TASK_ID with the actual task ID)
aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks TASK_ID
```

## 6. Troubleshooting

### 6.1. Check CloudWatch Logs

```bash
# Get the log group name
LOG_GROUP="/aws/ecs/bellyfed-dev"

# List log streams
aws logs describe-log-streams --log-group-name $LOG_GROUP --order-by LastEventTime --descending --limit 5

# Get log events (replace LOG_STREAM_NAME with the actual log stream name)
aws logs get-log-events --log-group-name $LOG_GROUP --log-stream-name LOG_STREAM_NAME
```

### 6.2. Check ECS Service Events

```bash
# Get service events
aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --query "services[0].events[0:5]"
```

### 6.3. Check Container Health

```bash
# Get task details to check container health
TASK_ID=$(aws ecs list-tasks --cluster $CLUSTER_NAME --service-name $SERVICE_NAME --query "taskArns[0]" --output text | cut -d'/' -f3)
aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $TASK_ID --query "tasks[0].containers[0].healthStatus"
```

## 7. Rollback (If Needed)

If you need to rollback to a previous version:

```bash
# Get the previous task definition
PREVIOUS_TASK_DEF=$(aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --query "services[0].taskDefinition" --output text)
PREVIOUS_REVISION=$(echo $PREVIOUS_TASK_DEF | cut -d':' -f2)
PREVIOUS_FAMILY=$(echo $PREVIOUS_TASK_DEF | cut -d'/' -f2 | cut -d':' -f1)
ROLLBACK_REVISION=$((PREVIOUS_REVISION - 1))

# Update the service to use the previous task definition
aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --task-definition ${PREVIOUS_FAMILY}:${ROLLBACK_REVISION}
```

## 8. Clean Up

```bash
# Remove temporary files
rm task-definition.json new-task-definition.json final-task-definition.json
```

## 9. Additional Resources

- [AWS CLI Command Reference for ECS](https://docs.aws.amazon.com/cli/latest/reference/ecs/index.html)
- [Docker Documentation](https://docs.docker.com/)
- [AWS ECR Documentation](https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html)
