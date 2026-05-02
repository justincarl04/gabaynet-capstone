const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = process.env.NODE_ENV || 'development';

const config = {
  env,
  isProduction: env === 'production',
  isDevelopment: env === 'development',
  port: Number(process.env.PORT) || 5000,
  storageDriver: process.env.STORAGE_DRIVER || (env === 'production' ? 's3' : 'local'),
  db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    name: process.env.DB_NAME,
    pass: process.env.DB_PASS,
    port: Number(process.env.DB_PORT) || 5432,
    ssl: env === 'production',
  },
  aws: {
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET_NAME,
    accessKey: process.env.AWS_ACCESS_KEY,
    secretKey: process.env.AWS_SECRET_KEY,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
};
module.exports = config;