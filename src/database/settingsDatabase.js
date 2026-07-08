// src/database/settingsDatabase.js

const JsonDatabase = require('./jsonDatabase');

const db = new JsonDatabase('settings');

function isMaintenanceMode() {
  return db.get('maintenanceMode', false);
}

function setMaintenanceMode(value) {
  db.set('maintenanceMode', Boolean(value));
  return Boolean(value);
}

module.exports = { isMaintenanceMode, setMaintenanceMode };
