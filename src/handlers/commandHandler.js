// src/handlers/commandHandler.js

const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

const COMMANDS_PATH = path.join(__dirname, '..', 'commands');

// Menyimpan semua command yang berhasil dimuat: nama/alias → objek command
const commands = new Map();

/**
 * Membaca seluruh file .js di folder commands/ dan mendaftarkannya.
 * Dipanggil sekali saat bot pertama kali start.
 */
function loadCommands() {
  commands.clear();

  const files = fs
    .readdirSync(COMMANDS_PATH)
    .filter((file) => file.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(COMMANDS_PATH, file);

    try {
      // Hapus cache agar reload command (fitur owner nanti) bisa bekerja
      delete require.cache[require.resolve(filePath)];
      const command = require(filePath);

      if (!command.name || typeof command.execute !== 'function') {
        logger.warn(`⚠️  Command di file "${file}" tidak valid, dilewati.`);
        continue;
      }

      commands.set(command.name, command);

      // Daftarkan juga semua alias, jika ada
      if (Array.isArray(command.aliases)) {
        for (const alias of command.aliases) {
          commands.set(alias, command);
        }
      }

      logger.info(`✅ Command dimuat: ${command.name}`);
    } catch (err) {
      logger.error({ err }, `Gagal memuat command dari file "${file}"`);
    }
  }

  logger.info(`📦 Total ${commands.size} command (termasuk alias) siap digunakan.`);
}

/**
 * Mencari command berdasarkan nama atau alias-nya.
 */
function getCommand(name) {
  return commands.get(name);
}

function getAllCommands() {
  // Set dipakai agar command dengan alias tidak terhitung dobel
  return [...new Set(commands.values())];
}

module.exports = { loadCommands, getCommand, getAllCommands };