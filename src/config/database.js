/**
 * Database configuration for MongoDB connections
 * Handles environment-specific database names and connection options
 */

// Environment-specific database names
const DB_NAMES = {
  development: 'wishable_dev',
  test: 'wishable_test',
  production: 'wishable_prod',
};

// Get current environment
const NODE_ENV = process.env.NODE_ENV || 'development';

// Check if this is a Vercel preview deployment
const IS_VERCEL_PREVIEW = process.env.VERCEL_ENV === 'preview';

/**
 * Get database name based on environment
 * @returns {string} The database name to use
 */
const getDatabaseName = () => {
  const envDbName = process.env.MONGODB_DB_NAME;
  
  // If explicitly set in environment variables, use that
  if (envDbName) {
    return envDbName;
  }
  
  // Otherwise use environment-specific default
  return DB_NAMES[NODE_ENV] || DB_NAMES.development;
};

/**
 * Get full MongoDB connection string with database name
 * @returns {string} The complete MongoDB connection string
 */
const getMongoConnectionString = () => {
  const baseUri = process.env.MONGODB_URI;
  
  if (!baseUri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }
  
  const dbName = getDatabaseName();
  
  // Handle URIs with query parameters
  if (baseUri.includes('?')) {
    // URI has query parameters
    const [uriBase, queryParams] = baseUri.split('?');
    if (uriBase.endsWith('/')) {
      return `${uriBase}${dbName}?${queryParams}`;
    } else {
      return `${uriBase}/${dbName}?${queryParams}`;
    }
  } else if (baseUri.endsWith('/')) {
    // URI ends with a slash, just append the database name
    return `${baseUri}${dbName}`;
  } else {
    // URI doesn't end with a slash, add one and then the database name
    return `${baseUri}/${dbName}`;
  }
};

/**
 * Validate database name for the current environment
 * @param {string} connectionString - The MongoDB connection string
 */
const validateDatabaseName = (connectionString) => {
  // Check if we're using the 'test' database
  const usingTestDb = connectionString.includes('/wishable_test?') || 
                      connectionString.endsWith('/wishable_test');
  
  // Check if this is a Vercel preview deployment
  const isVercelPreview = process.env.VERCEL_ENV === 'preview' || IS_VERCEL_PREVIEW;
  
  // Only validate in production (and not in Vercel preview) to prevent blocking test/preview environments
  if (usingTestDb && NODE_ENV === 'production' && !isVercelPreview) {
    const errorMessage = 'ERROR: Attempting to use the test database in production. ' +
      'This is not allowed for security and data integrity reasons. ' +
      'Please configure a proper database name using MONGODB_DB_NAME environment variable.';
    
    console.error('\x1b[31m%s\x1b[0m', errorMessage); // Red text
    throw new Error(errorMessage);
  }
  
  // Log the database being used for debugging
  console.log(`Database validation passed. Using connection string that ends with: ...${connectionString.slice(-30)}`);
  console.log(`Current environment: ${NODE_ENV}, Database name from env: ${process.env.MONGODB_DB_NAME || 'not set'}`);
  console.log(`Vercel environment: ${process.env.VERCEL_ENV || 'not set'}`);
};

// MongoDB connection options
const MONGODB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  bufferCommands: false,
  maxPoolSize: 10, // Keep a pool of connections ready
  serverSelectionTimeoutMS: 15000, // How long to try connecting before timing out (increased)
  socketTimeoutMS: 60000, // Close sockets after 60 seconds of inactivity (increased)
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true, // Enable retryable writes
  w: 'majority', // Write concern
  connectTimeoutMS: 30000, // Connection timeout (increased)
};

// Export configuration
export const dbConfig = {
  getConnectionString: () => {
    const connectionString = getMongoConnectionString();
    validateDatabaseName(connectionString);
    return connectionString;
  },
  getDatabaseName,
  options: MONGODB_OPTIONS,
  NODE_ENV,
};

export default dbConfig;