// src/utils/permissionHelper.js

const config = require('../config/config');

/**
 * Mengecek apakah sebuah JID adalah owner bot.
 * Mendukung 2 format: JID lengkap ("628xxx@s.whatsapp.net") atau nomor polos ("628xxx").
 */
function isOwner(jid) {
  if (!jid) return false;
  const number = jid.split('@')[0];
  return number === config.owner.number;
}

module.exports = { isOwner };