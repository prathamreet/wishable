import connectDB from '../../../lib/db';
import { errorResponse, successResponse } from '../../../lib/apiUtils';

export const dynamic = 'force-dynamic'; // Never cache this route

export async function GET(req) {
  try {
    console.log('Testing database connection...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Database name:', process.env.MONGODB_DB_NAME || 'using default');
    
    // Try to connect to the database
    await connectDB();
    
    // If we get here, the connection was successful
    return successResponse({
      message: 'Database connection successful',
      environment: process.env.NODE_ENV,
      databaseName: process.env.MONGODB_DB_NAME || 'default database name'
    });
  } catch (error) {
    console.error('Database connection test failed:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      env: process.env.NODE_ENV,
      dbName: process.env.MONGODB_DB_NAME
    });
    
    return errorResponse('Database connection test failed: ' + error.message, 500);
  }
}