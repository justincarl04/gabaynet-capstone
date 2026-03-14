const winston = require('winston');

const transportList = [];
const isProd = process.env.NODE_ENV === 'production';

// Always log to console in AWS Lambda (CloudWatch) and local environments.
transportList.push(new winston.transports.Console({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  )
}));

// Local development: also persist logs to disk.
if (!isProd) {
  transportList.push(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));
  transportList.push(new winston.transports.File({ filename: 'logs/combined.log' }));
}

const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  transports: transportList
});

if (!isProd) {
  logger.exceptions.handle(
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  );
}

module.exports = logger;