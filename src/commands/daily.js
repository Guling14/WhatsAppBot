// src/commands/daily.js

const { claimDaily } = require('../database/userDatabase');

function formatDuration(ms) {
  const totalMinutes = Math.ceil(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes} menit`;
  return `${hours} jam ${minutes} menit`;
}

module.exports = {
  name: 'daily',
  aliases: ['klaim'],
  description: 'Klaim reward harian (cooldown 24 jam)',
  execute: async ({ sock, jid, parsed }) => {
    const result = claimDaily(parsed.sender);

    if (!result.success) {
      await sock.sendMessage(
        jid,
        { text: `⏳ Kamu sudah klaim hari ini. Coba lagi dalam ${formatDuration(result.remainingMs)}.` },
        { quoted: parsed.raw }
      );
      return;
    }

    const text = [
      `🎁 *Klaim harian berhasil!*`,
      ``,
      `💰 Reward: ${result.baseReward.toLocaleString('id-ID')} (dasar) + ${result.levelBonus.toLocaleString('id-ID')} (bonus level) = ${result.reward.toLocaleString('id-ID')} koin`,
      `💳 Saldo sekarang: ${result.user.balance.toLocaleString('id-ID')} koin`,
    ].join('\n');

    await sock.sendMessage(jid, { text }, { quoted: parsed.raw });
  },
};
