const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/s3');

let storage;
if (process.env.NODE_ENV === 'production') {
    storage = multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: 'public-read',
        key: (req, file, cb) => {
            cb(null, `uploads/${Date.now()}-${file.originalname}`);
        }
    });
} else {
    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    });
}

const upload = multer({ storage: storage });

module.exports = upload;