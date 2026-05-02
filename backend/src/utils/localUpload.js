const fs = require('fs');
const path = require('path');

async function uploadFile(file) {
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
  
  const filename = `${Date.now()}-${file.originalname}`;
  fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
  return filename;
}

async function deleteFile(filename) {
  const filePath = path.join(__dirname, '../../uploads', filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

module.exports = {
  uploadFile,
  deleteFile
};