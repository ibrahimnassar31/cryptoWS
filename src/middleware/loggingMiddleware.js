import logger from '../utils/logger.js';


export const requestLogger = (req, res, next) => {
  req._startTime = Date.now();

  const originalEnd = res.end;

  res.end = function(chunk, encoding) {
    res._responseTime = Date.now() - req._startTime;

    logger.httpRequest(req, res);

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Request body sanitization middleware
 * Removes sensitive information from request bodies for logging
 */
export const sanitizeRequestBody = (req, res, next) => {
  if (req.body) {
    // Create a shallow copy of the request body
    req.rawBody = { ...req.body };

    // Remove sensitive fields if they exist
    if (req.body.password) req.body.password = '[FILTERED]';
    if (req.body.token) req.body.token = '[FILTERED]';
    if (req.body.secret) req.body.secret = '[FILTERED]';
    if (req.body.apiKey) req.body.apiKey = '[FILTERED]';
  }

  next();
};


export const errorLogger = (err, req, res, next) => {
  logger.apiError(err, req);

  next(err);
};
