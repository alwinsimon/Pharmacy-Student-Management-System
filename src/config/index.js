// src/config/index.js
const appConfig = require('./app.config');
const authConfig = require('./auth.config');
const databaseConfig = require('./database.config');
const loggerConfig = require('./logger.config');
const emailConfig = require('./email.config');

module.exports = {
  app: appConfig,
  auth: authConfig,
  database: databaseConfig,
  logger: loggerConfig,
  email: emailConfig
};