// src/commands/antilink.js

const { updateSetting, getSettings } = require('../database/groupSettings');

module.exports = {
  name: 'antilink',
  description: 'Mengaktifkan/menonaktifkan proteksi anti-link (khusus grup)',
  execute: async ({ sock, jid, args, parsed }) => {
    if (!parsed.isGroup) {
      await sock.sendMessage(jid, { text: '❌ Command ini hanya untuk grup.' }, { quoted: parsed.raw });
      return;
    }

    const mode = args[0]?.toLowerCase();
    if (mode !== 'on' && mode !== 'off') {
      const current = getSettings(jid).antiLink;
      await sock.sendMessage(
        jid,
        { text: `ℹ️ Status anti-link saat ini: ${current ? 'ON' : 'OFF'}\nGunakan: !antilink on / !antilink off` },
        { quoted: parsed.raw }
      );
      return;
    }

    updateSetting(jid, 'antiLink', mode === 'on');
    await sock.sendMessage(
      jid,
      { text: `✅ Anti-link telah di-${mode === 'on' ? 'aktifkan' : 'nonaktifkan'}.` },
      { quoted: parsed.raw }
    );
  },
};