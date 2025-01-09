const multer = require('multer');
const path = require('path');

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

// Configure storage for media (posts)
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

// File filters
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed for face verification'), false);
  }
};

const mediaFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

// Create multer instances
const faceUpload = multer({
  storage: faceStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for face images
  }
});

const mediaUpload = multer({
  storage: mediaStorage,
  fileFilter: mediaFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for media
  }
});

// Export middleware
exports.uploadFaceImage = faceUpload.single('faceImage');
exports.uploadMedia = mediaUpload.single('media'); 