// src/commands/aichat.js

const { generateChatReply } = require('../services/aiService');
const { getHistory, addExchange } = require('../database/conversationDatabase');
const { consumeLimit } = require('../database/userDatabase');
const logger = require('../utils/logger');

module.exports = {
  name: 'aichat',
  aliases: ['obrolan'],
  description: 'Chat dengan AI yang mengingat percakapan sebelumnya',
  execute: async ({ sock, jid, args, parsed }) => {
    const pesan = args.join(' ');

    if (!pesan) {
      await sock.sendMessage(
        jid,
        { text: 'Contoh: !aichat Halo, siapa namamu?' },
        { quoted: parsed.raw }
      );
      return;
    }

    const allowed = consumeLimit(parsed.sender);
    if (!allowed) {
      await sock.sendMessage(
        jid,
        { text: '❌ Limit harian kamu sudah habis. Coba lagi besok atau upgrade ke premium.' },
        { quoted: parsed.raw }
      );
      return;
    }

    try {
      const history = getHistory(parsed.sender);
      const reply = await generateChatReply(history, pesan);

      addExchange(parsed.sender, pesan, reply);

      await sock.sendMessage(jid, { text: reply }, { quoted: parsed.raw });
    } catch (err) {
      logger.error({ err }, 'Gagal memproses !aichat');
      await sock.sendMessage(
        jid,
        { text: '❌ Terjadi kesalahan saat menghubungi AI. Coba lagi nanti.' },
        { quoted: parsed.raw }
      );
    }
  },
};