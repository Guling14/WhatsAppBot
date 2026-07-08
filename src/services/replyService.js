// src/services/replyService.js

const logger = require('../utils/logger');

/**
 * Mengirim pesan teks biasa ke sebuah chat.
 */
async function sendText(sock, jid, text, mentions = []) {
  try {
    return await sock.sendMessage(jid, { text, mentions });
  } catch (err) {
    logger.error({ err }, 'Gagal mengirim pesan teks');
  }
}

/**
 * Membalas sebuah pesan dengan kutipan (quote),
 * seperti fitur "Reply" manual di WhatsApp.
 */
async function replyWithQuote(sock, jid, text, quotedMsg) {
  try {
    return await sock.sendMessage(jid, { text }, { quoted: quotedMsg });
  } catch (err) {
    logger.error({ err }, 'Gagal membalas pesan dengan quote');
  }
}

/**
 * Memberi reaction emoji ke sebuah pesan tanpa mengirim teks baru.
 */
async function sendReaction(sock, jid, messageKey, emoji) {
  try {
    return await sock.sendMessage(jid, {
      react: {
        text: emoji,
        key: messageKey,
      },
    });
  } catch (err) {
    logger.error({ err }, 'Gagal mengirim reaction');
  }
}

module.exports = {
  sendText,
  replyWithQuote,
  sendReaction,
};