import mongoose from 'mongoose';
import logger from './logger';

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
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      maxPoolSize: 10, // Keep a pool of connections ready
      serverSelectionTimeoutMS: 10000, // How long to try connecting before timing out
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };
    
    // Cache the connection promise
    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
      .then((mongoose) => {
        logger.info('MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        logger.error('MongoDB connection error:', error);
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