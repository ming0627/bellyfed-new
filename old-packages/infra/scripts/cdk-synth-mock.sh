#!/bin/bash
set -e

# Set default values for CDK environment variables
export CDK_DEFAULT_ACCOUNT=${CDK_DEFAULT_ACCOUNT:-590184067494}
export CDK_DEFAULT_REGION=${CDK_DEFAULT_REGION:-ap-southeast-1}
export ENV=${ENV:-dev}

echo "Using environment: $ENV"
echo "Using mock AWS credentials for validation only"

# Create mock AWS credentials if they don't exist
if [ ! -f ~/.aws/credentials ]; then
  mkdir -p ~/.aws
  echo "[default]" > ~/.aws/credentials
  echo "aws_access_key_id=AKIAIOSFODNN7EXAMPLE" >> ~/.aws/credentials
  echo "aws_secret_access_key=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" >> ~/.aws/credentials
  echo "region=ap-southeast-1" >> ~/.aws/credentials
  echo "[default]" > ~/.aws/config
  echo "region=ap-southeast-1" >> ~/.aws/config
  echo "output=json" >> ~/.aws/config
  echo "Created mock AWS credentials for testing"
fi

# Create mock CDK context with all required lookups
# If you encounter errors about missing context, add them here
echo '{
  "availability-zones:account=590184067494:region=ap-southeast-1": [
    "ap-southeast-1a",
    "ap-southeast-1b",
    "ap-southeast-1c"
  ],
  "hosted-zone:account=590184067494:domainName=bellyfed.com:region=ap-southeast-1": {
    "Id": "/hostedzone/Z1234567890ABC",
    "Name": "bellyfed.com."
  },
  "vpc-provider:account=590184067494:filter.vpc-id=vpc-mock:region=ap-southeast-1": {
    "vpcId": "vpc-mock",
    "availabilityZones": [
      "ap-southeast-1a",
      "ap-southeast-1b"
    ],
    "privateSubnetIds": [
      "subnet-private1",
      "subnet-private2"
    ],
    "privateSubnetNames": [
      "Private Subnet 1",
      "Private Subnet 2"
    ],
    "privateSubnetRouteTableIds": [
      "rtb-private1",
      "rtb-private2"
    ],
    "publicSubnetIds": [
      "subnet-public1",
      "subnet-public2"
    ],
    "publicSubnetNames": [
      "Public Subnet 1",
      "Public Subnet 2"
    ],
    "publicSubnetRouteTableIds": [
      "rtb-public1",
      "rtb-public2"
    ]
  }
}' > cdk.context.json

# Run CDK synth with --no-lookups flag to avoid AWS API calls
echo "Running CDK synth with --no-lookups flag..."
npx cdk synth --no-lookups --context environment=$ENV 2> /tmp/cdk-synth-error.log || {
  echo "❌ CDK synth failed with error:"
  cat /tmp/cdk-synth-error.log
  
  # Check for specific errors and provide helpful messages
  if grep -q "Missing context" /tmp/cdk-synth-error.log; then
    echo ""
    echo "✋ Missing context detected. You may need to add additional mock context values to this script."
    echo "Look for lines with 'Missing context value' in the error output above."
    echo "Common fixes:"
    echo "1. Add the missing context key to the JSON object in scripts/cdk-synth-mock.sh"
    echo "2. Try running 'cdk synth' locally with AWS credentials to generate the required context"
    echo "3. Check that the account and region values in the script match your configuration"
  fi
  
  exit 1
}

# Check if synth was successful
if [ $? -eq 0 ]; then
  echo "✅ CDK synth completed successfully (validation only)"
  exit 0
else
  echo "❌ CDK synth failed with error code $?"
  exit 1
fi 