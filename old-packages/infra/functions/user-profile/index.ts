import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    _GetCommand,
    _PutCommand,
    _QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { RDSDataClient, ExecuteStatementCommand } from '@aws-sdk/client-rds-data';
import { v4 as uuidv4 } from 'uuid';

// Initialize clients
const dynamoClient = new DynamoDBClient({});
const _docClient = DynamoDBDocumentClient.from(dynamoClient);
const rdsClient = new RDSDataClient({});

// Environment variables
const _userTable = process.env.USER_TABLE || '';
const _environment = process.env.ENVIRONMENT || 'dev';
const dbSecretArn = process.env.DB_SECRET_ARN || '';
const dbClusterArn = process.env.DB_CLUSTER_ARN || '';
const dbName = process.env.DB_NAME || 'bellyfed';

// Error handling class
class ApplicationError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApplicationError';
    }
}

// Helper function to handle errors
const handleError = (error: unknown, context: Context): APIGatewayProxyResult => {
    console.error(`[ERROR] ${context.awsRequestId}:`, error);

    if (error instanceof ApplicationError) {
        return {
            statusCode: error.statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify({ message: error.message }),
        };
    }

    return {
        statusCode: 500,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
        },
        body: JSON.stringify({ message: 'Internal server error' }),
    };
};

// Helper function to execute SQL queries
const executeQuery = async (sql: string, parameters: any[] = []): Promise<any> => {
    try {
        const params = {
            secretArn: dbSecretArn,
            resourceArn: dbClusterArn,
            database: dbName,
            sql,
            parameters: parameters.map((value, index) => ({
                name: `param${index + 1}`,
                value: {
                    stringValue: typeof value === 'string' ? value : JSON.stringify(value),
                },
            })),
        };

        const command = new ExecuteStatementCommand(params);
        const result = await rdsClient.send(command);
        return result;
    } catch (error: unknown) {
        console.error('Error executing SQL query:', error);
        throw error;
    }
};

// Get user profile
const getUserProfile = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub;
        if (!userId) {
            throw new ApplicationError('Unauthorized', 401);
        }

        // Query to get user profile
        const sql = `
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.bio,
        u.location,
        u.country_code,
        u.avatar_url,
        u.created_at,
        u.updated_at,
        (SELECT COUNT(*) FROM dish_rankings WHERE user_id = :param1) as total_rankings,
        (SELECT COUNT(*) FROM user_followers WHERE followed_id = :param1) as followers_count,
        (SELECT COUNT(*) FROM user_followers WHERE follower_id = :param1) as following_count
      FROM users u
      WHERE u.user_id = :param1
    `;

        const result = await executeQuery(sql, [userId]);

        if (!result.records || result.records.length === 0) {
            throw new ApplicationError('User not found', 404);
        }

        const record = result.records[0];
        const userProfile = {
            id: record[0].stringValue,
            name: record[1].stringValue,
            email: record[2].stringValue,
            bio: record[3]?.stringValue || '',
            location: record[4]?.stringValue || '',
            countryCode: record[5]?.stringValue || '',
            avatarUrl: record[6]?.stringValue || '',
            createdAt: record[7].stringValue,
            updatedAt: record[8].stringValue,
            stats: {
                totalRankings: parseInt(record[9].longValue) || 0,
                followers: parseInt(record[10].longValue) || 0,
                following: parseInt(record[11].longValue) || 0,
            },
        };

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify(userProfile),
        };
    } catch (error: unknown) {
        return handleError(error, context);
    }
};

// Update user profile
const updateUserProfile = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub;
        if (!userId) {
            throw new ApplicationError('Unauthorized', 401);
        }

        const body = JSON.parse(event.body || '{}');
        const { name, bio, location, avatarUrl, countryCode } = body;

        // Query to update user profile
        const sql = `
      UPDATE users
      SET 
        name = COALESCE(:param2, name),
        bio = COALESCE(:param3, bio),
        location = COALESCE(:param4, location),
        avatar_url = COALESCE(:param5, avatar_url),
        country_code = COALESCE(:param6, country_code),
        updated_at = NOW()
      WHERE user_id = :param1
      RETURNING *
    `;

        const result = await executeQuery(sql, [
            userId,
            name,
            bio,
            location,
            avatarUrl,
            countryCode,
        ]);

        if (!result.records || result.records.length === 0) {
            throw new ApplicationError('User not found', 404);
        }

        const record = result.records[0];
        const updatedProfile = {
            id: record[0].stringValue,
            name: record[1].stringValue,
            email: record[2].stringValue,
            bio: record[3]?.stringValue || '',
            location: record[4]?.stringValue || '',
            countryCode: record[5]?.stringValue || '',
            avatarUrl: record[6]?.stringValue || '',
            createdAt: record[7].stringValue,
            updatedAt: record[8].stringValue,
        };

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify(updatedProfile),
        };
    } catch (error: unknown) {
        return handleError(error, context);
    }
};

// Get user followers
const getUserFollowers = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub;
        if (!userId) {
            throw new ApplicationError('Unauthorized', 401);
        }

        // Query to get user followers
        const sql = `
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.bio,
        u.location,
        u.country_code,
        u.avatar_url,
        u.created_at,
        u.updated_at,
        uf.created_at as followed_at
      FROM user_followers uf
      JOIN users u ON uf.follower_id = u.user_id
      WHERE uf.followed_id = :param1
      ORDER BY uf.created_at DESC
    `;

        const result = await executeQuery(sql, [userId]);

        const followers = result.records.map((record: unknown) => ({
            id: record[0].stringValue,
            name: record[1].stringValue,
            email: record[2].stringValue,
            bio: record[3]?.stringValue || '',
            location: record[4]?.stringValue || '',
            countryCode: record[5]?.stringValue || '',
            avatarUrl: record[6]?.stringValue || '',
            followedAt: record[9].stringValue,
        }));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify({ followers }),
        };
    } catch (error: unknown) {
        return handleError(error, context);
    }
};

// Get users the current user is following
const getUserFollowing = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub;
        if (!userId) {
            throw new ApplicationError('Unauthorized', 401);
        }

        // Query to get users the current user is following
        const sql = `
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.bio,
        u.location,
        u.country_code,
        u.avatar_url,
        u.created_at,
        u.updated_at,
        uf.created_at as followed_at
      FROM user_followers uf
      JOIN users u ON uf.followed_id = u.user_id
      WHERE uf.follower_id = :param1
      ORDER BY uf.created_at DESC
    `;

        const result = await executeQuery(sql, [userId]);

        const following = result.records.map((record: unknown) => ({
            id: record[0].stringValue,
            name: record[1].stringValue,
            email: record[2].stringValue,
            bio: record[3]?.stringValue || '',
            location: record[4]?.stringValue || '',
            countryCode: record[5]?.stringValue || '',
            avatarUrl: record[6]?.stringValue || '',
            followedAt: record[9].stringValue,
        }));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify({ following }),
        };
    } catch (error: unknown) {
        return handleError(error, context);
    }
};

// Follow a user
const followUser = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub;
        if (!userId) {
            throw new ApplicationError('Unauthorized', 401);
        }

        const body = JSON.parse(event.body || '{}');
        const { targetUserId } = body;

        if (!targetUserId) {
            throw new ApplicationError('Target user ID is required', 400);
        }

        // Prevent following yourself
        if (targetUserId === userId) {
            throw new ApplicationError('Cannot follow yourself', 400);
        }

        // Check if target user exists
        const userCheckSql = `
      SELECT user_id FROM users WHERE user_id = :param1
    `;
        const userCheckResult = await executeQuery(userCheckSql, [targetUserId]);

        if (!userCheckResult.records || userCheckResult.records.length === 0) {
            throw new ApplicationError('Target user not found', 404);
        }

        // Check if already following
        const followCheckSql = `
      SELECT * FROM user_followers 
      WHERE follower_id = :param1 AND followed_id = :param2
    `;
        const followCheckResult = await executeQuery(followCheckSql, [userId, targetUserId]);

        if (followCheckResult.records && followCheckResult.records.length > 0) {
            throw new ApplicationError('Already following this user', 400);
        }

        // Add follow relationship
        const followSql = `
      INSERT INTO user_followers (follow_id, follower_id, followed_id, created_at)
      VALUES (:param1, :param2, :param3, NOW())
      RETURNING *
    `;
        await executeQuery(followSql, [uuidv4(), userId, targetUserId]);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify({ success: true, message: 'User followed successfully' }),
        };
    } catch (error: unknown) {
        return handleError(error, context);
    }
};

// Unfollow a user
const unfollowUser = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub;
        if (!userId) {
            throw new ApplicationError('Unauthorized', 401);
        }

        const body = JSON.parse(event.body || '{}');
        const { targetUserId } = body;

        if (!targetUserId) {
            throw new ApplicationError('Target user ID is required', 400);
        }

        // Remove follow relationship
        const unfollowSql = `
      DELETE FROM user_followers 
      WHERE follower_id = :param1 AND followed_id = :param2
      RETURNING *
    `;
        const result = await executeQuery(unfollowSql, [userId, targetUserId]);

        if (!result.records || result.records.length === 0) {
            throw new ApplicationError('Follow relationship not found', 404);
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify({ success: true, message: 'User unfollowed successfully' }),
        };
    } catch (error: unknown) {
        return handleError(error, context);
    }
};

// Main handler
export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    console.log(`Event: ${JSON.stringify(event)}`);

    try {
        const path = event.path;
        const method = event.httpMethod;

        // Route to the appropriate handler based on the path and method
        if (path.endsWith('/users/current') && method === 'GET') {
            return await getUserProfile(event, context);
        } else if (path.endsWith('/users/current') && method === 'PUT') {
            return await updateUserProfile(event, context);
        } else if (path.endsWith('/users/current/followers') && method === 'GET') {
            return await getUserFollowers(event, context);
        } else if (path.endsWith('/users/current/following') && method === 'GET') {
            return await getUserFollowing(event, context);
        } else if (path.endsWith('/users/follow') && method === 'POST') {
            return await followUser(event, context);
        } else if (path.endsWith('/users/unfollow') && method === 'DELETE') {
            return await unfollowUser(event, context);
        } else {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': 'true',
                },
                body: JSON.stringify({ message: 'Not found' }),
            };
        }
    } catch (error: unknown) {
        return handleError(error, context);
    }
};
