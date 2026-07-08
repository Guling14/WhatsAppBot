// src/commands/leaderboard.js

const { getLeaderboard } = require('../database/userDatabase');

module.exports = {
  name: 'leaderboard',
  aliases: ['lb', 'top', 'rank'],
  description: 'Lihat ranking top user. !leaderboard [level|coin]',
  execute: async ({ sock, jid, args, parsed }) => {
    const type = args[0]?.toLowerCase() === 'level' ? 'level' : 'balance';
    const top = getLeaderboard(type, 10);

    if (top.length === 0) {
      await sock.sendMessage(jid, { text: 'Belum ada data user.' }, { quoted: parsed.raw });
      return;
    }

    const medals = ['🥇', '🥈', '🥉'];
    const lines = top.map((user, i) => {
      const medal = medals[i] || `${i + 1}.`;
      const value =
        type === 'level'
          ? `Level ${user.level} (${user.exp} exp)`
          : `${user.balance.toLocaleString('id-ID')} koin`;
      return `${medal} ${user.name} — ${value}`;
    });

    const title = type === 'level' ? '📊 Leaderboard Level' : '💰 Leaderboard Koin';
    const text = `${title}\n\n${lines.join('\n')}\n\nKetik !leaderboard level untuk ranking berdasarkan level.`;

    await sock.sendMessage(jid, { text }, { quoted: parsed.raw });
  },
};
