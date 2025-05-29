# Check if AWS CLI is installed
if (!(Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "AWS CLI is not installed. Please install it first."
    exit 1
}

# Function to check if a queue exists
function Test-QueueExists {
    param (
        [string]$QueueName
    )
    try {
        $queueUrl = aws sqs get-queue-url --queue-name $QueueName --output json | ConvertFrom-Json
        return $true
    }
    catch {
        return $false
    }
}

# Function to delete a queue if it exists
function Remove-QueueIfExists {
    param (
        [string]$QueueName,
        [string]$Environment
    )
    
    $fullQueueName = "$Environment-$QueueName"
    if (Test-QueueExists -QueueName $fullQueueName) {
        Write-Host "Found queue: $fullQueueName"
        $confirmation = Read-Host "Do you want to delete this queue? (y/n)"
        if ($confirmation -eq 'y') {
            Write-Host "Deleting queue: $fullQueueName"
            try {
                $queueUrl = aws sqs get-queue-url --queue-name $fullQueueName --output json | ConvertFrom-Json
                aws sqs delete-queue --queue-url $queueUrl.QueueUrl
                Write-Host "Successfully deleted queue: $fullQueueName"
            }
            catch {
                Write-Host "Error deleting queue $fullQueueName : $_"
            }
        }
        else {
            Write-Host "Skipping deletion of queue: $fullQueueName"
        }
    }
    else {
        Write-Host "Queue not found: $fullQueueName"
    }
}

# Get environment from command line argument
$environment = $args[0]
if (!$environment) {
    Write-Host "Please provide the environment (e.g. staging, prod) as an argument."
    Write-Host "Usage: ./cleanup-sqs-queues.ps1 <environment>"
    exit 1
}

Write-Host "Checking for queues in environment: $environment"

# List of queue names to check (without environment prefix)
$queueNames = @(
    "write-queue",
    "write-dlq",
    "import-queue",
    "import-dlq",
    "analytics-queue",
    "analytics-dlq",
    "auth-event-queue",
    "auth-event-dlq",
    "query-queue",
    "query-dlq"
)

# Check and optionally delete each queue
foreach ($queueName in $queueNames) {
    Remove-QueueIfExists -QueueName $queueName -Environment $environment
}

Write-Host "Queue cleanup process completed."
