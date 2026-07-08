// src/commands/shop.js

const SHOP_ITEMS = require('../config/shopItems');

module.exports = {
  name: 'shop',
  aliases: ['toko'],
  description: 'Lihat daftar item yang bisa dibeli',
  execute: async ({ sock, jid, parsed }) => {
    const lines = SHOP_ITEMS.map(
      (item) => `${item.name}\n  ID: \`${item.id}\` — ${item.price.toLocaleString('id-ID')} koin\n  ${item.description}`
    );

    const text = `🛒 *Shop*\n\n${lines.join('\n\n')}\n\nBeli dengan: !buy <id>\nContoh: !buy xp_boost`;

    await sock.sendMessage(jid, { text }, { quoted: parsed.raw });
  },
};
