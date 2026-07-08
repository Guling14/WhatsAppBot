// src/database/conversationDatabase.js

const JsonDatabase = require('./jsonDatabase');

const db = new JsonDatabase('conversations');

const MAX_HISTORY = 10; // maksimal 10 pasang (user+AI) disimpan, supaya tidak boros token

/**
 * Mengambil riwayat percakapan seorang user. Array kosong jika belum pernah chat.
 */
function getHistory(jid) {
  return db.get(jid, []);
}

/**
 * Menambahkan 1 pasang pertukaran (pesan user + balasan AI) ke riwayat.
 * Otomatis memangkas riwayat lama jika sudah melebihi MAX_HISTORY.
 */
function addExchange(jid, userMessage, aiReply) {
  const history = getHistory(jid);

  history.push({ role: 'user', text: userMessage });
  history.push({ role: 'model', text: aiReply });

  // Simpan hanya MAX_HISTORY pasang terakhir (setiap pasang = 2 entri)
  const trimmed = history.slice(-MAX_HISTORY * 2);

  db.set(jid, trimmed);
  return trimmed;
}

/**
 * Menghapus seluruh riwayat percakapan seorang user.
 */
function clearHistory(jid) {
  db.set(jid, []);
}

module.exports = { getHistory, addExchange, clearHistory };