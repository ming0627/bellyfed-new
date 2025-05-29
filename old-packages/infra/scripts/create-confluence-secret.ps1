# Check if AWS CLI is installed
if (!(Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "AWS CLI is not installed. Please install it first."
    exit 1
}

# Read environment variables from .env.confluence file
$envFile = ".env.confluence"
if (!(Test-Path $envFile)) {
    Write-Host "Error: .env.confluence file not found. Please create it using the template."
    exit 1
}

# Load environment variables
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
    }
}

# Create JSON string
$secretString = @{
    'base-url' = $env:CONFLUENCE_BASE_URL
    'username' = $env:CONFLUENCE_USERNAME
    'api-token' = $env:CONFLUENCE_API_TOKEN
    'space-key' = $env:CONFLUENCE_SPACE_KEY
} | ConvertTo-Json

# Create the secret in AWS Secrets Manager
Write-Host "Creating secret in AWS Secrets Manager..."
try {
    aws secretsmanager create-secret `
        --name confluence-credentials `
        --description "Confluence API credentials for documentation sync" `
        --secret-string $secretString `
        --region $env:AWS_REGION

    Write-Host "Secret created successfully!"
    Write-Host "You can now deploy your CI/CD stack with: cdk deploy CicdStack"
} catch {
    Write-Host "Failed to create secret. Please check your AWS credentials and permissions."
    Write-Host $_.Exception.Message
}
