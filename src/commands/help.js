// src/commands/help.js

const { getAllCommands } = require('../handlers/commandHandler');
const config = require('../config/config');

module.exports = {
  name: 'help',
  aliases: ['menu'],
  description: 'Menampilkan daftar semua command',
  execute: async ({ sock, jid, parsed }) => {
    const allCommands = getAllCommands();
    const prefix = config.bot.prefix[0];

    let text = `📋 *Daftar Command - ${config.bot.name}*\n\n`;
    for (const cmd of allCommands) {
      text += `${prefix}${cmd.name} - ${cmd.description || 'Tidak ada deskripsi'}\n`;
    }

    await sock.sendMessage(jid, { text }, { quoted: parsed.raw });
  },
};