// src/events/group.js

const logger = require('../utils/logger');
const { sendText } = require('../services/replyService');

/**
 * Mengambil nama tampilan sederhana dari sebuah JID,
 * misal "628123456789@s.whatsapp.net" -> "628123456789"
 */
function jidToDisplayName(jid) {
  return jid?.split('@')[0] || 'Unknown';
}

/**
 * Handler utama untuk perubahan anggota grup:
 * join, leave, promote, demote.
 */
async function handleGroupParticipantsUpdate(sock, update) {
  const { id: groupId, participants, action } = update;

  logger.info(
    { groupId, participants, action },
    `👥 Group update: ${action}`
  );

  switch (action) {
    case 'add':
      await handleMemberJoin(sock, groupId, participants);
      break;
    case 'remove':
      await handleMemberLeave(sock, groupId, participants);
      break;
    case 'promote':
      await handleMemberPromote(sock, groupId, participants);
      break;
    case 'demote':
      await handleMemberDemote(sock, groupId, participants);
      break;
    default:
      logger.warn(`Aksi grup tidak dikenal: ${action}`);
  }
}

async function handleMemberJoin(sock, groupId, participants) {
  for (const jid of participants) {
    const name = jidToDisplayName(jid);
    await sendText(
      sock,
      groupId,
      `👋 Selamat datang @${name} di grup!`
    );
  }
}

async function handleMemberLeave(sock, groupId, participants) {
  for (const jid of participants) {
    const name = jidToDisplayName(jid);
    await sendText(sock, groupId, `👋 Selamat tinggal @${name}...`);
  }
}

async function handleMemberPromote(sock, groupId, participants) {
  for (const jid of participants) {
    const name = jidToDisplayName(jid);
    await sendText(sock, groupId, `⬆️ @${name} sekarang menjadi admin.`);
  }
}

async function handleMemberDemote(sock, groupId, participants) {
  for (const jid of participants) {
    const name = jidToDisplayName(jid);
    await sendText(sock, groupId, `⬇️ @${name} bukan lagi admin.`);
  }
}

module.exports = { handleGroupParticipantsUpdate };