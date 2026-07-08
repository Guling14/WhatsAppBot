// src/commands/balance.js

const { getUser, expNeededForLevel } = require('../database/userDatabase');

module.exports = {
  name: 'balance',
  aliases: ['bal', 'saldo', 'profile'],
  description: 'Cek saldo, level, dan progress exp kamu',
  execute: async ({ sock, jid, parsed }) => {
    const user = getUser(parsed.sender, parsed.pushName);
    const needed = expNeededForLevel(user.level);
    const inventory = user.inventory || [];
    const badges = inventory
      .filter((id) => id.startsWith('badge_'))
      .map((id) => (id === 'badge_sultan' ? '👑' : '🌟'))
      .join(' ');

    const isBoosted = user.xpBoostUntil && user.xpBoostUntil > Date.now();

    const text = [
      `👤 *Profil ${user.name}* ${badges}`,
      ``,
      `📊 Level: ${user.level}`,
      `✨ Exp: ${user.exp}/${needed}`,
      `💰 Saldo: ${(user.balance || 0).toLocaleString('id-ID')} koin`,
      isBoosted ? `⚡ XP Boost aktif sampai ${new Date(user.xpBoostUntil).toLocaleTimeString('id-ID')}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    await sock.sendMessage(jid, { text }, { quoted: parsed.raw });
  },
};
