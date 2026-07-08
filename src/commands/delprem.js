// src/commands/delprem.js

const { requireOwner } = require('../middleware/ownerGuard');
const { delPremium } = require('../database/userDatabase');
const { getTargetJid } = require('../utils/groupHelper');

module.exports = {
  name: 'delprem',
  description: 'Cabut status premium user (khusus owner). Mention/reply target.',
  execute: requireOwner(async ({ sock, jid, parsed }) => {
    const target = getTargetJid(parsed);

    if (!target) {
      await sock.sendMessage(jid, { text: '❌ Mention atau reply user yang mau dicabut premium-nya.' }, { quoted: parsed.raw });
      return;
    }

    delPremium(target);
    await sock.sendMessage(
      jid,
      { text: `✅ Status premium @${target.split('@')[0]} sudah dicabut.`, mentions: [target] },
      { quoted: parsed.raw }
    );
  }),
};
