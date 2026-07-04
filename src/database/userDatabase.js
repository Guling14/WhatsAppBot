// src/database/userDatabase.js

const JsonDatabase = require('./jsonDatabase');

const db = new JsonDatabase('users');

/**
 * Skema default untuk user baru.
 * Mencakup semua kebutuhan: premium, limit, level/exp, AFK, economy.
 */
function createDefaultUser(jid, pushName) {
  return {
    jid,
    name: pushName || 'Unknown',
    isPremium: false,
    premiumUntil: null, // timestamp kapan premium berakhir, null = tidak premium
    isBanned: false,
    limit: 25, // jatah pemakaian fitur terbatas (misal !ai) per hari
    limitResetAt: getNextMidnight(),
    level: 1,
    exp: 0,
    balance: 0, // untuk fitur economy
    isAfk: false,
    afkReason: null,
    afkSince: null,
    registeredAt: Date.now(),
  };
}

/**
 * Menghitung timestamp tengah malam berikutnya, dipakai untuk reset limit harian.
 */
function getNextMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}

/**
 * Mengambil data user. Jika belum terdaftar, otomatis daftarkan dengan data default.
 */
function getUser(jid, pushName) {
  if (!db.has(jid)) {
    db.set(jid, createDefaultUser(jid, pushName));
  }

  const user = db.get(jid);

  // Reset limit otomatis jika sudah lewat tengah malam
  if (Date.now() >= user.limitResetAt) {
    user.limit = 25;
    user.limitResetAt = getNextMidnight();
    db.set(jid, user);
  }

  return user;
}

/**
 * Memperbarui sebagian data user (partial update).
 */
function updateUser(jid, partialData) {
  const user = getUser(jid);
  const updated = { ...user, ...partialData };
  db.set(jid, updated);
  return updated;
}

/**
 * Mengurangi limit user sebanyak 1 (dipanggil setiap fitur terbatas dipakai).
 * Mengembalikan false jika limit sudah habis.
 */
function consumeLimit(jid) {
  const user = getUser(jid);
  if (user.isPremium) return true; // user premium tidak terkena limit
  if (user.limit <= 0) return false;

  updateUser(jid, { limit: user.limit - 1 });
  return true;
}

module.exports = { getUser, updateUser, consumeLimit, createDefaultUser };