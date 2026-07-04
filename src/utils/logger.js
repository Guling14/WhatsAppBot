// src/utils/logger.js

const pino = require('pino');
const config = require('../config/config');

/**
 * Logger global aplikasi menggunakan pino.
 * Dipakai di seluruh project agar format log konsisten.
 */
const logger = pino({
  level: config.logger.level,
  transport: {
    target: 'pino-pretty', // format log lebih mudah dibaca di terminal
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

module.exports = logger;