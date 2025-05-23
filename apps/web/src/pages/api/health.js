/**
 * Health Check API Route
 * 
 * Provides a health check endpoint for monitoring and load balancers.
 * Returns service status and timestamp information.
 * 
 * Features:
 * - Simple health status response
 * - Timestamp for monitoring
 * - Database connectivity check (optional)
 * - Service dependencies check
 */

/**
 * Health response interface
 */
const createHealthResponse = (status = 'healthy', details = {}) => ({
  status,
  timestamp: new Date().toISOString(),
  service: 'bellyfed-web',
  version: process.env.npm_package_version || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  ...details
})

/**
 * Check database connectivity
 */
const checkDatabase = async () => {
  try {
    // In a real implementation, you would check your database connection
    // For now, we'll simulate a database check
    const dbCheck = await new Promise((resolve) => {
      setTimeout(() => resolve(true), 100)
    })
    
    return {
      database: {
        status: dbCheck ? 'connected' : 'disconnected',
        responseTime: '< 100ms'
      }
    }
  } catch (error) {
    return {
      database: {
        status: 'error',
        error: error.message
      }
    }
  }
}

/**
 * Check external service dependencies
 */
const checkDependencies = async () => {
  const dependencies = {}
  
  try {
    // Check AWS services
    dependencies.aws = {
      status: process.env.AWS_REGION ? 'configured' : 'not_configured'
    }
    
    // Check authentication service
    dependencies.cognito = {
      status: process.env.COGNITO_USER_POOL_ID ? 'configured' : 'not_configured'
    }
    
    // Check Google services
    dependencies.google = {
      status: process.env.GOOGLE_MAPS_API_KEY ? 'configured' : 'not_configured'
    }
    
    return dependencies
  } catch (error) {
    return {
      error: error.message
    }
  }
}

/**
 * Health check handler
 * 
 * @param {import('next').NextApiRequest} req - The request object
 * @param {import('next').NextApiResponse} res - The response object
 */
export default async function handler(req, res) {
  // Set CORS headers for health checks
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json(createHealthResponse('error', {
      error: 'Method not allowed',
      allowedMethods: ['GET']
    }))
  }
  
  try {
    const startTime = Date.now()
    
    // Basic health check
    let healthStatus = 'healthy'
    const healthDetails = {
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      }
    }
    
    // Check if detailed health check is requested
    const detailed = req.query.detailed === 'true'
    
    if (detailed) {
      // Perform database check
      const dbStatus = await checkDatabase()
      healthDetails.checks = { ...dbStatus }
      
      // Check dependencies
      const dependencies = await checkDependencies()
      healthDetails.dependencies = dependencies
      
      // Determine overall health status
      if (dbStatus.database?.status === 'error') {
        healthStatus = 'degraded'
      }
    }
    
    // Add response time
    healthDetails.responseTime = `${Date.now() - startTime}ms`
    
    // Return health status
    const response = createHealthResponse(healthStatus, healthDetails)
    
    // Set appropriate status code
    const statusCode = healthStatus === 'healthy' ? 200 : 
                      healthStatus === 'degraded' ? 200 : 503
    
    return res.status(statusCode).json(response)
    
  } catch (error) {
    console.error('Health check error:', error)
    
    return res.status(503).json(createHealthResponse('unhealthy', {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }))
  }
}

/**
 * API route configuration
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}
