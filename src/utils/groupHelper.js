// src/utils/groupHelper.js

/**
 * Mengambil metadata grup (daftar member + role masing-masing).
 */
async function getGroupMetadata(sock, groupId) {
  return sock.groupMetadata(groupId);
}

/**
 * Mengecek apakah sebuah JID adalah admin di grup tersebut.
 * Mendukung pencocokan lewat field `id` (@lid) maupun `phoneNumber` (@s.whatsapp.net),
 * karena WhatsApp sekarang bisa mengembalikan JID dalam dua format berbeda.
 */
async function isAdmin(sock, groupId, jid) {
  const metadata = await getGroupMetadata(sock, groupId);
  const participant = metadata.participants.find(
    (p) => p.id === jid || p.phoneNumber === jid
  );
  return participant?.admin === 'admin' || participant?.admin === 'superadmin';
}

/**
 * Mengecek apakah bot sendiri adalah admin di grup tersebut.
 */
async function isBotAdmin(sock, groupId) {
  const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
  return isAdmin(sock, groupId, botJid);
}

/**
 * Mengambil JID target dari sebuah pesan:
 * - Jika pesan me-mention seseorang, ambil dari mention
 * - Jika pesan adalah reply ke pesan orang lain, ambil dari situ
 * - Jika tidak ada, kembalikan null
 */
function getTargetJid(parsed) {
  const contextInfo = parsed.raw.message?.extendedTextMessage?.contextInfo;
  const mentioned = contextInfo?.mentionedJid?.[0];
  if (mentioned) return mentioned;
  const quotedParticipant = contextInfo?.participant;
  if (quotedParticipant) return quotedParticipant;
  return null;
}

module.exports = { getGroupMetadata, isAdmin, isBotAdmin, getTargetJid };