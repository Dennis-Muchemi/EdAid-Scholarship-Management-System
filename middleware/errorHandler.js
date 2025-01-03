const multer = require('multer');

const errorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File size exceeds limit'
            });
        }
    }
    
    if (err.message === 'Invalid file type') {
        return res.status(400).json({
            error: 'File type not allowed'
        });
    }
    
    next(err);
};

module.exports = errorHandler;