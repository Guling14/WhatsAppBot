// src/commands/ping.js

module.exports = {
  name: 'ping',
  aliases: ['p'],
  description: 'Mengecek kecepatan respon bot',
  execute: async ({ sock, jid, parsed }) => {
    const start = Date.now();
    const sent = await sock.sendMessage(jid, { text: '🏓 Pong...' });
    const latency = Date.now() - start;

    await sock.sendMessage(
      jid,
      { text: `🏓 Pong! ${latency}ms` },
      { quoted: parsed.raw }
    );
  },
};