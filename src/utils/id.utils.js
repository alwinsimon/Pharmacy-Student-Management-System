// src/utils/id.utils.js
const { nanoid } = require('nanoid');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a short ID for URLs and codes
 * @param {Number} length - ID length
 * @returns {String} Short ID
 */
const generateShortId = (length = 10) => {
  return nanoid(length);
};

/**
 * Generate a UUID
 * @returns {String} UUID
 */
const generateUuid = () => {
  return uuidv4();
};

/**
 * Generate a reference number with prefix
 * @param {String} prefix - Reference number prefix
 * @param {Number} paddedLength - Length to pad with zeros
 * @returns {String} Reference number
 */
const generateReferenceNumber = (prefix, paddedLength = 6) => {
  const randomPart = Math.floor(Math.random() * Math.pow(10, paddedLength))
    .toString()
    .padStart(paddedLength, '0');
  
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  return `${prefix}${year}${month}-${randomPart}`;
};

/**
 * Generate a request ID
 * @returns {String} Request ID
 */
const generateRequestId = () => {
  return `req-${Date.now()}-${nanoid(6)}`;
};

module.exports = {
  generateShortId,
  generateUuid,
  generateReferenceNumber,
  generateRequestId
};