const logger = require('../utils/logger');

async function sendImage(sock, jid, buffer, caption = '') {
  try {
    return await sock.sendMessage(jid, { image: buffer, caption });
  } catch (err) {
    logger.error({ err }, 'Gagal mengirim gambar');
  }
}

async function sendVideo(sock, jid, buffer, caption = '') {
  try {
    return await sock.sendMessage(jid, { video: buffer, caption });
  } catch (err) {
    logger.error({ err }, 'Gagal mengirim video');
  }
}

async function sendAudio(sock, jid, buffer, ptt = false) {
  try {
    // ptt = true artinya dikirim sebagai voice note, bukan file audio biasa
    return await sock.sendMessage(jid, { audio: buffer, mimetype: 'audio/mp4', ptt });
  } catch (err) {
    logger.error({ err }, 'Gagal mengirim audio');
  }
}

async function sendDocument(sock, jid, buffer, fileName, mimetype) {
  try {
    return await sock.sendMessage(jid, { document: buffer, fileName, mimetype });
  } catch (err) {
    logger.error({ err }, 'Gagal mengirim dokumen');
  }
}

async function sendContact(sock, jid, contactName, contactNumber) {
  // Format vCard standar, dikenali WhatsApp sebagai kartu kontak
  const vcard =
    'BEGIN:VCARD\n' +
    'VERSION:3.0\n' +
    `FN:${contactName}\n` +
    `TEL;type=CELL;type=VOICE;waid=${contactNumber}:+${contactNumber}\n` +
    'END:VCARD';

  try {
    return await sock.sendMessage(jid, {
      contacts: {
        displayName: contactName,
        contacts: [{ vcard }],
      },
    });
  } catch (err) {
    logger.error({ err }, 'Gagal mengirim kontak');
  }
}

async function sendLocation(sock, jid, latitude, longitude, name = '') {
  try {
    return await sock.sendMessage(jid, {
      location: { degreesLatitude: latitude, degreesLongitude: longitude, name },
    });
  } catch (err) {
    logger.error({ err }, 'Gagal mengirim lokasi');
  }
}

module.exports = { sendImage, sendVideo, sendAudio, sendDocument, sendContact, sendLocation };
