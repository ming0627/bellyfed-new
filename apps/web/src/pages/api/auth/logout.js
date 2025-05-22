import { serialize } from 'cookie';

/**
 * Logout API handler
 * 
 * @param {import('next').NextApiRequest} req - Next.js API request
 * @param {import('next').NextApiResponse} res - Next.js API response
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Clear all auth cookies by setting them to expire immediately
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
      maxAge: 0, // Expire immediately
    };

    // Create expired cookies
    const cookies = [
      serialize('access_token', '', cookieOptions),
      serialize('id_token', '', cookieOptions),
      serialize('refresh_token', '', cookieOptions),
      serialize('auth_email', '', cookieOptions),
    ];

    // Set the cookies in the response
    res.setHeader('Set-Cookie', cookies);

    // Return success response
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
}
