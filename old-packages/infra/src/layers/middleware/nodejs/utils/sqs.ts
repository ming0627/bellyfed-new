import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({});

export const sendToSQS = async (queueUrl: string, message: unknown, messageGroupId?: string) => {
    const command = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(message),
        ...(messageGroupId && { MessageGroupId: messageGroupId }),
    });

    return sqsClient.send(command);
};
