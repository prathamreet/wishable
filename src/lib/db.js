import mongoose from 'mongoose';
import logger from './logger';

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // Use the logger utility
    logger.info('MongoDB connected');
  } catch (error) {
    // Always log critical errors
    logger.error('MongoDB connection error:', error);
    throw error;
  }
};


export default connectDB;