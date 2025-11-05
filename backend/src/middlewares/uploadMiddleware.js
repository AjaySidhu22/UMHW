// \backend\src\middlewares\uploadMiddleware.js

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// 1. Define storage settings
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Destination is the 'uploads' folder relative to the backend root (where index.js is)
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Create a unique filename: <random_string>-<timestamp>.<ext>
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});

// 2. Define file filter (Optional, but recommended for security/control)
const fileFilter = (req, file, cb) => {
    // Accept common image/document file types
    if (
        file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/png' || 
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' || // for .doc
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // for .docx
    ) {
        cb(null, true); // Accept file
    } else {
        // Reject file and pass an error
        cb(new Error('Invalid file type. Only JPEG, PNG, DOC, DOCX, and PDF files are allowed.'), false);
    }
};


// 3. Initialize multer upload instance
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Max 5MB file size limit
    },
    fileFilter: fileFilter
});

// We export the configured upload object
module.exports = upload;