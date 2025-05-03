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
 * Validate that we're not using the 'test' database in production
 * @param {string} connectionString - The MongoDB connection string
 */
const validateDatabaseName = (connectionString) => {
  // Check if we're using the 'test' database
  const usingTestDb = connectionString.includes('/wishable_test?') || 
                      connectionString.endsWith('/wishable_test');
  
  if (usingTestDb && NODE_ENV === 'production') {
    const errorMessage = 'ERROR: Attempting to use the test database in production. ' +
      'This is not allowed for security and data integrity reasons. ' +
      'Please configure a proper database name using MONGODB_DB_NAME environment variable.';
    
    console.error('\x1b[31m%s\x1b[0m', errorMessage); // Red text
    throw new Error(errorMessage);
  }
};

// MongoDB connection options
const MONGODB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  bufferCommands: false,
  maxPoolSize: 10, // Keep a pool of connections ready
  serverSelectionTimeoutMS: 10000, // How long to try connecting before timing out
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
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