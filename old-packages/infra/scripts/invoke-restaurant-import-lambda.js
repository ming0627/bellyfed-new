/**
 * Script to invoke the restaurant-data-import Lambda function
 *
 * This script reads the restaurant data from the JSON file and invokes the Lambda function.
 */

const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');
const fs = require('fs');
const path = require('path');

// Initialize Lambda client
const lambdaClient = new LambdaClient({
    region: process.env.AWS_REGION || 'ap-southeast-1',
});

// Get the environment from command line arguments or default to 'dev'
const environment = process.argv[2] || 'dev';

// Lambda function name
const functionName = `${environment}-restaurant-data-import`;

// Read the restaurant data from the JSON file
async function readRestaurantData() {
    try {
        const filePath = path.join(__dirname, 'restaurants-data.json');
        console.log(`Reading restaurant data from ${filePath}...`);
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading restaurant data:', error);
        throw error;
    }
}

// Invoke the Lambda function
async function invokeLambda(restaurants) {
    try {
        console.log(`Invoking Lambda function ${functionName}...`);

        // Create API Gateway event payload
        const payload = {
            body: JSON.stringify({
                restaurants,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
            httpMethod: 'POST',
            path: '/import-restaurants',
            isBase64Encoded: false,
        };

        // Invoke Lambda function
        const command = new InvokeCommand({
            FunctionName: functionName,
            Payload: JSON.stringify(payload),
            InvocationType: 'RequestResponse',
        });

        const response = await lambdaClient.send(command);

        // Parse the response
        const responsePayload = Buffer.from(response.Payload).toString();
        console.log('Lambda function response:', responsePayload);

        return JSON.parse(responsePayload);
    } catch (error) {
        console.error('Error invoking Lambda function:', error);
        throw error;
    }
}

// Main function
async function main() {
    try {
        // Read restaurant data
        const restaurants = await readRestaurantData();
        console.log(`Found ${restaurants.length} restaurants to import`);

        // Invoke Lambda function
        const result = await invokeLambda(restaurants);

        console.log('Import completed successfully!');
        console.log(
            `Imported: ${result.imported}, Skipped: ${result.skipped}, Total: ${result.total}`
        );
    } catch (error) {
        console.error('Error in main function:', error);
    }
}

// Run the main function
main();
