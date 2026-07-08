// src/commands/restart.js

const { requireOwner } = require('../middleware/ownerGuard');

module.exports = {
  name: 'restart',
  description: 'Restart proses bot (khusus owner)',
  execute: requireOwner(async ({ sock, jid, parsed }) => {
    await sock.sendMessage(jid, { text: '🔄 Merestart bot, tunggu beberapa detik...' }, { quoted: parsed.raw });
    setTimeout(() => process.exit(1), 1000);
  }),
};
