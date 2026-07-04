// src/commands/kick.js

const { requireGroupAdmin } = require('../middleware/commandGuard');
const { getTargetJid } = require('../utils/groupHelper');

module.exports = {
  name: 'kick',
  description: 'Mengeluarkan member dari grup (khusus admin)',
  execute: requireGroupAdmin(async ({ sock, jid, parsed }) => {
    const target = getTargetJid(parsed);
    if (!target) {
      await sock.sendMessage(
        jid,
        { text: '❌ Mention atau reply pesan orang yang ingin dikeluarkan.\nContoh: !kick @628xxx' },
        { quoted: parsed.raw }
      );
      return;
    }

    await sock.groupParticipantsUpdate(jid, [target], 'remove');
    await sock.sendMessage(jid, { text: `✅ Berhasil mengeluarkan @${target.split('@')[0]}`, mentions: [target] });
  }),
};
