// src/utils/commandParser.js

const config = require('../config/config');

/**
 * Mengecek apakah sebuah teks diawali salah satu prefix yang terdaftar.
 * Mengembalikan prefix yang cocok, atau null jika tidak ada yang cocok.
 */
function getMatchingPrefix(text) {
  if (!text) return null;
  return config.bot.prefix.find((p) => text.startsWith(p)) || null;
}

/**
 * Memecah teks pesan menjadi { commandName, args }
 * Contoh: "!ban 628123 spam berulang"
 * → { commandName: 'ban', args: ['628123', 'spam', 'berulang'] }
 */
function parseCommand(text) {
  const prefix = getMatchingPrefix(text);
  if (!prefix) return null;

  // Buang prefix, lalu pecah berdasarkan spasi
  const withoutPrefix = text.slice(prefix.length).trim();
  const parts = withoutPrefix.split(/\s+/);

  const commandName = parts[0]?.toLowerCase();
  const args = parts.slice(1);

  if (!commandName) return null;

  return { prefix, commandName, args };
}

module.exports = { getMatchingPrefix, parseCommand };