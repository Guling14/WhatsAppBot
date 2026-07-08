// src/commands/addprem.js

const { requireOwner } = require('../middleware/ownerGuard');
const { addPremium } = require('../database/userDatabase');
const { getTargetJid } = require('../utils/groupHelper');

module.exports = {
  name: 'addprem',
  description: 'Tambah status premium ke user (khusus owner). !addprem @user <hari>',
  execute: requireOwner(async ({ sock, jid, args, parsed }) => {
    const target = getTargetJid(parsed);
    const daysArg = args.find((a) => /^\d+$/.test(a));
    const days = daysArg ? parseInt(daysArg, 10) : 30;

    if (!target) {
      await sock.sendMessage(
        jid,
        { text: '❌ Mention atau reply user yang mau dijadikan premium.\nContoh: !addprem @628xxx 30' },
        { quoted: parsed.raw }
      );
      return;
    }

    const user = addPremium(target, days);
    const untilStr = new Date(user.premiumUntil).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    await sock.sendMessage(
      jid,
      { text: `✅ @${target.split('@')[0]} sekarang premium sampai *${untilStr}* (+${days} hari).`, mentions: [target] },
      { quoted: parsed.raw }
    );
  }),
};
