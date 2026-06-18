'use strict';

// Catalyst DATETIME columns reject ISO 8601 ("datetime value expected").
// Mandatory format: "YYYY-MM-DD HH:MM:SS". Never use toISOString() on
// insert/update paths.
function nowDatetime(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} `
    + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// Catalyst has no native TIME type; times persist as DATETIME (often
// "1970-01-01 09:00:00"). Extracts "HH:MM" from a full datetime,
// "HH:MM:SS", "HH:MM" or an epoch number.
function toHM(value) {
  if (value == null || value === '') return '';
  if (typeof value === 'number') {
    const d = new Date(value);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  const match = String(value).match(/(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2, '0')}:${match[2]}` : '';
}

module.exports = { nowDatetime, toHM };
