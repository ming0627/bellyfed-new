import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env.confluence
dotenv.config({ path: '.env.confluence' });

async function testConfluenceAccess() {
    const baseURL = process.env.CONFLUENCE_BASE_URL!.endsWith('/')
        ? process.env.CONFLUENCE_BASE_URL!.slice(0, -1)
        : process.env.CONFLUENCE_BASE_URL!;

    const axiosInstance = axios.create({
        baseURL: baseURL,
        auth: {
            username: process.env.CONFLUENCE_USERNAME!,
            password: process.env.CONFLUENCE_API_TOKEN!,
        },
        headers: {
            'Content-Type': 'application/json',
        },
    });

    try {
        // First test user endpoint to verify basic authentication
        console.log('Testing user authentication...');
        const userResponse = await axiosInstance.get('/wiki/rest/api/user/current');
        console.log('Current user info:', userResponse.data);

        // Try to get space info
        console.log('\nTesting space access...');
        const spaceResponse = await axiosInstance.get(
            `/wiki/rest/api/space/${process.env.CONFLUENCE_SPACE_KEY}`
        );
        console.log('Space info:', spaceResponse.data);

        // Try to list content in the space
        console.log('\nTesting content access...');
        const contentResponse = await axiosInstance.get('/wiki/rest/api/content', {
            params: {
                spaceKey: process.env.CONFLUENCE_SPACE_KEY,
                expand: 'version',
            },
        });
        console.log('Content list:', contentResponse.data);
    } catch (error: unknown) {
        console.error('Error details:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Status Text:', error.response.statusText);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
            console.error('Request URL:', error.config.url);
            console.error('Request Method:', error.config.method);
        } else if (error.request) {
            console.error('No response received');
            console.error('Request details:', error.request);
        } else {
            console.error('Error setting up the request:', error.message);
        }
        console.error('\nFull error:', error);
    }
}

testConfluenceAccess().catch(console.error);
