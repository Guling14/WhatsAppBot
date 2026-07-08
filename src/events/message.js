// src/events/message.js

const logger = require('../utils/logger');
const { parseMessage, isNewsletterMessage } = require('../utils/messageParser');
const { parseCommand } = require('../utils/commandParser');
const { getCommand } = require('../handlers/commandHandler');
const { applyGroupProtection } = require('../middleware/groupProtection');
const { getUser, addExp } = require('../database/userDatabase');
const { isMaintenanceMode } = require('../database/settingsDatabase');
const { isOwner } = require('../utils/ownerHelper');

async function handleIncomingMessage(sock, messageUpdate) {
  const { messages, type } = messageUpdate;
  if (type !== 'notify') return;

  for (const msg of messages) {
    if (!msg.message) continue;
    if (isNewsletterMessage(msg.key.remoteJid)) continue;

    const parsed = parseMessage(msg);
    if (parsed.fromMe) continue;

    const user = getUser(parsed.sender, parsed.pushName);

    logger.info(
      {
        from: parsed.sender,
        chat: parsed.isGroup ? 'GROUP' : 'PRIVATE',
        type: parsed.type,
      },
      `📩 ${parsed.pushName}: ${parsed.text || `[${parsed.type}]`}`
    );

    const expResult = addExp(parsed.sender);
    if (expResult.leveledUp) {
      await sock.sendMessage(parsed.remoteJid, {
        text: `🎉 Selamat @${parsed.pushName}, kamu naik ke *Level ${expResult.newLevel}*!`,
        mentions: [parsed.sender],
      });
    }

    const violated = await applyGroupProtection(sock, parsed);
    if (violated) continue;

    const commandData = parseCommand(parsed.text);
    if (!commandData) continue;

    const command = getCommand(commandData.commandName);
    if (!command) continue;

    if (user.isBanned && !isOwner(parsed)) {
      await sock.sendMessage(
        parsed.remoteJid,
        { text: '🚫 Kamu diblokir dari menggunakan bot ini.' },
        { quoted: parsed.raw }
      );
      continue;
    }

    if (isMaintenanceMode() && !isOwner(parsed)) {
      await sock.sendMessage(
        parsed.remoteJid,
        { text: '🛠️ Bot sedang maintenance, coba lagi nanti.' },
        { quoted: parsed.raw }
      );
      continue;
    }

    try {
      logger.info(`⚡ Menjalankan command: ${commandData.commandName}`);
      await command.execute({
        sock,
        jid: parsed.remoteJid,
        args: commandData.args,
        parsed,
      });
    } catch (err) {
      logger.error({ err }, `Gagal menjalankan command "${commandData.commandName}"`);
    }
  }
}

module.exports = { handleIncomingMessage };
