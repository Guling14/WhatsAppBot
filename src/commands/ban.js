// src/commands/ban.js

const { requireOwner } = require('../middleware/ownerGuard');
const { banUser } = require('../database/userDatabase');
const { getTargetJid } = require('../utils/groupHelper');

module.exports = {
  name: 'ban',
  description: 'Blokir user dari memakai bot (khusus owner). Mention/reply target.',
  execute: requireOwner(async ({ sock, jid, parsed }) => {
    const target = getTargetJid(parsed);

    if (!target) {
      await sock.sendMessage(jid, { text: '❌ Mention atau reply user yang mau diban.' }, { quoted: parsed.raw });
      return;
    }

    banUser(target);
    await sock.sendMessage(
      jid,
      { text: `🚫 @${target.split('@')[0]} sekarang diblokir dari bot.`, mentions: [target] },
      { quoted: parsed.raw }
    );
  }),
};
