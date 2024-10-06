const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const multer = require('multer');

// Initialize S3 Client (AWS SDK v3)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

// Setup Multer with S3 Storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    // No ACL needed here since the bucket policy controls access
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname); // Filename
    }
  })
});

module.exports = upload;
