// src/database/groupSettings.js

const JsonDatabase = require('./jsonDatabase');

const db = new JsonDatabase('groups');

const DEFAULT_SETTINGS = {
  antiLink: false,
  antiSpam: false,
  antiToxic: false,
  welcome: true,
};

/**
 * Mengambil pengaturan sebuah grup. Jika belum ada, buat & simpan default baru.
 */
function getSettings(groupId) {
  if (!db.has(groupId)) {
    db.set(groupId, { ...DEFAULT_SETTINGS });
  }
  return db.get(groupId);
}

/**
 * Mengubah satu pengaturan tertentu untuk sebuah grup, lalu simpan permanen.
 */
function updateSetting(groupId, key, value) {
  const current = getSettings(groupId);
  current[key] = value;
  db.set(groupId, current);
  return current;
}

module.exports = { getSettings, updateSetting };