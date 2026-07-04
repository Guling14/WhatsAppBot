// src/utils/messageParser.js

/**
 * Mengambil teks polos dari sebuah objek pesan Baileys,
 * apapun tipe pesannya (teks biasa, caption gambar, reply, dll).
 */
function extractMessageText(message) {
  if (!message) return '';

  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.documentMessage?.caption ||
    ''
  );
}

/**
 * Menentukan tipe pesan (teks, gambar, video, dst)
 * berdasarkan key mana yang ada di dalam objek message.
 */
function getMessageType(message) {
  if (!message) return 'unknown';
  const type = Object.keys(message)[0];
  return type || 'unknown';
}

/**
 * Mengecek apakah sebuah JID berasal dari grup.
 */
function isGroupMessage(remoteJid) {
  return remoteJid?.endsWith('@g.us') || false;
}

/**
 * Membungkus semua informasi penting dari satu pesan masuk
 * menjadi satu objek yang rapi dan mudah dipakai di seluruh aplikasi.
 */
function parseMessage(msg) {
  const remoteJid = msg.key.remoteJid;
  const isGroup = isGroupMessage(remoteJid);

  // Di dalam grup, pengirim asli ada di participant.
  // Di chat pribadi, pengirim = remoteJid itu sendiri.
  const sender = isGroup ? msg.key.participant : remoteJid;

  return {
    id: msg.key.id,
    fromMe: msg.key.fromMe,
    remoteJid,
    sender,
    pushName: msg.pushName || 'Unknown',
    isGroup,
    type: getMessageType(msg.message),
    text: extractMessageText(msg.message),
    raw: msg, // tetap simpan pesan asli, dibutuhkan nanti untuk reply/quote di Tahap 5
  };
}

/**
 * Mengecek apakah pesan berasal dari WhatsApp Channel/Newsletter,
 * bukan dari chat pribadi atau grup sungguhan.
 */
function isNewsletterMessage(remoteJid) {
  return remoteJid?.endsWith('@newsletter') || false;
}

module.exports = {
  extractMessageText,
  getMessageType,
  isGroupMessage,
  isNewsletterMessage,
  parseMessage,
};