// Serverless wrapper for the Express app using serverless-http
const serverless = require('serverless-http');
const { app } = require('../server/app');

module.exports = serverless(app);
