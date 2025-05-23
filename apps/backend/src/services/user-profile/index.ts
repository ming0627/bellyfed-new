/**
 * User Profile Service
 * 
 * This service handles user profile management operations including:
 * - Getting user profile information
 * - Updating user profiles
 * - Managing user followers and following relationships
 * 
 * It integrates with the database using Prisma ORM and exposes endpoints through tRPC.
 */

import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { v4 as uuidv4 } from 'uuid';

// Initialize Prisma client
const prisma = new PrismaClient();

// Error handling class
class ApplicationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApplicationError';
  }
}

// Get user profile
export const getUserProfile = async (userId: string) => {
  try {
    // Query to get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            dishRankings: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return {
      id: user.id,
      name: user.name || '',
      email: user.email,
      bio: user.bio || '',
      location: user.location || '',
      countryCode: user.countryCode || '',
      avatarUrl: user.avatarUrl || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      stats: {
        totalRankings: user._count.dishRankings,
        followers: user._count.followers,
        following: user._count.following,
      },
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get user profile',
    });
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  data: {
    name?: string;
    bio?: string;
    location?: string;
    avatarUrl?: string;
    countryCode?: string;
  }
) => {
  try {
    const { name, bio, location, avatarUrl, countryCode } = data;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        bio,
        location,
        avatarUrl,
        countryCode,
        updatedAt: new Date(),
      },
    });

    if (!updatedUser) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return {
      id: updatedUser.id,
      name: updatedUser.name || '',
      email: updatedUser.email,
      bio: updatedUser.bio || '',
      location: updatedUser.location || '',
      countryCode: updatedUser.countryCode || '',
      avatarUrl: updatedUser.avatarUrl || '',
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to update user profile',
    });
  }
};

// Get user followers
export const getUserFollowers = async (userId: string) => {
  try {
    const followers = await prisma.userFollower.findMany({
      where: { followedId: userId },
      include: {
        follower: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return followers.map((follow) => ({
      id: follow.follower.id,
      name: follow.follower.name || '',
      email: follow.follower.email,
      bio: follow.follower.bio || '',
      location: follow.follower.location || '',
      countryCode: follow.follower.countryCode || '',
      avatarUrl: follow.follower.avatarUrl || '',
      followedAt: follow.createdAt,
    }));
  } catch (error) {
    console.error('Error getting user followers:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get user followers',
    });
  }
};

// Get users the current user is following
export const getUserFollowing = async (userId: string) => {
  try {
    const following = await prisma.userFollower.findMany({
      where: { followerId: userId },
      include: {
        followed: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return following.map((follow) => ({
      id: follow.followed.id,
      name: follow.followed.name || '',
      email: follow.followed.email,
      bio: follow.followed.bio || '',
      location: follow.followed.location || '',
      countryCode: follow.followed.countryCode || '',
      avatarUrl: follow.followed.avatarUrl || '',
      followedAt: follow.createdAt,
    }));
  } catch (error) {
    console.error('Error getting user following:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to get user following',
    });
  }
};

// Follow a user
export const followUser = async (userId: string, targetUserId: string) => {
  try {
    if (!targetUserId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Target user ID is required',
      });
    }

    // Prevent following yourself
    if (targetUserId === userId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Cannot follow yourself',
      });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Target user not found',
      });
    }

    // Check if already following
    const existingFollow = await prisma.userFollower.findFirst({
      where: {
        followerId: userId,
        followedId: targetUserId,
      },
    });

    if (existingFollow) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Already following this user',
      });
    }

    // Add follow relationship
    await prisma.userFollower.create({
      data: {
        id: uuidv4(),
        followerId: userId,
        followedId: targetUserId,
      },
    });

    return { success: true, message: 'User followed successfully' };
  } catch (error) {
    console.error('Error following user:', error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to follow user',
    });
  }
};

// Unfollow a user
export const unfollowUser = async (userId: string, targetUserId: string) => {
  try {
    if (!targetUserId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Target user ID is required',
      });
    }

    // Remove follow relationship
    const result = await prisma.userFollower.deleteMany({
      where: {
        followerId: userId,
        followedId: targetUserId,
      },
    });

    if (result.count === 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Follow relationship not found',
      });
    }

    return { success: true, message: 'User unfollowed successfully' };
  } catch (error) {
    console.error('Error unfollowing user:', error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to unfollow user',
    });
  }
};
