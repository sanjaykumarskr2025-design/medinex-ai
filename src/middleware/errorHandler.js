/**
 * Centralized error handling middleware.
 *
 * Ensures errors returned to the client are clean, structured, and never
 * expose filesystem paths, internal stack traces, or raw database internals.
 */

import config from '../config/env.js';

export default function errorHandler(err, req, res, next) {
  // Structured log for server operators — keep sensitive data out
  console.error(`[error] ${req.method} ${req.url}:`, err.stack || err.message);

  const status = err.status || err.statusCode || 500;

  // Build safe response object
  const response = {
    error: status === 500 ? 'An internal server error occurred.' : err.message,
  };

  // Include validation details if present (e.g. from Joi)
  if (err.details && Array.isArray(err.details)) {
    response.details = err.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
  }

  // Include safe debugging info only in explicit development mode
  if (config.isDev() && status === 500) {
    response.debug = err.message;
  }

  res.status(status).json(response);
}
