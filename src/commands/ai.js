// src/commands/ai.js

const { askGemini } = require('../services/aiService');

module.exports = {
  name: 'ai',
  aliases: ['ask', 'chat'],
  description: 'Tanya apa saja ke AI (Gemini)',
  execute: async ({ sock, jid, args, parsed }) => {
    const prompt = args.join(' ').trim();

    if (!prompt) {
      await sock.sendMessage(
        jid,
        { text: '❌ Tulis pertanyaannya juga ya.\nContoh: !ai jelaskan apa itu closure di javascript' },
        { quoted: parsed.raw }
      );
      return;
    }

    try {
      await sock.sendPresenceUpdate('composing', jid);
      const answer = await askGemini(prompt);
      await sock.sendMessage(jid, { text: answer }, { quoted: parsed.raw });
    } catch (err) {
      await sock.sendMessage(jid, { text: `⚠️ ${err.message}` }, { quoted: parsed.raw });
    }
  },
};
