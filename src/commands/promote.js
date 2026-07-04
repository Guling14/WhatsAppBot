// src/commands/promote.js

const { requireGroupAdmin } = require('../middleware/commandGuard');
const { getTargetJid } = require('../utils/groupHelper');

module.exports = {
  name: 'promote',
  description: 'Menjadikan member sebagai admin (khusus admin)',
  execute: requireGroupAdmin(async ({ sock, jid, parsed }) => {
    const target = getTargetJid(parsed);
    if (!target) {
      await sock.sendMessage(jid, { text: '❌ Mention atau reply orang yang ingin dijadikan admin.' }, { quoted: parsed.raw });
      return;
    }

    await sock.groupParticipantsUpdate(jid, [target], 'promote');
    await sock.sendMessage(jid, { text: `⬆️ @${target.split('@')[0]} sekarang admin.`, mentions: [target] });
  }),
};
