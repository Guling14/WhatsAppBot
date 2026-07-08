// src/commands/lokasi.js

const { sendLocation } = require('../services/mediaService');

module.exports = {
  name: 'lokasi',
  description: 'Mengirim titik lokasi. Contoh: !lokasi -6.200000 106.816666 Monas',
  execute: async ({ sock, jid, args, parsed }) => {
    const [latStr, longStr, ...nameParts] = args;
    const latitude = parseFloat(latStr);
    const longitude = parseFloat(longStr);

    if (isNaN(latitude) || isNaN(longitude)) {
      await sock.sendMessage(
        jid,
        { text: '❌ Format salah.\nContoh: !lokasi -6.200000 106.816666 Monas' },
        { quoted: parsed.raw }
      );
      return;
    }

    await sendLocation(sock, jid, latitude, longitude, nameParts.join(' '));
  },
};
