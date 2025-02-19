//===error handler====//

exports.errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!isProduction) {
    console.error(err.stack);  // Log the stack trace in development
  }

  const response = {
    error: message,
  };

  if (!isProduction) {
    response.stack = err.stack;  // Include the stack trace only in development
  }

  res.status(status).send(response);
};
