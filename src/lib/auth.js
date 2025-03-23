import jwt from 'jsonwebtoken';

/**
 * Verifies and extracts session information from JWT token in request headers
 * @param {Request} req - Next.js request object  
 * @returns {Object|null} Session data or null if invalid
 */
export function getSession(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return null;
    }
    
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
}