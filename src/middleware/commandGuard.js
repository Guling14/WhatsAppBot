// src/middleware/commandGuard.js

const { isAdmin, isBotAdmin } = require('../utils/groupHelper');

/**
 * Higher-order function untuk command grup yang butuh:
 * 1. Dijalankan di dalam grup
 * 2. Sender adalah admin
 * 3. Bot adalah admin
 *
 * Membungkus fungsi `execute` asli command, jadi tiap command tinggal
 * fokus ke logic-nya sendiri tanpa mengulang 3 pengecekan yang sama.
 *
 * Pemakaian:
 *   execute: requireGroupAdmin(async ({ sock, jid, parsed }) => {
 *     // di titik ini sudah pasti: grup + sender admin + bot admin
 *   })
 */
function requireGroupAdmin(handler) {
  return async (ctx) => {
    const { sock, jid, parsed } = ctx;

    if (!parsed.isGroup) {
      await sock.sendMessage(jid, { text: '❌ Command ini hanya untuk grup.' }, { quoted: parsed.raw });
      return;
    }

    const senderIsAdmin = await isAdmin(sock, jid, parsed.sender);
    if (!senderIsAdmin) {
      await sock.sendMessage(jid, { text: '❌ Hanya admin yang bisa menggunakan command ini.' }, { quoted: parsed.raw });
      return;
    }

    const botIsAdmin = await isBotAdmin(sock, jid);
    if (!botIsAdmin) {
      await sock.sendMessage(jid, { text: '❌ Bot harus menjadi admin untuk melakukan ini.' }, { quoted: parsed.raw });
      return;
    }

    return handler(ctx);
  };
}

module.exports = { requireGroupAdmin };
