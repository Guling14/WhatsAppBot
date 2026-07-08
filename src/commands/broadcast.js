// src/commands/broadcast.js

const { requireOwner } = require('../middleware/ownerGuard');

module.exports = {
  name: 'broadcast',
  aliases: ['bc'],
  description: 'Kirim pesan ke semua grup yang bot ikuti (khusus owner)',
  execute: requireOwner(async ({ sock, jid, args, parsed }) => {
    const text = args.join(' ').trim();

    if (!text) {
      await sock.sendMessage(
        jid,
        { text: '❌ Tulis pesan yang mau di-broadcast.\nContoh: !broadcast Halo semua, ada update baru!' },
        { quoted: parsed.raw }
      );
      return;
    }

    const groups = await sock.groupFetchAllParticipating();
    const groupIds = Object.keys(groups);

    await sock.sendMessage(jid, { text: `📢 Mengirim broadcast ke ${groupIds.length} grup...` }, { quoted: parsed.raw });

    let success = 0;
    let failed = 0;

    for (const groupId of groupIds) {
      try {
        await sock.sendMessage(groupId, { text: `📢 *Broadcast dari Owner*\n\n${text}` });
        success += 1;
      } catch (err) {
        failed += 1;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    await sock.sendMessage(jid, { text: `✅ Broadcast selesai.\nBerhasil: ${success} | Gagal: ${failed}` });
  }),
};
