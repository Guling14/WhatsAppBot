// src/commands/demote.js

const { requireGroupAdmin } = require('../middleware/commandGuard');
const { getTargetJid } = require('../utils/groupHelper');

module.exports = {
  name: 'demote',
  description: 'Menurunkan admin menjadi member biasa (khusus admin)',
  execute: requireGroupAdmin(async ({ sock, jid, parsed }) => {
    const target = getTargetJid(parsed);
    if (!target) {
      await sock.sendMessage(jid, { text: '❌ Mention atau reply orang yang ingin diturunkan dari admin.' }, { quoted: parsed.raw });
      return;
    }

    await sock.groupParticipantsUpdate(jid, [target], 'demote');
    await sock.sendMessage(jid, { text: `⬇️ @${target.split('@')[0]} sudah bukan admin lagi.`, mentions: [target] });
  }),
};
