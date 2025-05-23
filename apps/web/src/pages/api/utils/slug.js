/**
 * API Route: Slug Generation Utility
 * 
 * This API route provides URL slug generation and validation services.
 * It creates SEO-friendly slugs from text input.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

/**
 * Handler for slug generation utility API endpoint
 * 
 * @param {NextApiRequest} req - The request object
 * @param {NextApiResponse} res - The response object
 */
export default async function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'POST':
      return handleGenerateSlug(req, res);
    case 'GET':
      return handleValidateSlug(req, res);
    default:
      return res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Only GET and POST requests are supported'
      });
  }
}

/**
 * Handle POST request to generate slug
 */
async function handleGenerateSlug(req, res) {
  try {
    // Get user session for authentication
    const session = await getServerSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to generate slugs'
      });
    }

    const { 
      text,
      maxLength = 50,
      separator = '-',
      lowercase = true,
      removeStopWords = false,
      preserveCase = false
    } = req.body;

    // Validate text parameter
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Invalid text parameter',
        message: 'Text is required and must be a string'
      });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({
        error: 'Empty text',
        message: 'Text cannot be empty'
      });
    }

    // Validate maxLength parameter
    const maxLengthNum = parseInt(maxLength, 10);
    if (isNaN(maxLengthNum) || maxLengthNum < 1 || maxLengthNum > 200) {
      return res.status(400).json({
        error: 'Invalid maxLength parameter',
        message: 'Max length must be between 1 and 200 characters'
      });
    }

    // Validate separator parameter
    if (typeof separator !== 'string' || separator.length > 3) {
      return res.status(400).json({
        error: 'Invalid separator parameter',
        message: 'Separator must be a string with maximum 3 characters'
      });
    }

    // Generate slug
    const slug = generateSlug(text, {
      maxLength: maxLengthNum,
      separator,
      lowercase: lowercase !== false,
      removeStopWords: removeStopWords === true,
      preserveCase: preserveCase === true
    });

    // Generate alternatives
    const alternatives = generateSlugAlternatives(text, {
      maxLength: maxLengthNum,
      separator,
      lowercase: lowercase !== false
    });

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        slug,
        alternatives,
        original: text,
        length: slug.length
      },
      meta: {
        settings: {
          maxLength: maxLengthNum,
          separator,
          lowercase: lowercase !== false,
          removeStopWords: removeStopWords === true,
          preserveCase: preserveCase === true
        },
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating slug:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate slug'
    });
  }
}

/**
 * Handle GET request to validate slug
 */
async function handleValidateSlug(req, res) {
  try {
    const { slug, type = 'general' } = req.query;

    // Validate slug parameter
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({
        error: 'Invalid slug parameter',
        message: 'Slug is required and must be a string'
      });
    }

    // Validate type parameter
    const validTypes = ['general', 'restaurant', 'dish', 'user'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: 'Invalid type parameter',
        message: `Type must be one of: ${validTypes.join(', ')}`
      });
    }

    // Validate slug
    const validation = validateSlug(slug, type);

    // Return validation result
    res.status(200).json({
      success: true,
      data: {
        slug,
        isValid: validation.isValid,
        issues: validation.issues,
        suggestions: validation.suggestions,
        score: validation.score
      },
      meta: {
        type,
        validatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error validating slug:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to validate slug'
    });
  }
}

/**
 * Generate URL slug from text
 */
function generateSlug(text, options = {}) {
  const {
    maxLength = 50,
    separator = '-',
    lowercase = true,
    removeStopWords = false,
    preserveCase = false
  } = options;

  let slug = text.trim();

  // Remove stop words if requested
  if (removeStopWords) {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = slug.split(/\s+/);
    const filteredWords = words.filter(word => 
      !stopWords.includes(word.toLowerCase()) || words.indexOf(word) === 0
    );
    slug = filteredWords.join(' ');
  }

  // Convert to lowercase unless preserving case
  if (lowercase && !preserveCase) {
    slug = slug.toLowerCase();
  }

  // Replace special characters and spaces
  slug = slug
    .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, and hyphens
    .replace(/\s+/g, separator) // Replace spaces with separator
    .replace(new RegExp(`${separator}+`, 'g'), separator) // Replace multiple separators with single
    .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), ''); // Remove leading/trailing separators

  // Truncate to max length
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
    // Remove trailing separator if truncation created one
    slug = slug.replace(new RegExp(`${separator}+$`), '');
  }

  return slug;
}

/**
 * Generate alternative slug variations
 */
function generateSlugAlternatives(text, options = {}) {
  const alternatives = [];
  
  // Generate with different separators
  alternatives.push(generateSlug(text, { ...options, separator: '_' }));
  alternatives.push(generateSlug(text, { ...options, separator: '.' }));
  
  // Generate with stop words removed
  alternatives.push(generateSlug(text, { ...options, removeStopWords: true }));
  
  // Generate shorter version
  alternatives.push(generateSlug(text, { ...options, maxLength: Math.floor(options.maxLength * 0.7) }));
  
  // Generate with preserved case
  alternatives.push(generateSlug(text, { ...options, preserveCase: true }));
  
  // Remove duplicates and return unique alternatives
  return [...new Set(alternatives)].filter(alt => alt !== generateSlug(text, options));
}

/**
 * Validate slug format and quality
 */
function validateSlug(slug, type = 'general') {
  const issues = [];
  const suggestions = [];
  let score = 100;

  // Check basic format
  if (!/^[a-z0-9-_\.]+$/i.test(slug)) {
    issues.push('Contains invalid characters');
    suggestions.push('Use only letters, numbers, hyphens, underscores, and dots');
    score -= 30;
  }

  // Check length
  if (slug.length < 3) {
    issues.push('Too short');
    suggestions.push('Use at least 3 characters');
    score -= 20;
  } else if (slug.length > 100) {
    issues.push('Too long');
    suggestions.push('Keep under 100 characters');
    score -= 15;
  }

  // Check for consecutive separators
  if (/[-_\.]{2,}/.test(slug)) {
    issues.push('Contains consecutive separators');
    suggestions.push('Avoid multiple consecutive hyphens, underscores, or dots');
    score -= 10;
  }

  // Check for leading/trailing separators
  if (/^[-_\.]|[-_\.]$/.test(slug)) {
    issues.push('Starts or ends with separator');
    suggestions.push('Remove leading and trailing separators');
    score -= 10;
  }

  // Type-specific validations
  if (type === 'restaurant' || type === 'dish') {
    if (!/[a-zA-Z]/.test(slug)) {
      issues.push('Should contain at least one letter');
      suggestions.push('Include descriptive text for better SEO');
      score -= 15;
    }
  }

  // Check for common SEO issues
  if (slug.split(/[-_\.]/).length > 8) {
    issues.push('Too many words');
    suggestions.push('Keep to 6-8 words maximum for better SEO');
    score -= 5;
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
    score: Math.max(0, score)
  };
}
