// src/utils/messageParser.js

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

function getMessageType(message) {
  if (!message) return 'unknown';
  const type = Object.keys(message)[0];
  return type || 'unknown';
}

function isGroupMessage(remoteJid) {
  return remoteJid?.endsWith('@g.us') || false;
}

function parseMessage(msg) {
  const remoteJid = msg.key.remoteJid;
  const isGroup = isGroupMessage(remoteJid);

  const sender = isGroup ? msg.key.participant : remoteJid;

  // senderAlt: JID alternatif dari Baileys (fitur v6.8.0+).
  // Kalau `sender` di atas formatnya @lid, senderAlt otomatis berisi
  // versi @s.whatsapp.net (nomor asli) dari orang yang sama, atau
  // sebaliknya. Dipakai untuk pencocokan nomor owner.
  const senderAlt = isGroup ? msg.key.participantAlt : msg.key.remoteJidAlt;

  return {
    id: msg.key.id,
    fromMe: msg.key.fromMe,
    remoteJid,
    sender,
    senderAlt,
    pushName: msg.pushName || 'Unknown',
    isGroup,
    type: getMessageType(msg.message),
    text: extractMessageText(msg.message),
    raw: msg,
  };
}

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
