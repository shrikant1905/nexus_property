const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `proof-${uniqueSuffix}${ext}`);
  },
});

// Strict Image MIME Filter (Photos ONLY for Staff Completion Proofs)
const imageOnlyFilter = (req, file, cb) => {
  const allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type '${file.mimetype}'. Only JPEG, PNG, and WEBP image files are allowed for staff completion proofs.`), false);
  }
};

const photoUpload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB per photo max limit
  },
  fileFilter: imageOnlyFilter,
});

module.exports = photoUpload;
