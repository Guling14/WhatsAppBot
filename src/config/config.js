// src/config/config.js

// Load environment variables dari file .env ke process.env
require('dotenv').config();

/**
 * Fungsi kecil untuk mengubah string "!,.,#,/" menjadi array ['!', '.', '#', '/']
 * Dipakai untuk PREFIX karena bot mendukung banyak prefix sekaligus.
 */
function parseList(value, fallback = []) {
  if (!value) return fallback;
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Validasi sederhana: pastikan variabel wajib sudah diisi.
 * Kalau tidak, bot langsung berhenti dengan pesan error yang jelas,
 * daripada crash di tengah jalan dengan error yang membingungkan.
 */
function required(key, value) {
  if (!value) {
    throw new Error(
      `[CONFIG ERROR] Environment variable "${key}" wajib diisi di file .env`
    );
  }
  return value;
}

const config = {
  bot: {
    name: process.env.BOT_NAME || 'WhatsApp Bot',
    prefix: parseList(process.env.PREFIX, ['!']),
  },

  owner: {
    number: required('OWNER_NUMBER', process.env.OWNER_NUMBER),
  },

  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
  },

  whatsapp: {
    pairingMethod: process.env.PAIRING_METHOD === 'code' ? 'code' : 'qr',
    phoneNumber: process.env.PHONE_NUMBER || '',
    sessionName: process.env.SESSION_NAME || 'default',
  },

  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },

  env: {
    isProduction: process.env.NODE_ENV === 'production',
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};

// Validasi tambahan: jika pairing method "code", nomor HP wajib ada
if (config.whatsapp.pairingMethod === 'code' && !config.whatsapp.phoneNumber) {
  throw new Error(
    '[CONFIG ERROR] PAIRING_METHOD=code membutuhkan PHONE_NUMBER di file .env'
  );
}

module.exports = config;