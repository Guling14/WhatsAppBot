// src/commands/unban.js

const { requireOwner } = require('../middleware/ownerGuard');
const { unbanUser } = require('../database/userDatabase');
const { getTargetJid } = require('../utils/groupHelper');

module.exports = {
  name: 'unban',
  description: 'Buka blokir user (khusus owner). Mention/reply target.',
  execute: requireOwner(async ({ sock, jid, parsed }) => {
    const target = getTargetJid(parsed);

    if (!target) {
      await sock.sendMessage(jid, { text: '❌ Mention atau reply user yang mau di-unban.' }, { quoted: parsed.raw });
      return;
    }

    unbanUser(target);
    await sock.sendMessage(
      jid,
      { text: `✅ @${target.split('@')[0]} sudah bisa memakai bot lagi.`, mentions: [target] },
      { quoted: parsed.raw }
    );
  }),
};
