const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");

async function uploadFile(file) {
  const key = `uploads/${Date.now()}-${file.originalname}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    })
  );

  return key;
}

module.exports = uploadFile;