// ecosystem.config.js
// Konfigurasi PM2 untuk menjalankan WhatsApp Bot sebagai background process

module.exports = {
  apps: [
    {
      name: 'whatsapp-bot',        // nama proses, muncul di `pm2 list`
      script: 'src/index.js',       // entry point aplikasi
      instances: 1,                 // 1 instance saja — Baileys tidak boleh dijalankan multi-instance untuk 1 session yang sama
      autorestart: true,            // restart otomatis kalau proses crash
      watch: false,                 // JANGAN pakai watch mode di production (beda dengan nodemon saat development)
      max_memory_restart: '300M',   // restart otomatis kalau memory bocor melebihi ini
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};