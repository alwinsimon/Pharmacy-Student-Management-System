// src/utils/date.utils.js
const moment = require('moment');

/**
 * Format date to string
 * @param {Date|String} date - Date to format
 * @param {String} format - Format string
 * @returns {String} Formatted date
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  return moment(date).format(format);
};

/**
 * Format date with time
 * @param {Date|String} date - Date to format
 * @returns {String} Formatted date with time
 */
const formatDateTime = (date) => {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

/**
 * Get date difference in days
 * @param {Date|String} startDate - Start date
 * @param {Date|String} endDate - End date
 * @returns {Number} Difference in days
 */
const getDaysDifference = (startDate, endDate) => {
  return moment(endDate).diff(moment(startDate), 'days');
};

/**
 * Add days to date
 * @param {Date|String} date - Base date
 * @param {Number} days - Days to add
 * @returns {Date} New date
 */
const addDays = (date, days) => {
  return moment(date).add(days, 'days').toDate();
};

/**
 * Check if date is in the future
 * @param {Date|String} date - Date to check
 * @returns {Boolean} Is date in the future
 */
const isFutureDate = (date) => {
  return moment(date).isAfter(moment());
};

/**
 * Get start of month
 * @param {Date|String} date - Date
 * @returns {Date} Start of month
 */
const getStartOfMonth = (date) => {
  return moment(date).startOf('month').toDate();
};

/**
 * Get end of month
 * @param {Date|String} date - Date
 * @returns {Date} End of month
 */
const getEndOfMonth = (date) => {
  return moment(date).endOf('month').toDate();
};

module.exports = {
  formatDate,
  formatDateTime,
  getDaysDifference,
  addDays,
  isFutureDate,
  getStartOfMonth,
  getEndOfMonth
};