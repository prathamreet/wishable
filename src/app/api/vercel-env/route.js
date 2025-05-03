import { successResponse } from '../../../lib/apiUtils';

export const dynamic = 'force-dynamic'; // Never cache this route

export async function GET(req) {
  // Collect environment information
  const envInfo = {
    NODE_ENV: process.env.NODE_ENV || 'not set',
    VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'not set',
    IS_VERCEL: !!process.env.VERCEL || false,
    VERCEL_REGION: process.env.VERCEL_REGION || 'not set',
    VERCEL_URL: process.env.VERCEL_URL || 'not set',
    MONGODB_URI_SET: !!process.env.MONGODB_URI,
    JWT_SECRET_SET: !!process.env.JWT_SECRET,
    DEPLOYMENT_URL: process.env.DEPLOYMENT_URL || process.env.VERCEL_URL || 'not set'
  };
  
  return successResponse({
    message: 'Vercel environment information',
    environment: envInfo
  });
}