import mongoose from 'mongoose';
import logger from './logger';
import { dbConfig } from '../config/database';

// Cache the database connection
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB with connection pooling and caching for better
 * performance in serverless environments like Vercel
 */
const connectDB = async () => {
  // If connection exists, reuse it
  if (cached.conn) {
    return cached.conn;
  }
  
  // If a connection is in progress, wait for it
  if (!cached.promise) {
    // Get the connection string and database name from config
    const uri = dbConfig.getConnectionString();
    const dbName = dbConfig.getDatabaseName();
    
    logger.info(`Connecting to MongoDB database: ${dbName}`);
    
    // Cache the connection promise
    cached.promise = mongoose.connect(uri, dbConfig.options)
      .then((mongoose) => {
        logger.info(`MongoDB connected successfully to ${dbName}`);
        return mongoose;
      })
      .catch((error) => {
        logger.error(`MongoDB connection error to ${dbName}:`, error);
        cached.promise = null;
        throw error;
      });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
};

export default connectDB;