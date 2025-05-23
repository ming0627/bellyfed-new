/**
 * Image Processor Lambda Function
 * 
 * Processes uploaded images for restaurants, dishes, and user profiles.
 * Handles image optimization, resizing, format conversion, and thumbnail generation.
 * 
 * Features:
 * - Image resizing and optimization
 * - Multiple format support (JPEG, PNG, WebP)
 * - Thumbnail generation
 * - Metadata extraction
 * - S3 integration
 * - Error handling and validation
 */

import { S3Event, Context } from 'aws-lambda'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import sharp from 'sharp'

// Types
interface ImageProcessingJob {
  sourceKey: string
  sourceBucket: string
  targetBucket: string
  sizes: ImageSize[]
  formats: ImageFormat[]
  quality: number
  metadata: ImageMetadata
}

interface ImageSize {
  name: string
  width: number
  height?: number
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

interface ImageFormat {
  extension: string
  mimeType: string
  options?: Record<string, any>
}

interface ImageMetadata {
  entityType: 'restaurant' | 'dish' | 'user' | 'review'
  entityId: string
  uploadedBy: string
  originalName: string
  uploadDate: string
}

// Initialize AWS clients
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1'
})

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1'
})
const docClient = DynamoDBDocumentClient.from(dynamoClient)

// Environment variables
const PROCESSED_BUCKET = process.env.PROCESSED_BUCKET || 'bellyfed-processed-images'
const IMAGES_TABLE = process.env.IMAGES_TABLE || 'bellyfed-images'

// Image processing configurations
const IMAGE_SIZES: Record<string, ImageSize[]> = {
  restaurant: [
    { name: 'thumbnail', width: 150, height: 150, fit: 'cover' },
    { name: 'small', width: 300, height: 200, fit: 'cover' },
    { name: 'medium', width: 600, height: 400, fit: 'cover' },
    { name: 'large', width: 1200, height: 800, fit: 'cover' },
    { name: 'hero', width: 1920, height: 1080, fit: 'cover' }
  ],
  dish: [
    { name: 'thumbnail', width: 100, height: 100, fit: 'cover' },
    { name: 'small', width: 250, height: 250, fit: 'cover' },
    { name: 'medium', width: 500, height: 500, fit: 'cover' },
    { name: 'large', width: 800, height: 800, fit: 'cover' }
  ],
  user: [
    { name: 'thumbnail', width: 50, height: 50, fit: 'cover' },
    { name: 'small', width: 100, height: 100, fit: 'cover' },
    { name: 'medium', width: 200, height: 200, fit: 'cover' }
  ],
  review: [
    { name: 'thumbnail', width: 120, height: 120, fit: 'cover' },
    { name: 'small', width: 300, height: 300, fit: 'cover' },
    { name: 'medium', width: 600, height: 600, fit: 'cover' }
  ]
}

const IMAGE_FORMATS: ImageFormat[] = [
  { extension: 'webp', mimeType: 'image/webp', options: { quality: 85 } },
  { extension: 'jpg', mimeType: 'image/jpeg', options: { quality: 85, progressive: true } }
]

/**
 * Main Lambda handler for processing S3 image upload events
 */
export const handler = async (event: S3Event, context: Context): Promise<void> => {
  console.log('Processing S3 image upload event:', JSON.stringify(event, null, 2))

  try {
    for (const record of event.Records) {
      if (record.eventName.startsWith('ObjectCreated')) {
        await processImageUpload(record.s3.bucket.name, record.s3.object.key)
      }
    }
  } catch (error) {
    console.error('Error processing image upload:', error)
    throw error
  }
}

/**
 * Process a single image upload
 */
async function processImageUpload(sourceBucket: string, sourceKey: string): Promise<void> {
  console.log(`Processing image: ${sourceBucket}/${sourceKey}`)

  try {
    // Parse metadata from object key
    const metadata = parseImageMetadata(sourceKey)
    if (!metadata) {
      console.log('Skipping non-image file or invalid metadata:', sourceKey)
      return
    }

    // Download original image
    const originalImage = await downloadImage(sourceBucket, sourceKey)
    
    // Get image info
    const imageInfo = await sharp(originalImage).metadata()
    console.log('Original image info:', imageInfo)

    // Validate image
    validateImage(imageInfo)

    // Get processing configuration
    const sizes = IMAGE_SIZES[metadata.entityType] || IMAGE_SIZES.review
    
    // Process image in all required sizes and formats
    const processedImages = await processImageVariants(
      originalImage,
      sourceKey,
      sizes,
      IMAGE_FORMATS,
      metadata
    )

    // Store image metadata in database
    await storeImageMetadata(sourceKey, metadata, imageInfo, processedImages)

    console.log(`Successfully processed image: ${sourceKey}`)
  } catch (error) {
    console.error(`Error processing image ${sourceKey}:`, error)
    throw error
  }
}

/**
 * Parse image metadata from S3 object key
 */
function parseImageMetadata(objectKey: string): ImageMetadata | null {
  // Expected format: uploads/{entityType}/{entityId}/{userId}/{timestamp}_{originalName}
  const parts = objectKey.split('/')
  
  if (parts.length < 5 || parts[0] !== 'uploads') {
    return null
  }

  const [, entityType, entityId, userId, filename] = parts
  const [timestamp, ...nameParts] = filename.split('_')
  const originalName = nameParts.join('_')

  if (!['restaurant', 'dish', 'user', 'review'].includes(entityType)) {
    return null
  }

  return {
    entityType: entityType as ImageMetadata['entityType'],
    entityId,
    uploadedBy: userId,
    originalName,
    uploadDate: new Date(parseInt(timestamp)).toISOString()
  }
}

/**
 * Download image from S3
 */
async function downloadImage(bucket: string, key: string): Promise<Buffer> {
  const response = await s3Client.send(new GetObjectCommand({
    Bucket: bucket,
    Key: key
  }))

  if (!response.Body) {
    throw new Error('Failed to download image from S3')
  }

  const chunks: Uint8Array[] = []
  const stream = response.Body as any

  for await (const chunk of stream) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

/**
 * Validate image properties
 */
function validateImage(imageInfo: sharp.Metadata): void {
  if (!imageInfo.width || !imageInfo.height) {
    throw new Error('Invalid image: missing dimensions')
  }

  if (imageInfo.width > 5000 || imageInfo.height > 5000) {
    throw new Error('Image too large: maximum 5000x5000 pixels')
  }

  const allowedFormats = ['jpeg', 'jpg', 'png', 'webp']
  if (!imageInfo.format || !allowedFormats.includes(imageInfo.format)) {
    throw new Error(`Unsupported image format: ${imageInfo.format}`)
  }
}

/**
 * Process image variants (sizes and formats)
 */
async function processImageVariants(
  originalImage: Buffer,
  sourceKey: string,
  sizes: ImageSize[],
  formats: ImageFormat[],
  metadata: ImageMetadata
): Promise<Array<{ key: string; size: string; format: string; url: string }>> {
  const processedImages: Array<{ key: string; size: string; format: string; url: string }> = []
  
  for (const size of sizes) {
    for (const format of formats) {
      try {
        const processedBuffer = await processImageVariant(originalImage, size, format)
        const processedKey = generateProcessedKey(sourceKey, size.name, format.extension)
        
        // Upload processed image
        await uploadProcessedImage(processedKey, processedBuffer, format.mimeType)
        
        // Generate URL
        const url = `https://${PROCESSED_BUCKET}.s3.amazonaws.com/${processedKey}`
        
        processedImages.push({
          key: processedKey,
          size: size.name,
          format: format.extension,
          url
        })
        
        console.log(`Processed variant: ${size.name} ${format.extension}`)
      } catch (error) {
        console.error(`Error processing variant ${size.name} ${format.extension}:`, error)
        // Continue with other variants
      }
    }
  }
  
  return processedImages
}

/**
 * Process a single image variant
 */
async function processImageVariant(
  originalImage: Buffer,
  size: ImageSize,
  format: ImageFormat
): Promise<Buffer> {
  let pipeline = sharp(originalImage)
    .resize(size.width, size.height, {
      fit: size.fit || 'cover',
      withoutEnlargement: true
    })

  // Apply format-specific processing
  switch (format.extension) {
    case 'webp':
      pipeline = pipeline.webp(format.options)
      break
    case 'jpg':
    case 'jpeg':
      pipeline = pipeline.jpeg(format.options)
      break
    case 'png':
      pipeline = pipeline.png(format.options)
      break
    default:
      throw new Error(`Unsupported format: ${format.extension}`)
  }

  return pipeline.toBuffer()
}

/**
 * Generate processed image key
 */
function generateProcessedKey(sourceKey: string, sizeName: string, formatExtension: string): string {
  const pathParts = sourceKey.split('/')
  const filename = pathParts[pathParts.length - 1]
  const nameWithoutExt = filename.split('.')[0]
  
  // processed/{entityType}/{entityId}/{sizeName}/{nameWithoutExt}.{format}
  return `processed/${pathParts[1]}/${pathParts[2]}/${sizeName}/${nameWithoutExt}.${formatExtension}`
}

/**
 * Upload processed image to S3
 */
async function uploadProcessedImage(key: string, buffer: Buffer, contentType: string): Promise<void> {
  await s3Client.send(new PutObjectCommand({
    Bucket: PROCESSED_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000', // 1 year cache
    Metadata: {
      processedAt: new Date().toISOString()
    }
  }))
}

/**
 * Store image metadata in database
 */
async function storeImageMetadata(
  sourceKey: string,
  metadata: ImageMetadata,
  imageInfo: sharp.Metadata,
  processedImages: Array<{ key: string; size: string; format: string; url: string }>
): Promise<void> {
  const imageId = `${metadata.entityType}_${metadata.entityId}_${Date.now()}`
  
  const item = {
    imageId,
    sourceKey,
    entityType: metadata.entityType,
    entityId: metadata.entityId,
    uploadedBy: metadata.uploadedBy,
    originalName: metadata.originalName,
    uploadDate: metadata.uploadDate,
    originalWidth: imageInfo.width,
    originalHeight: imageInfo.height,
    originalFormat: imageInfo.format,
    originalSize: imageInfo.size,
    processedVariants: processedImages,
    status: 'processed',
    processedAt: new Date().toISOString()
  }

  await docClient.send(new PutCommand({
    TableName: IMAGES_TABLE,
    Item: item
  }))

  // Update entity with image reference
  await updateEntityWithImage(metadata.entityType, metadata.entityId, imageId, processedImages)
}

/**
 * Update entity with image reference
 */
async function updateEntityWithImage(
  entityType: string,
  entityId: string,
  imageId: string,
  processedImages: Array<{ key: string; size: string; format: string; url: string }>
): Promise<void> {
  const entityTable = `bellyfed-${entityType}s`
  
  // Find the medium WebP variant as the primary image
  const primaryImage = processedImages.find(img => 
    img.size === 'medium' && img.format === 'webp'
  ) || processedImages[0]

  try {
    await docClient.send(new UpdateCommand({
      TableName: entityTable,
      Key: { [`${entityType}Id`]: entityId },
      UpdateExpression: `
        SET images = list_append(if_not_exists(images, :emptyList), :newImage),
            primaryImage = if_not_exists(primaryImage, :primaryImage),
            updatedAt = :timestamp
      `,
      ExpressionAttributeValues: {
        ':emptyList': [],
        ':newImage': [imageId],
        ':primaryImage': primaryImage.url,
        ':timestamp': new Date().toISOString()
      }
    }))
  } catch (error) {
    console.error(`Error updating ${entityType} with image:`, error)
    // Don't throw - image processing was successful
  }
}
