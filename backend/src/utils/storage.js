const s3Upload = require('./s3Upload');
const localUpload = require('./localUpload');
const s3SignedUrl = require('./s3SignedUrl');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

async function uploadFile(file) {
    if (isProd) {
        return await s3Upload.uploadFile(file);
    } else {
        return await localUpload.uploadFile(file);
    }
}

async function getSignedUrl(filename) {
    if (isProd) {
        return await s3SignedUrl(filename);
    } else {
        return path.join(__dirname, `../uploads/${filename}`);
    }
}

async function deleteFile(filename) {
    if (isProd) {
        await s3Upload.deleteFile(filename);
    } else {
        await localUpload.deleteFile(filename);
    }
}

module.exports = {
    uploadFile,
    getSignedUrl,
    deleteFile
};