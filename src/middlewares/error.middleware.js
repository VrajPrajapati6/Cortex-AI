import { ApiError } from '../utils/apiError.js';
import { config } from '../config/env.config.js';

export const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route not found - ${req.originalUrl}`);
  next(error);
};

export const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [];

  const response = {
    success: false,
    statusCode,
    message,
    ...(errors.length > 0 && { errors }),
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  };

  res.status(statusCode).json(response);
};
