// src/commands/maintenance.js

const { requireOwner } = require('../middleware/ownerGuard');
const { isMaintenanceMode, setMaintenanceMode } = require('../database/settingsDatabase');

module.exports = {
  name: 'maintenance',
  aliases: ['maint'],
  description: 'Aktifkan/nonaktifkan mode maintenance (khusus owner). !maintenance on/off',
  execute: requireOwner(async ({ sock, jid, args, parsed }) => {
    const arg = args[0]?.toLowerCase();

    if (arg !== 'on' && arg !== 'off') {
      const current = isMaintenanceMode() ? 'ON 🛠️' : 'OFF ✅';
      await sock.sendMessage(
        jid,
        { text: `Mode maintenance saat ini: *${current}*\nGunakan: !maintenance on / !maintenance off` },
        { quoted: parsed.raw }
      );
      return;
    }

    setMaintenanceMode(arg === 'on');
    const status = arg === 'on' ? 'AKTIF 🛠️ (command non-owner ditolak)' : 'NONAKTIF ✅ (normal)';
    await sock.sendMessage(jid, { text: `Mode maintenance sekarang: *${status}*` }, { quoted: parsed.raw });
  }),
};
