// Basic error handling middleware for Express.js applications
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    message: err.message || 'An error occurred',
    error:
      process.env.NODE_ENV === 'production'
        ? {}
        : {
            message: err.message,
            name: err.name,
            stack: err.stack,
          },
  });
};