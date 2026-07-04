// src/index.js

const { loadCommands } = require('./handlers/commandHandler');
const express = require('express');
const config = require('./config/config');
const logger = require('./utils/logger');
const { connectToWhatsApp } = require('./lib/whatsapp');

async function main() {
  logger.info(`🚀 Memulai ${config.bot.name}...`);

  loadCommands(); // muat semua command sebelum bot mulai menerima pesan

  // Jalankan koneksi WhatsApp
  await connectToWhatsApp();

  // Jalankan server Express kecil (untuk health check, nanti bisa dikembangkan)
  const app = express();
  app.get('/', (req, res) => {
    res.json({ status: 'ok', bot: config.bot.name });
  });

  app.listen(config.server.port, () => {
    logger.info(`🌐 Server berjalan di http://localhost:${config.server.port}`);
  });
}

// Tangkap error yang tidak tertangani agar bot tidak crash diam-diam
process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'Unhandled Rejection');
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught Exception');
});

process.on('SIGINT', () => {
  logger.info('🛑 Menerima sinyal SIGINT, mematikan bot dengan aman...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('🛑 Menerima sinyal SIGTERM, mematikan bot dengan aman...');
  process.exit(0);
});

main();