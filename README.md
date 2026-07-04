# MyWhatsAppBot

WhatsApp Bot berbasis Node.js dan Baileys (WhatsApp Multi-Device), dibangun dengan arsitektur modular, clean code, dan siap production.

## ✨ Fitur

- **Koneksi**: Pairing via QR Code, auto-reconnect, session persisten
- **Command System**: Multi-prefix (`!`, `.`, `#`, `/`), auto-load command, alias support
- **Group Management**: Kick, promote, demote (dengan permission check admin)
- **Group Protection**: Anti-link (on/off per grup), deteksi join/leave/promote/demote otomatis
- **AI Chat**: Terintegrasi Google Gemini (`!ai`, `!ask`, `!chat`)
- **Database**: Persisten berbasis JSON (users & groups), auto-provisioning, limit harian, fondasi premium/level/economy
- **Reliability**: Error handling menyeluruh (bot tidak crash), logging terstruktur (pino), dikelola PM2 dengan auto-restart

## 🛠️ Tech Stack

- Node.js (LTS) + Express
- [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) — WhatsApp Multi-Device API
- pino — logging
- fs-extra — file system utilities
- node-cache — caching metadata grup
- PM2 — process manager

## 📁 Struktur Project
    semua normal


Navigated WSL limitations while preparing startup configuration guidance
Navigated WSL limitations while preparing startup configuration guidance
Tahap 13: PM2 — SELESAI ✅

Bot Anda sekarang berjalan independen dari sesi terminal — pembuktian paling penting untuk kestabilan sudah lolos.

TAHAP 14: AUTO RESTART (Startup Otomatis)
1. Konsep
PM2 sudah menangani restart otomatis saat bot crash. Tapi ada skenario lain yang belum tertangani: bagaimana kalau seluruh sistem (VPS/WSL) di-restart — misal VPS reboot karena maintenance provider, atau listrik mati lalu server reboot? Tanpa konfigurasi tambahan, begitu OS menyala kembali, PM2 dan bot Anda tidak akan otomatis jalan lagi — Anda harus login manual dan pm2 start ulang.

pm2 startup menghasilkan sebuah script systemd (sistem service manager bawaan Linux) yang membuat PM2 sendiri otomatis menyala saat OS boot, dan PM2 kemudian menghidupkan kembali semua proses yang terdaftar.

2. Catatan Penting: Perbedaan WSL vs VPS Sungguhan
Ini satu hal yang perlu Anda pahami sebelum lanjut: WSL tidak "boot" seperti komputer/VPS pada umumnya. WSL menyala saat Anda membuka aplikasi Windows Terminal/VS Code yang memicunya, dan bisa "tertidur" (wsl --shutdown) tanpa proses restart OS yang sesungguhnya. Jadi:

Konsep dan perintah yang akan kita jalankan sama persis dengan yang akan Anda pakai nanti di VPS sungguhan — ini nilai belajarnya.
Tapi efek nyatanya di WSL terbatas: kalau Windows Anda restart total, WSL2 secara default tidak otomatis menyala sendiri kecuali dikonfigurasi khusus (fitur tambahan Windows, di luar cakupan tutorial bot ini).
Jadi anggap tahap ini sebagai latihan penuh untuk nanti dipraktikkan lagi di VPS sungguhan, sambil tetap dapat manfaat langsung: PM2 auto-start setiap kali WSL dinyalakan ulang (wsl --shutdown lalu buka lagi).
3. Implementasi
A. Generate script startup:

bash
pm2 startup
Hasil yang diharapkan — PM2 akan menampilkan sebuah perintah yang harus Anda copy dan jalankan manual (PM2 sengaja tidak menjalankannya otomatis, demi keamanan — perintah ini butuh hak akses sudo). Contohnya akan terlihat seperti:

[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/home/galang/.nvm/versions/node/v24.18.0/bin /home/galang/.nvm/versions/node/v24.18.0/lib/node_modules/pm2/bin/pm2 startup systemd -u galang --hp /home/galang
PENTING: jangan copy perintah di atas dari sini — itu cuma contoh. Anda wajib menjalankan perintah persis seperti yang muncul di terminal Anda sendiri, karena path Node.js (nvm, versi Node) berbeda-beda tiap komputer.

B. Jalankan perintah yang muncul tadi (copy-paste persis dari output Anda), akan minta password sudo Anda.

C. Simpan daftar proses PM2 saat ini — ini langkah yang sering terlewat tapi krusial:

bash
pm2 save
Perintah ini menyimpan "snapshot" proses yang sedang PM2 kelola (whatsapp-bot) ke sebuah file, supaya saat sistem restart, PM2 tahu proses apa saja yang harus dihidupkan kembali.

4. Cara Uji Coba
Karena keterbatasan WSL yang dijelaskan di atas, uji palingnya mendekati skenario nyata adalah:

Jalankan pm2 list — pastikan whatsapp-bot berstatus online
Dari PowerShell (bukan dari dalam WSL), jalankan:
powershell
   wsl --shutdown
Tunggu 10 detik, lalu buka kembali terminal WSL Ubuntu
Jalankan:
bash
   pm2 list
Hasil yang diharapkan: PM2 daemon otomatis menyala kembali (karena systemd yang kita konfigurasi tadi), dan whatsapp-bot otomatis berstatus online lagi tanpa Anda perlu mengetik pm2 start manual.

5. Kemungkinan Error & Solusi
Error	Penyebab	Solusi
pm2 list kosong setelah WSL restart	pm2 save belum dijalankan sebelum shutdown	Ulangi pm2 start ecosystem.config.js, lalu pm2 save lagi, baru uji ulang
Perintah pm2 startup tidak menghasilkan output apapun	Sudah pernah dijalankan sebelumnya	Jalankan pm2 unstartup dulu untuk reset, lalu pm2 startup lagi
systemctl: command not found	WSL versi lama belum mendukung systemd	Cek versi WSL (wsl -l -v dari PowerShell), pastikan pakai WSL2 dan systemd diaktifkan di /etc/wsl.conf (tambahkan [boot]\nsystemd=true, lalu wsl --shutdown)
Silakan jalankan pm2 startup dan pm2 save, lalu coba uji dengan wsl --shutdown dari PowerShell seperti di atas. Kabari hasilnya — kalau ada kendala systemd di WSL Anda (ini cukup umum), beri tahu saya versi WSL Anda (wsl -l -v dari PowerShell) supaya saya bisa bantu troubleshoot sesuai kondisi spesifik Anda.

pm2 startup
[PM2] Init System found: systemd
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/home/galang/.nvm/versions/node/v24.18.0/bin /home/galang/.nvm/versions/node/v24.18.0/lib/node_modules/pm2/bin/pm2 startup systemd -u galang --hp /home/galang
galang@My-mine:~/whatsapp-bot$ [PM2] Init System found: systemd
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/home/galang/.nvm/versions/node/v24.18.0/bin /home/galang/.nvm/versions/node/v24.18.0/lib/node_modules/pm2/bin/pm2 startup systemd -u galang --hp /home/galang
[PM2]: command not found
[PM2]: command not found
[sudo: authenticate] Password:    
env: 'Files/Git/cmd:/mnt/c/Users/galan/AppData/Local/Programs/Python/Python313/Scripts/:/mnt/c/Users/galan/AppData/Local/Programs/Python/Python313/:/mnt/c/Users/galan/AppData/Local/Programs/Python/Launcher/:/mnt/c/Users/galan/AppData/Local/Microsoft/WindowsApps:/mnt/c/Users/galan/AppData/Local/Programs/Microsoft': No such file or directory
env: use -[v]S to pass options in shebang lines
galang@My-mine:~/whatsapp-bot$ pm2 startup
[PM2] Init System found: systemd
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/home/galang/.nvm/versions/node/v24.18.0/bin /home/galang/.nvm/versions/node/v24.18.0/lib/node_modules/pm2/bin/pm2 startup systemd -u galang --hp /home/galang
galang@My-mine:~/whatsapp-bot$  apa ini benar

Show more

Diagnosed PATH escaping issue, prescribed quoting solution
Diagnosed PATH escaping issue, prescribed quoting solution
Ketemu penyebabnya — ini soal PATH yang mengandung spasi, bukan salah Anda mengetik. Mari saya jelaskan.

Penyebab
WSL secara default menggabungkan PATH Windows Anda ke dalam PATH Linux (fitur "interop"). Perhatikan potongan error ini:

env: 'Files/Git/cmd:/mnt/c/Users/galan/AppData/Local/Programs/Python/...': No such file or directory
Windows Anda punya folder seperti C:\Program Files\Git\cmd — perhatikan ada spasi di Program Files. Ketika path ini masuk ke variabel $PATH di WSL, spasi tersebut memecah string PATH menjadi 2 bagian terpisah (Program dan Files/Git/cmd), sehingga perintah env PATH=$PATH:... yang tidak dibungkus tanda kutip menjadi rusak/salah parse.

Solusi
Cukup tambahkan tanda kutip di sekitar bagian PATH=$PATH:.... Jalankan versi yang sudah diperbaiki ini (sesuaikan dengan path Node Anda dari output sebelumnya):

bash
sudo env PATH="$PATH:/home/galang/.nvm/versions/node/v24.18.0/bin" /home/galang/.nvm/versions/node/v24.18.0/lib/node_modules/pm2/bin/pm2 startup systemd -u galang --hp /home/galang
Perhatikan bedanya: PATH="$PATH:/home/..." (dengan tanda kutip ganda) — ini memastikan seluruh isi $PATH (termasuk yang ada spasinya) diperlakukan sebagai satu string utuh, bukan dipecah oleh spasi.

Jalankan itu, masukkan password sudo Anda lagi kalau diminta.

Verifikasi Berhasil
Setelah dijalankan, seharusnya tidak ada lagi pesan error No such file or directory. Anda akan melihat output seperti:

[PM2] Init System found: systemd
[PM2] Platform systemd
[PM2] Generating system init script in /etc/systemd/system/pm2-galang.service
[PM2] Making script booting at startup...
[PM2] [-] Executing: systemctl enable pm2-galang...
[PM2] [v] Command successfully executed.
Setelah itu, lanjutkan seperti rencana semula:

bash
pm2 save
Lalu uji dengan wsl --shutdown dari PowerShell → buka WSL lagi → pm2 list.

Catatan tambahan (opsional, untuk kenyamanan jangka panjang): kalau Anda mau WSL tidak mencampur PATH Windows ke Linux sama sekali (mengurangi risiko konflik serupa di masa depan), Anda bisa tambahkan ini ke /etc/wsl.conf:

ini
[interop]
appendWindowsPath = false
Lalu wsl --shutdown dari PowerShell dan buka lagi. Tapi ini opsional — kalau perintah dengan tanda kutip di atas sudah berhasil, tidak perlu diutak-atik lagi.

Silakan coba perintah yang sudah diperbaiki, kabari hasilnya.

sudah beresssss


Merencanakan verifikasi konfigurasi dan melanjutkan tahap berikutnya
Merencanakan verifikasi konfigurasi dan melanjutkan tahap berikutnya
Mantap! Tahap 14: Auto Restart — SELESAI ✅

Cek dulu satu hal terakhir untuk memastikan semuanya benar-benar tersimpan — sudah jalankan pm2 save setelah startup script berhasil? Kalau belum, jalankan sekarang:

bash
pm2 save
Ini penting karena pm2 startup cuma menyiapkan mesinnya (systemd service), sedangkan pm2 save menyimpan daftar proses (whatsapp-bot) yang harus dihidupkan otomatis. Tanpa pm2 save, systemd akan start PM2 tapi PM2-nya kosong (tidak tahu harus menjalankan apa).

Kalau sudah, kita anggap Tahap 14 tuntas — pengujian penuh wsl --shutdown bisa Anda coba kapan saja nanti secara mandiri (sesuai catatan sebelumnya, ini lebih relevan nanti saat sudah pakai VPS sungguhan).

TAHAP 15: PRODUCTION READY
Ini adalah tahap terakhir dari roadmap awal Anda — checklist penyempurnaan sebelum bot benar-benar siap dipakai jangka panjang.

1. Konsep
"Production ready" bukan fitur baru, melainkan audit menyeluruh: memastikan semua prinsip yang Anda minta di awal (aman, stabil, clean code) benar-benar terpenuhi, plus menutup celah yang biasanya luput di tahap belajar.

2. Checklist Production Ready
Mari kita telusuri satu per satu:

✅ A. Keamanan .env
Cek apakah .env tidak pernah ter-commit ke git:

bash
cat .gitignore
Pastikan ada baris .env. Kalau project ini sudah pernah di-git init sebelumnya, jalankan juga:

bash
git log --all --full-history -- .env
Kalau muncul history, .env pernah ter-commit — perlu di-purge dari history git (beri tahu saya kalau ini terjadi, caranya agak berbeda).

✅ B. Validasi Owner Number & Permission
Cek apakah command sensitif (kalau nanti Anda tambah !eval, !broadcast, dll di luar tutorial ini) benar-benar dibatasi hanya untuk config.owner.number. Ini belum kita bangun secara eksplisit — mari saya tambahkan helper permission check untuk keperluan ke depan:


Placeholder
Placeholder
File baru: src/utils/permissionHelper.js

javascript
// src/utils/permissionHelper.js

const config = require('../config/config');

/**
 * Mengecek apakah sebuah JID adalah owner bot.
 * Mendukung 2 format: JID lengkap ("628xxx@s.whatsapp.net") atau nomor polos ("628xxx").
 */
function isOwner(jid) {
  if (!jid) return false;
  const number = jid.split('@')[0];
  return number === config.owner.number;
}

module.exports = { isOwner };
Contoh pemakaian nanti (untuk command owner seperti !broadcast, !restart, dll):

javascript
const { isOwner } = require('../utils/permissionHelper');

module.exports = {
  name: 'contohcommandowner',
  execute: async ({ sock, jid, parsed }) => {
    if (!isOwner(parsed.sender)) {
      await sock.sendMessage(jid, { text: '❌ Command ini khusus owner bot.' }, { quoted: parsed.raw });
      return;
    }
    // logic command owner di sini
  },
};
✅ C. Logging Production-Grade
Cek src/utils/logger.js — pastikan level log di production tidak terlalu verbose. Update .env:

env
LOG_LEVEL=warn
Kenapa warn, bukan info atau debug: di development, info membantu Anda melihat setiap pesan masuk. Tapi di production jangka panjang, log sebanyak itu akan membengkak (logs/pm2-out.log bisa jadi berukuran raksasa dalam hitungan hari) dan menyulitkan mencari error yang benar-benar penting. warn hanya mencatat hal yang perlu perhatian (⚠️, ❌) dan error — cukup untuk monitoring produksi, tapi kalau Anda sedang debug masalah spesifik, sementara ubah balik ke info atau debug.

✅ D. Rotasi Log (mencegah disk penuh)
Karena PM2 menulis log terus-menerus (logs/pm2-out.log, logs/pm2-error.log), file ini bisa membengkak tanpa batas. Install modul rotasi log resmi PM2:

bash
pm2 install pm2-logrotate
Atur agar log dipecah per 10MB dan menyimpan maksimal 7 file lama:

bash
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
✅ E. Graceful Shutdown
Saat ini kalau PM2/sistem mengirim sinyal berhenti (SIGTERM), Node.js langsung mati mentah — berisiko korup file JSON kalau kebetulan sedang dalam proses _save() di JsonDatabase. Tambahkan graceful shutdown di src/index.js:

Cari bagian akhir file, tambahkan sebelum main();:

javascript
process.on('SIGINT', () => {
  logger.info('🛑 Menerima sinyal SIGINT, mematikan bot dengan aman...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('🛑 Menerima sinyal SIGTERM, mematikan bot dengan aman...');
  process.exit(0);
});
Penjelasan: karena JsonDatabase kita bersifat write-through (langsung tertulis ke disk setiap set(), bukan menunggu buffer), risiko korupsi sebenarnya sudah rendah. Tapi menangani sinyal ini tetap penting sebagai praktik baik — memberi kesempatan bot mencatat log "sedang shutdown" untuk keperluan audit/debug nanti.

✅ F. README.md yang Layak
File README.md Anda sepertinya masih kosong sejak Tahap 1. Untuk kelengkapan project, ada baiknya diisi minimal dengan: cara install, cara menjalankan, daftar command, dan struktur folder. Mau saya bantu buatkan sekarang?

3. Ringkasan Final Checklist
Item	Status
.env aman dari git	Perlu Anda verifikasi
Permission/owner check helper	✅ Baru dibuat
Log level production (warn)	Perlu diubah di .env
Log rotation (pm2-logrotate)	Perlu diinstall
Graceful shutdown	Perlu ditambahkan di index.js
README.md	Opsional, bisa dibuatkan
Auto-restart (Tahap 14)	✅ Selesai
Process manager (Tahap 13)	✅ Selesai
Silakan kerjakan langkah A-E di atas satu per satu (cukup cepat, tidak serumit tahap-tahap sebelumnya). Setelah semua beres, seluruh 15 Tahap dari roadmap awal Anda resmi tuntas — bot Anda sudah punya fondasi yang solid: aman, modular, ter-log dengan baik, dan tahan restart. Kabari progressnya, dan beri tahu juga kalau mau saya bantu buatkan README.md sebagai penutup dokumentasi project.

1 aku belum pernah commit, 2 semuanya udh kuubah,  3 buatkan readme


Determined to craft README documentation for finalized project
Determined to craft README documentation for finalized project
Bagus, semua sudah beres. Sekarang saya buatkan README.md yang lengkap untuk project Anda.

📄 README.md
Copy seluruh isi di bawah ini ke file README.md di root project Anda (~/whatsapp-bot/README.md), menggantikan isi yang kosong sebelumnya:

markdown
# MyWhatsAppBot

WhatsApp Bot berbasis Node.js dan Baileys (WhatsApp Multi-Device), dibangun dengan arsitektur modular, clean code, dan siap production.

## ✨ Fitur

- **Koneksi**: Pairing via QR Code, auto-reconnect, session persisten
- **Command System**: Multi-prefix (`!`, `.`, `#`, `/`), auto-load command, alias support
- **Group Management**: Kick, promote, demote (dengan permission check admin)
- **Group Protection**: Anti-link (on/off per grup), deteksi join/leave/promote/demote otomatis
- **AI Chat**: Terintegrasi Google Gemini (`!ai`, `!ask`, `!chat`)
- **Database**: Persisten berbasis JSON (users & groups), auto-provisioning, limit harian, fondasi premium/level/economy
- **Reliability**: Error handling menyeluruh (bot tidak crash), logging terstruktur (pino), dikelola PM2 dengan auto-restart

## 🛠️ Tech Stack

- Node.js (LTS) + Express
- [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) — WhatsApp Multi-Device API
- pino — logging
- fs-extra — file system utilities
- node-cache — caching metadata grup
- PM2 — process manager

## 📁 Struktur Project
    src/
    ├── config/ # Konfigurasi aplikasi (baca dari .env)
    ├── commands/ # Satu file = satu command, auto-loaded
    ├── events/ # Handler event (pesan masuk, update grup)
    ├── handlers/ # Command loader & dispatcher
    ├── middleware/ # Permission check, group protection
    ├── database/ # JSON database wrapper (users, groups)
    ├── sessions/ # Credential WhatsApp (auto-generated, JANGAN di-commit)
    ├── services/ # Logika eksternal (reply, AI provider)
    ├── utils/ # Fungsi bantu (parser, logger, helper)
    ├── lib/ # Inisialisasi koneksi Baileys
    └── index.js # Entry point

## 🚀 Instalasi

1. Clone/copy project ini
2. Install dependency:
```bash
   npm install
```
3. Copy `.env.example` (atau buat baru) menjadi `.env`, isi sesuai kebutuhan:
```env
   BOT_NAME=MyWhatsAppBot
   PREFIX="!,.,#,/"
   OWNER_NUMBER=628xxxxxxxxxx
   PORT=3000
   PAIRING_METHOD=qr
   LOG_LEVEL=warn
   SESSION_NAME=default
   NODE_ENV=production
   GEMINI_API_KEY="your-api-key-here"
   GEMINI_MODEL=gemini-2.5-flash
```

## ▶️ Menjalankan Bot

**Mode Development** (auto-reload saat kode berubah):
```bash
npm run dev
```

**Mode Production** (dikelola PM2, tetap hidup di background):
```bash
pm2 start ecosystem.config.js
pm2 save
```

Saat pertama kali dijalankan, scan QR Code yang muncul di terminal menggunakan WhatsApp: **Menu → Perangkat Tertaut → Tautkan Perangkat**.

### Perintah PM2 Berguna
```bash
pm2 list                    # cek status bot
pm2 logs whatsapp-bot        # lihat log real-time
pm2 restart whatsapp-bot     # restart manual
pm2 stop whatsapp-bot        # hentikan bot
```

## 📜 Daftar Command

| Command | Alias | Deskripsi | Akses |
|---|---|---|---|
| `!ping` | `!p` | Cek kecepatan respon bot | Semua |
| `!help` | `!menu` | Menampilkan daftar command | Semua |
| `!antilink on/off` | - | Toggle proteksi anti-link | Semua (di dalam grup) |
| `!kick` | - | Keluarkan member (reply/mention target) | Admin grup |
| `!promote` | - | Jadikan member sebagai admin | Admin grup |
| `!demote` | - | Turunkan admin jadi member | Admin grup |
| `!ai <pesan>` | `!ask`, `!chat` | Chat dengan AI (Gemini) | Semua |

## 🔒 Keamanan

- File `.env` dan `src/sessions/` **tidak pernah** di-commit ke git (lihat `.gitignore`)
- Command sensitif menggunakan permission check (`src/utils/permissionHelper.js`)
- Rate limit harian per user untuk fitur AI (`src/database/userDatabase.js`)

## 🐛 Known Issues

- Kontak dengan identitas `@lid` (fitur privasi WhatsApp) membutuhkan `@whiskeysockets/baileys` versi terbaru untuk membangun sesi enkripsi dengan benar. Selalu jalankan `npm install @whiskeysockets/baileys@latest` secara berkala.
- Jalankan hanya **1 instance** bot untuk 1 session yang sama — menjalankan lebih dari 1 proses bersamaan akan menyebabkan konflik koneksi (`stream errored — conflict: replaced`).

## 📄 Lisensi

Private project — dikembangkan untuk keperluan pembelajaran.