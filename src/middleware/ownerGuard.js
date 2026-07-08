// src/middleware/ownerGuard.js

const { isOwner } = require('../utils/ownerHelper');

function requireOwner(handler) {
  return async (ctx) => {
    const { sock, jid, parsed } = ctx;

    if (!isOwner(parsed)) {
      await sock.sendMessage(jid, { text: '❌ Command ini hanya untuk owner bot.' }, { quoted: parsed.raw });
      return;
    }

    return handler(ctx);
  };
}

module.exports = { requireOwner };
