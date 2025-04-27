const errorHandler = (err, req, res) => {
    console.error('💥 Error:', err.stack);
  
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong';
  
    res.status(statusCode).json({ message });
  };
  
  module.exports = errorHandler;
  