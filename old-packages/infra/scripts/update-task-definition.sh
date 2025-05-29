#!/bin/bash
set -e

# Script to update the task definition with a better placeholder
# Usage: ./update-task-definition.sh

# Set environment variables
ENVIRONMENT="dev"
AWS_REGION="ap-southeast-1"
CLUSTER_NAME="bellyfed-${ENVIRONMENT}-cluster"
SERVICE_NAME="bellyfed-${ENVIRONMENT}"
TASK_FAMILY="BellyfedEcsFargateStackdevdevtaskdefinitionFCBF1D05"

echo "Environment: ${ENVIRONMENT}"
echo "AWS Region: ${AWS_REGION}"
echo "ECS Cluster: ${CLUSTER_NAME}"
echo "ECS Service: ${SERVICE_NAME}"
echo "Task Family: ${TASK_FAMILY}"

# Create a new task definition
cat > new-task-definition.json << 'EOF'
{
    "family": "BellyfedEcsFargateStackdevdevtaskdefinitionFCBF1D05",
    "containerDefinitions": [
        {
            "name": "dev-container",
            "image": "node:18-alpine",
            "cpu": 0,
            "portMappings": [
                {
                    "containerPort": 3000,
                    "hostPort": 3000,
                    "protocol": "tcp"
                }
            ],
            "essential": true,
            "environment": [
                {
                    "name": "NODE_ENV",
                    "value": "production"
                },
                {
                    "name": "ENVIRONMENT",
                    "value": "dev"
                }
            ],
            "command": [
                "sh", 
                "-c", 
                "echo '<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Bellyfed App</title><style>body{font-family:Arial,sans-serif;margin:0;padding:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f5f5f5;}.container{text-align:center;padding:2rem;background:white;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);max-width:800px;}h1{color:#e91e63;}p{color:#333;line-height:1.6;}</style></head><body><div class=\"container\"><h1>Bellyfed App</h1><p>This is a temporary placeholder for the Bellyfed frontend application.</p><p>The application is currently being manually deployed.</p><p>Status: <strong>Healthy</strong></p><p>Environment: <strong>dev</strong></p><p>Last Updated: '$(date)'</p></div></body></html>' > /tmp/index.html && echo '{ \"status\": \"healthy\", \"environment\": \"dev\", \"timestamp\": \"'$(date)'\" }' > /tmp/health.json && cd /tmp && node -e 'const http = require(\"http\"); const fs = require(\"fs\"); const server = http.createServer((req, res) => { if (req.url === \"/api/health\") { res.setHeader(\"Content-Type\", \"application/json\"); res.end(fs.readFileSync(\"health.json\")); } else { res.setHeader(\"Content-Type\", \"text/html\"); res.end(fs.readFileSync(\"index.html\")); } }); server.listen(3000, \"0.0.0.0\", () => { console.log(\"Server running at http://0.0.0.0:3000/\"); });'"
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/bellyfed-dev",
                    "awslogs-region": "ap-southeast-1",
                    "awslogs-stream-prefix": "bellyfed"
                }
            }
        }
    ],
    "taskRoleArn": "arn:aws:iam::590184067494:role/BellyfedEcsFargateStack-d-devtaskdefinitionTaskRole-WVvJcQGXdc08",
    "executionRoleArn": "arn:aws:iam::590184067494:role/BellyfedEcsFargateStack-d-devtaskdefinitionExecutio-JW98YASpPJQh",
    "networkMode": "awsvpc",
    "requiresCompatibilities": [
        "FARGATE"
    ],
    "cpu": "256",
    "memory": "512"
}
EOF

# Register the new task definition
echo "Registering new task definition..."
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition --cli-input-json file://new-task-definition.json --query "taskDefinition.taskDefinitionArn" --output text)

if [ $? -ne 0 ]; then
  echo "Error: Failed to register new task definition."
  exit 1
fi

echo "New task definition registered: ${NEW_TASK_DEF_ARN}"

# Update the service to use the new task definition
echo "Updating service to use new task definition..."
aws ecs update-service --cluster ${CLUSTER_NAME} --service ${SERVICE_NAME} --task-definition ${NEW_TASK_DEF_ARN} --force-new-deployment

if [ $? -ne 0 ]; then
  echo "Error: Failed to update service."
  exit 1
fi

echo "Service update initiated."

# Ask if user wants to wait for deployment to complete
read -p "Do you want to wait for the deployment to complete? (y/n): " WAIT_RESPONSE
if [[ "$WAIT_RESPONSE" =~ ^[Yy]$ ]]; then
  echo "Waiting for deployment to complete..."
  aws ecs wait services-stable --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME}
  
  if [ $? -eq 0 ]; then
    echo "Deployment completed successfully!"
  else
    echo "Deployment is taking longer than expected. Please check the AWS Console for status."
  fi
fi

# Clean up temporary files
echo "Cleaning up temporary files..."
rm -f new-task-definition.json

echo "Done!"
