const serverless = require('serverless-http');
const { loadSecrets } = require('.src/config/secrets');
const app = require('./src/app');

let handler;
module.exports.handler = async (event, context) => {
    if (!handler) {
        await loadSecrets();
        handler = serverless(app);
    }
    return handler(event, context);
};