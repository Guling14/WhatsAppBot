// src/commands/buy.js

const { buyItem } = require('../database/userDatabase');

module.exports = {
  name: 'buy',
  aliases: ['beli'],
  description: 'Beli item dari shop. Contoh: !buy xp_boost',
  execute: async ({ sock, jid, args, parsed }) => {
    const itemId = args[0]?.toLowerCase();

    if (!itemId) {
      await sock.sendMessage(
        jid,
        { text: '❌ Tulis ID item yang mau dibeli.\nContoh: !buy xp_boost\nKetik !shop untuk lihat daftar item.' },
        { quoted: parsed.raw }
      );
      return;
    }

    try {
      const { item, user } = buyItem(parsed.sender, itemId);
      await sock.sendMessage(
        jid,
        { text: `✅ Berhasil membeli *${item.name}*!\n💳 Saldo sekarang: ${user.balance.toLocaleString('id-ID')} koin` },
        { quoted: parsed.raw }
      );
    } catch (err) {
      await sock.sendMessage(jid, { text: `❌ ${err.message}` }, { quoted: parsed.raw });
    }
  },
};
