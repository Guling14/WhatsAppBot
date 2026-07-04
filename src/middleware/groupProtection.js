// src/middleware/groupProtection.js

const logger = require('../utils/logger');
const { getSettings } = require('../database/groupSettings');
const { containsLink, containsToxicWord, isVirtex } = require('../utils/contentFilter');
const { sendText } = require('../services/replyService');

/**
 * Middleware proteksi grup: dijalankan untuk SETIAP pesan yang masuk dari grup,
 * SEBELUM pesan diproses sebagai command.
 *
 * Mengembalikan `true` jika pesan melanggar aturan (sudah ditangani, hentikan proses lebih lanjut),
 * atau `false` jika pesan aman untuk diproses lebih lanjut (misal sebagai command).
 */
async function applyGroupProtection(sock, parsed) {
  if (!parsed.isGroup) return false; // proteksi hanya berlaku di grup

  const settings = getSettings(parsed.remoteJid);
  const text = parsed.text;

  if (settings.antiLink && containsLink(text)) {
    await handleViolation(sock, parsed, 'link');
    return true;
  }

  if (settings.antiToxic && containsToxicWord(text)) {
    await handleViolation(sock, parsed, 'kata kasar');
    return true;
  }

  if (settings.antiSpam && isVirtex(text)) {
    await handleViolation(sock, parsed, 'virtex/spam');
    return true;
  }

  return false;
}

/**
 * Menangani pelanggaran: hapus pesan dan kirim peringatan.
 */
async function handleViolation(sock, parsed, violationType) {
  logger.warn(
    { groupId: parsed.remoteJid, sender: parsed.sender, violationType },
    `🚫 Pelanggaran terdeteksi: ${violationType}`
  );

  try {
    // Hapus pesan pelanggar
    await sock.sendMessage(parsed.remoteJid, { delete: parsed.raw.key });
  } catch (err) {
    logger.error({ err }, 'Gagal menghapus pesan pelanggar');
  }

  await sendText(
    sock,
    parsed.remoteJid,
    `⚠️ Pesan terdeteksi mengandung ${violationType} dan telah dihapus.`
  );
}

module.exports = { applyGroupProtection };