// src/commands/warning.js

const { requireOwner } = require('../middleware/ownerGuard');
const { addWarning, WARNING_LIMIT } = require('../database/userDatabase');
const { getTargetJid } = require('../utils/groupHelper');

module.exports = {
  name: 'warning',
  aliases: ['warn'],
  description: `Beri peringatan ke user. Otomatis diban di peringatan ke-${WARNING_LIMIT}. !warning @user [alasan]`,
  execute: requireOwner(async ({ sock, jid, args, parsed }) => {
    const target = getTargetJid(parsed);

    if (!target) {
      await sock.sendMessage(jid, { text: '❌ Mention atau reply user yang mau diperingatkan.' }, { quoted: parsed.raw });
      return;
    }

    const reason = args.filter((a) => !a.startsWith('@')).join(' ') || 'Tidak ada alasan';
    const { warningCount, autoBanned } = addWarning(target);

    let text = `⚠️ @${target.split('@')[0]} mendapat peringatan (${warningCount}/${WARNING_LIMIT}).\nAlasan: ${reason}`;
    if (autoBanned) {
      text += `\n\n🚫 Batas peringatan tercapai, user otomatis diblokir dari bot.`;
    }

    await sock.sendMessage(jid, { text, mentions: [target] }, { quoted: parsed.raw });
  }),
};
