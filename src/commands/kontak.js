// src/commands/kontak.js

const { sendContact } = require('../services/mediaService');
const config = require('../config/config');

module.exports = {
  name: 'kontak',
  aliases: ['owner'],
  description: 'Mengirim kartu kontak owner bot',
  execute: async ({ sock, jid }) => {
    await sendContact(sock, jid, `${config.bot.name} Owner`, config.owner.number);
  },
}; 





