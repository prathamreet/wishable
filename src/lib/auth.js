import jwt from 'jsonwebtoken';
import logger from './logger';

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
    logger.error('Token verification error:', error);
    return null;
  }
}


/**
 * Rotates a JWT token with a new expiration
 * @param {string} token - The JWT token to verify
 * @returns {Promise<{token: string|null, error: string|null}>} The new token or error
 */
export async function rotateToken(token) {
  try {
    // Verify the current token
    const { userId, exp } = jwt.verify(token, process.env.JWT_SECRET);
    
    // Don't rotate if more than 2 days left on token
    const now = Math.floor(Date.now() / 1000);
    if (exp - now > 60 * 60 * 24 * 2) {
      return { token: null, error: null }; // No need to rotate yet
    }
    
    // Generate a new token with the same userId
    const newToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "30d"
    });
    
    return { token: newToken, error: null };
  } catch (error) {
    logger.error('Token rotation error:', error);
    return { token: null, error: 'Invalid token' };
  }
}