// src/commands/transfer.js

const { transferBalance } = require('../database/userDatabase');
const { getTargetJid } = require('../utils/groupHelper');

module.exports = {
  name: 'transfer',
  aliases: ['give', 'kirim'],
  description: 'Transfer koin ke user lain. Mention/reply target + nominal.\nContoh: !transfer @628xxx 1000',
  execute: async ({ sock, jid, args, parsed }) => {
    const target = getTargetJid(parsed);
    const amountArg = args.find((a) => /^\d+$/.test(a));
    const amount = amountArg ? parseInt(amountArg, 10) : null;

    if (!target || !amount) {
      await sock.sendMessage(
        jid,
        { text: '❌ Format salah.\nContoh: !transfer @628xxx 1000\n(atau reply pesan orangnya lalu ketik: !transfer 1000)' },
        { quoted: parsed.raw }
      );
      return;
    }

    try {
      const result = transferBalance(parsed.sender, target, amount);
      await sock.sendMessage(
        jid,
        {
          text: `✅ Berhasil transfer ${amount.toLocaleString('id-ID')} koin ke @${target.split('@')[0]}.\n💳 Saldo kamu sekarang: ${result.senderBalance.toLocaleString('id-ID')} koin`,
          mentions: [target],
        },
        { quoted: parsed.raw }
      );
    } catch (err) {
      await sock.sendMessage(jid, { text: `❌ ${err.message}` }, { quoted: parsed.raw });
    }
  },
};
