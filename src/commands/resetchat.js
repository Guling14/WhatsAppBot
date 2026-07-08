// src/commands/resetchat.js

const { clearHistory } = require('../database/conversationDatabase');

module.exports = {
  name: 'resetchat',
  aliases: ['lupakan'],
  description: 'Menghapus riwayat percakapan AI kamu',
  execute: async ({ sock, jid, parsed }) => {
    clearHistory(parsed.sender);
    await sock.sendMessage(
      jid,
      { text: '🗑️ Riwayat percakapan kamu sudah dihapus. Mulai obrolan baru!' },
      { quoted: parsed.raw }
    );
  },
};