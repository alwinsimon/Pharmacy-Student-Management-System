// src/constants/index.js
const roleConstants = require('./roles.constants');
const permissionConstants = require('./permissions.constants');
const statusConstants = require('./status.constants');
const errorConstants = require('./error.constants');
const fileConstants = require('./file.constants');

module.exports = {
  roles: roleConstants,
  permissions: permissionConstants,
  status: statusConstants,
  errors: errorConstants,
  files: fileConstants
};