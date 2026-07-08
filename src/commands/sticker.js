// src/commands/sticker.js

const sharp = require('sharp');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const logger = require('../utils/logger');
const { getImageToDownload } = require('../utils/mediaHelper');

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stiker'],
  description: 'Ubah gambar jadi stiker',
  execute: async ({ sock, jid, parsed }) => {
    logger.info('🖼️  Command sticker dipanggil');

    const targetMessage = getImageToDownload(parsed);

    if (!targetMessage) {
      logger.warn('⚠️  Tidak ada gambar terdeteksi untuk sticker');
      await sock.sendMessage(
        jid,
        { text: '❌ Kirim gambar dengan caption !sticker, atau reply sebuah gambar lalu ketik !sticker.' },
        { quoted: parsed.raw }
      );
      return;
    }

    try {
      logger.info('⬇️  Mengunduh media...');
      const buffer = await downloadMediaMessage(
        targetMessage,
        'buffer',
        {},
        { logger, reuploadRequest: sock.updateMediaMessage }
      );
      logger.info(`✅ Media terunduh, ukuran: ${buffer.length} bytes`);

      const webpBuffer = await sharp(buffer)
        .resize(512, 512, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .webp()
        .toBuffer();

      logger.info('✅ Konversi ke webp berhasil, mengirim stiker...');
      await sock.sendMessage(jid, { sticker: webpBuffer }, { quoted: parsed.raw });
      logger.info('✅ Stiker terkirim');
    } catch (err) {
      logger.error({ err }, 'Gagal membuat stiker');
      await sock.sendMessage(
        jid,
        { text: '❌ Gagal membuat stiker. Pastikan yang dikirim/di-reply adalah gambar valid.' },
        { quoted: parsed.raw }
      );
    }
  },
};
