/**
 * Hello World API Route
 * 
 * Simple API endpoint for testing and development purposes.
 * Returns a greeting message with request information.
 * 
 * Features:
 * - Basic API response
 * - Request information
 * - Environment details
 * - CORS support
 */

/**
 * Create hello response
 */
const createHelloResponse = (message = 'Hello from Bellyfed!', details = {}) => ({
  message,
  timestamp: new Date().toISOString(),
  service: 'bellyfed-web',
  version: process.env.npm_package_version || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  ...details
})

/**
 * Hello world handler
 * 
 * @param {import('next').NextApiRequest} req - The request object
 * @param {import('next').NextApiResponse} res - The response object
 */
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  try {
    const { method, url, headers, query, body } = req
    
    // Get user agent and IP
    const userAgent = headers['user-agent'] || 'Unknown'
    const clientIP = headers['x-forwarded-for'] || 
                    headers['x-real-ip'] || 
                    req.connection?.remoteAddress || 
                    'Unknown'
    
    // Create response based on method
    let response
    
    switch (method) {
      case 'GET':
        response = createHelloResponse('Hello from Bellyfed! 🍽️', {
          request: {
            method,
            url,
            userAgent,
            clientIP: clientIP.split(',')[0].trim(), // Get first IP if multiple
            query: Object.keys(query).length > 0 ? query : undefined
          },
          features: [
            'Restaurant Discovery',
            'Food Reviews',
            'User Rankings',
            'Social Features',
            'AI Recommendations'
          ]
        })
        break
        
      case 'POST':
        response = createHelloResponse('Hello from Bellyfed POST endpoint! 📝', {
          request: {
            method,
            url,
            userAgent,
            clientIP: clientIP.split(',')[0].trim(),
            hasBody: !!body,
            bodySize: body ? JSON.stringify(body).length : 0
          },
          received: body || null
        })
        break
        
      default:
        response = createHelloResponse(`Hello from Bellyfed ${method} endpoint!`, {
          request: {
            method,
            url,
            userAgent,
            clientIP: clientIP.split(',')[0].trim()
          },
          note: `${method} method is supported`
        })
    }
    
    // Add personalized greeting if name is provided
    if (query.name) {
      response.personalMessage = `Hello ${query.name}! Welcome to Bellyfed! 👋`
    }
    
    // Add debug information in development
    if (process.env.NODE_ENV === 'development') {
      response.debug = {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB'
        }
      }
    }
    
    return res.status(200).json(response)
    
  } catch (error) {
    console.error('Hello API error:', error)
    
    return res.status(500).json(createHelloResponse('Error occurred', {
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
