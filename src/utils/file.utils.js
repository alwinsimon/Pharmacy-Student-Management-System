// src/utils/file.utils.js
const fs = require('fs').promises;
const path = require('path');
const { app: { upload: uploadConfig } } = require('../config');

/**
 * Move file from temporary location to destination
 * @param {String} tempPath - Temporary file path
 * @param {String} destinationDir - Destination directory
 * @param {String} filename - New filename
 * @returns {Promise<String>} New file path
 */
const moveFile = async (tempPath, destinationDir, filename) => {
  const destPath = path.join(uploadConfig.destination, destinationDir, filename);
  const destDir = path.dirname(destPath);
  
  // Ensure destination directory exists
  await fs.mkdir(destDir, { recursive: true });
  
  // Move file
  await fs.rename(tempPath, destPath);
  
  return path.join(destinationDir, filename);
};

/**
 * Delete file
 * @param {String} filePath - File path
 * @returns {Promise<Boolean>} Delete success
 */
const deleteFile = async (filePath) => {
  try {
    const fullPath = path.join(uploadConfig.destination, filePath);
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, consider it deleted
      return true;
    }
    throw error;
  }
};

/**
 * Get file size
 * @param {String} filePath - File path
 * @returns {Promise<Number>} File size in bytes
 */
const getFileSize = async (filePath) => {
  const fullPath = path.join(uploadConfig.destination, filePath);
  const stats = await fs.stat(fullPath);
  return stats.size;
};

/**
 * Check if file exists
 * @param {String} filePath - File path
 * @returns {Promise<Boolean>} File exists
 */
const fileExists = async (filePath) => {
  try {
    const fullPath = path.join(uploadConfig.destination, filePath);
    await fs.access(fullPath);
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  moveFile,
  deleteFile,
  getFileSize,
  fileExists
};