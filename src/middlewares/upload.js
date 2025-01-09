const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
    const dirs = ['uploads/faces', 'uploads/images', 'uploads/videos'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

createUploadDirs();

// Configure storage for face images
const faceStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/faces');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'face-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure storage for media files
const mediaStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isVideo = file.mimetype.startsWith('video/');
        const uploadPath = isVideo ? 'uploads/videos' : 'uploads/images';
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for face images
const faceFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed for face images.'), false);
    }
};

// File filter for media
const mediaFilter = (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    
    if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
    }
};

// Create multer instances
const faceUpload = multer({
    storage: faceStorage,
    fileFilter: faceFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit for face images
    }
});

const mediaUpload = multer({
    storage: mediaStorage,
    fileFilter: mediaFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit for media files
    }
});

// Export middleware
exports.uploadFace = faceUpload.single('faceImage');
exports.uploadMedia = mediaUpload.single('media'); 