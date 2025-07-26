
import crypto from 'crypto';

/**
 * Creates a hash of a query object for caching purposes
 * @param {Object} query - The query object to hash
 * @returns {string} - MD5 hash of the stringified query
 */
export const createQueryHash = (query) => {
  return crypto.createHash('md5').update(JSON.stringify(query)).digest('hex');
};

/**
 * Creates cache key with appropriate prefix
 * @param {string} prefix - Cache key prefix 
 * @param {string} identifier - Unique identifier
 * @returns {string} - Formatted cache key
 */
export const createCacheKey = (prefix, identifier) => {
  return `${prefix}:${identifier}`;
};

/**
 * Formats error response for consistent API error handling
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} - Formatted error object
 */
export const formatErrorResponse = (message, statusCode = 500) => {
  return {
    error: message,
    status: statusCode
  };
};

/**
 * Creates pagination metadata from query and results
 * @param {Object} query - Request query parameters
 * @param {number} total - Total count of items
 * @returns {Object} - Pagination metadata
 */
export const createPaginationMeta = (query, total) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
};
