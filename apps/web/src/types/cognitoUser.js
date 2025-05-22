/**
 * Cognito User types
 * This file contains type definitions for Cognito user-related functionality
 * 
 * Note: In JavaScript, we're using JSDoc for type annotations
 */

/**
 * @typedef {Object} CognitoUserData
 * @property {string} id - User ID
 * @property {string} username - Username
 * @property {string} email - Email
 * @property {string} [name] - Full name
 * @property {string} [nickname] - Nickname
 * @property {string} [location] - Location
 * @property {string} [bio] - Bio
 * @property {string} [phone] - Phone number
 * @property {boolean} [email_verified] - Whether the email is verified
 * @property {string} [created_at] - Creation date
 * @property {string} [updated_at] - Update date
 * @property {Object} [preferences] - User preferences
 * @property {string[]} [interests] - User interests
 * @property {Object} [stats] - User stats
 * @property {number} [stats.reviews] - Number of reviews
 * @property {number} [stats.followers] - Number of followers
 * @property {number} [stats.following] - Number of following
 * @property {number} [stats.cities] - Number of cities
 */
