// src/utils/ownerHelper.js

const config = require('../config/config');

function isOwner(parsed) {
  const ownerJid = `${config.owner.number}@s.whatsapp.net`;
  const candidates = [parsed.sender, parsed.senderAlt].filter(Boolean);
  return candidates.includes(ownerJid);
}

module.exports = { isOwner };
