// src/events/message.js

const logger = require('../utils/logger');
const { parseMessage, isNewsletterMessage } = require('../utils/messageParser');
const { parseCommand } = require('../utils/commandParser');
const { getCommand } = require('../handlers/commandHandler');
const { applyGroupProtection } = require('../middleware/groupProtection');
const { getUser } = require('../database/userDatabase');

async function handleIncomingMessage(sock, messageUpdate) {
  const { messages, type } = messageUpdate;

  if (type !== 'notify') return;

  for (const msg of messages) {
    if (!msg.message) continue;
    if (isNewsletterMessage(msg.key.remoteJid)) continue;

    const parsed = parseMessage(msg);
    if (parsed.fromMe) continue;
    // Pastikan user tercatat di database (auto-register)
    const user = getUser(parsed.sender, parsed.pushName);

    logger.info(
      {
        from: parsed.sender,
        chat: parsed.isGroup ? 'GROUP' : 'PRIVATE',
        type: parsed.type,
      },
      `📩 ${parsed.pushName}: ${parsed.text || `[${parsed.type}]`}`
    );

    // --- Group Protection Middleware ---
    const violated = await applyGroupProtection(sock, parsed);
    if (violated) continue; // pesan sudah ditangani (dihapus + diperingatkan), stop di sini

    // --- Command Handling ---
    const commandData = parseCommand(parsed.text);
    if (!commandData) continue;

    const command = getCommand(commandData.commandName);
    if (!command) continue;

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