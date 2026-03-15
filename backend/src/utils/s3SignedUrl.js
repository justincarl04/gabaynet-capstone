const { GetObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
const s3 = require('../config/s3');

async function generateSignedUrl(key) {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
    });

    return await getSignedUrl(s3, command, { expiresIn: 300 });
}

module.exports = generateSignedUrl;