#!/bin/bash
set -e

# This script updates SSM parameters that already exist
# Run this before deploying the certificate parameters stack

# Set the environment
ENVIRONMENT=${1:-dev}
REGION=${AWS_DEFAULT_REGION:-ap-southeast-1}
HOSTED_ZONE_ID="Z05895961O4U27Y58ZXM1"
CERTIFICATE_ARN="arn:aws:acm:ap-southeast-1:590184067494:certificate/1f461ea5-50dc-45be-87a6-449e0eae1193"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|test|qa|prod)$ ]]; then
  echo "Error: Environment must be one of: dev, test, qa, prod"
  echo "Usage: $0 [environment]"
  exit 1
fi

echo "Updating SSM parameters for environment: $ENVIRONMENT in region $REGION"

# Update the hosted zone ID parameter
HOSTED_ZONE_PARAM="/bellyfed/$ENVIRONMENT/route53/hosted-zone-id"
echo "Updating parameter: $HOSTED_ZONE_PARAM"
aws ssm put-parameter \
  --name "$HOSTED_ZONE_PARAM" \
  --value "$HOSTED_ZONE_ID" \
  --type "String" \
  --description "Route53 Hosted Zone ID for bellyfed.com" \
  --region "$REGION" \
  --overwrite

# Update the certificate ARN parameter
CERT_PARAM="/bellyfed/$ENVIRONMENT/certificate/wildcard-certificate-arn"
echo "Updating parameter: $CERT_PARAM"
aws ssm put-parameter \
  --name "$CERT_PARAM" \
  --value "$CERTIFICATE_ARN" \
  --type "String" \
  --description "ACM Certificate ARN for bellyfed.com (used by CloudFront)" \
  --region "$REGION" \
  --overwrite

echo "SSM parameters updated successfully."
echo "Now you can deploy the certificate parameters stack for $ENVIRONMENT:"
echo "npx cdk deploy BellyfedCertificateParametersStack-$ENVIRONMENT --context environment=$ENVIRONMENT --require-approval never"
