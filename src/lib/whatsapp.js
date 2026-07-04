// src/lib/whatsapp.js

const NodeCache = require('node-cache');
const { handleGroupParticipantsUpdate } = require('../events/group');

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const path = require('path');
const qrcode = require('qrcode-terminal');

const config = require('../config/config');
const logger = require('../utils/logger');
const { handleIncomingMessage } = require('../events/message');

// Cache metadata grup, TTL 5 menit — mengurangi beban query berulang ke server WhatsApp
const groupMetadataCache = new NodeCache({ stdTTL: 5 * 60, useClones: false });

// Lokasi folder penyimpanan session, dibedakan per SESSION_NAME
const SESSION_PATH = path.join(
  __dirname,
  '..',
  'sessions',
  config.whatsapp.sessionName
);

/**
 * Membuat dan mengelola koneksi WhatsApp.
 * Fungsi ini bersifat rekursif: jika koneksi terputus (bukan karena logout),
 * ia akan mencoba menyambung ulang secara otomatis.
 */
async function connectToWhatsApp() {
  // 1. Ambil/refresh state autentikasi dari folder sessions
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH);

  // 2. Ambil versi Baileys terbaru yang kompatibel dengan WhatsApp saat ini
  const { version, isLatest } = await fetchLatestBaileysVersion();
  logger.info(`Menggunakan Baileys versi ${version.join('.')}, terbaru: ${isLatest}`);

  // 3. Buat socket koneksi
  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: logger.child({ module: 'baileys' }),
    browser: [config.bot.name, 'Chrome', '1.0.0'],
    cachedGroupMetadata: async (jid) => groupMetadataCache.get(jid),
  });

  // 4. Simpan credential setiap kali ada update (wajib, agar session tidak hilang)
  sock.ev.on('creds.update', saveCreds);
  
  // Dengarkan setiap pesan masuk
  sock.ev.on('messages.upsert', (messageUpdate) => {
    handleIncomingMessage(sock, messageUpdate);
  });

  // Dengarkan perubahan anggota grup (join, leave, promote, demote)
  sock.ev.on('group-participants.update', (update) => {
    handleGroupParticipantsUpdate(sock, update);
  });

  // Simpan/refresh cache metadata grup setiap kali ada perubahan grup
  sock.ev.on('groups.update', async ([event]) => {
    const metadata = await sock.groupMetadata(event.id);
    groupMetadataCache.set(event.id, metadata);
  });

  sock.ev.on('group-participants.update', async (event) => {
    try {
      const metadata = await sock.groupMetadata(event.id);
      groupMetadataCache.set(event.id, metadata);
    } catch (err) {
      logger.error({ err }, 'Gagal memuat ulang metadata grup');
    }
  });

  // 5. Pantau perubahan status koneksi
  sock.ev.on('connection.update', (update) => {
    handleConnectionUpdate(update, sock);
  });

  return sock;
}

/**
 * Menangani setiap perubahan status koneksi:
 * - Menampilkan QR Code saat diminta
 * - Menangani reconnect otomatis saat terputus
 * - Menandai saat berhasil terhubung
 */
async function handleConnectionUpdate(update, sock) {
  const { connection, lastDisconnect, qr } = update;

  // Tampilkan QR Code di terminal jika WhatsApp memintanya
  if (qr && config.whatsapp.pairingMethod === 'qr') {
    logger.info('Silakan scan QR Code berikut dengan WhatsApp Anda:');
    qrcode.generate(qr, { small: true });
  }

  if (connection === 'close') {
    const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
    const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

    logger.warn(
      `Koneksi terputus. Status: ${statusCode}. Reconnect: ${shouldReconnect}`
    );

    if (shouldReconnect) {
      connectToWhatsApp();
    } else {
      logger.error('Bot telah logout. Hapus folder sessions dan scan ulang QR Code.');
    }
 } else if (connection === 'open') {
    logger.info(`✅ Bot berhasil terhubung sebagai: ${sock.user?.id}`);

    // Pre-load metadata semua grup ke cache, supaya siap dipakai sejak awal
    try {
      const allGroups = await sock.groupFetchAllParticipating();
      for (const [jid, metadata] of Object.entries(allGroups)) {
        groupMetadataCache.set(jid, metadata);
      }
      logger.info(`📦 Metadata ${Object.keys(allGroups).length} grup berhasil di-cache.`);
    } catch (err) {
      logger.error({ err }, 'Gagal memuat metadata grup awal');
    }
  }
}

module.exports = { connectToWhatsApp };