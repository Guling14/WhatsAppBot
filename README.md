# MyWhatsAppBot

Bot WhatsApp berbasis Node.js dan Baileys.

## Instalasi

```bash
npm install
```

Buat file `.env`, isi seperti berikut:

```env
BOT_NAME=MyWhatsAppBot
PREFIX="!,.,#,/"
OWNER_NUMBER=628xxxxxxxxxx
PORT=3000
PAIRING_METHOD=qr
LOG_LEVEL=warn
SESSION_NAME=default
NODE_ENV=production
GEMINI_API_KEY="isi-api-key-kamu"
GEMINI_MODEL=gemini-2.5-flash
```

## Menjalankan

**Development:**
```bash
npm run dev
```

**Production (PM2):**
```bash
pm2 start ecosystem.config.js
pm2 save
```

Scan QR Code yang muncul di terminal via WhatsApp: **Perangkat Tertaut → Tautkan Perangkat**.

## Command

| Command | Deskripsi |
|---|---|
| `!ping` | Cek respon bot |
| `!menu` | Daftar command |
| `!antilink on/off` | Proteksi anti-link |
| `!kick` `!promote` `!demote` | Kelola member grup (admin) |
| `!ai <pesan>` | Chat dengan AI |

## Menambah Command Baru

Buat file baru di `src/commands/`, contoh `src/commands/tes.js`:

```javascript
module.exports = {
  name: 'tes',
  description: 'Command percobaan',
  execute: async ({ sock, jid, parsed }) => {
    await sock.sendMessage(jid, { text: 'Halo!' }, { quoted: parsed.raw });
  },
};
```

Lalu jalankan:
```bash
pm2 restart whatsapp-bot
```

## Catatan

- `.env` dan `src/sessions/` jangan pernah di-commit ke git
- Update Baileys secara berkala: `npm install @whiskeysockets/baileys@latest`
- Jalankan hanya 1 instance bot untuk 1 session
