// src/utils/mediaHelper.js

/**
 * Menentukan objek pesan mana yang harus diunduh sebagai gambar:
 * - Jika pesan itu sendiri berisi gambar (misal caption "!sticker" langsung di foto)
 * - Jika pesan adalah reply ke gambar orang lain
 * Mengembalikan null jika tidak ada gambar yang bisa diproses.
 */
function getImageToDownload(parsed) {
  const msg = parsed.raw;

  // Kasus 1: gambar dikirim langsung dengan caption command
  if (msg.message?.imageMessage) {
    return msg;
  }

  // Kasus 2: reply ke sebuah gambar
  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
  const quoted = contextInfo?.quotedMessage;

  if (quoted?.imageMessage) {
    // Bentuk ulang jadi "pesan palsu" yang strukturnya dikenali Baileys untuk didownload
    return {
      key: {
        remoteJid: msg.key.remoteJid,
        id: contextInfo.stanzaId,
        participant: contextInfo.participant,
      },
      message: quoted,
    };
  }

  return null;
}

module.exports = { getImageToDownload };
