import {
  EventBridgeClient,
  ListEventBusesCommand,
} from '@aws-sdk/client-eventbridge';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
dotenv.config({ path: join(__dirname, '.env') });

const eventbridge = new EventBridgeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function main() {
  try {
    console.log('AWS Region:', process.env.AWS_REGION);
    console.log('Event Bus:', process.env.SYSTEM_EVENT_BUS);

    const command = new ListEventBusesCommand({});
    const response = await eventbridge.send(command);
    console.log(
      'Available Event Buses:',
      JSON.stringify(response.EventBuses, null, 2),
    );
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
