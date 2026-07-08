// src/scripts/migrateUsers.js
//
// Jalankan sekali: node src/scripts/migrateUsers.js
// Mengisi field-field baru (economy/level) ke user lama yang belum punya,
// tanpa mengubah field yang sudah ada nilainya.

const JsonDatabase = require('../database/jsonDatabase');

const db = new JsonDatabase('users');

const FIELD_DEFAULTS = {
  level: 1,
  exp: 0,
  lastExpAt: null,
  balance: 0,
  lastDailyAt: null,
  xpBoostUntil: null,
  inventory: [],
};

function migrate() {
  const all = db.getAll();
  const jids = Object.keys(all);
  let migratedCount = 0;

  if (jids.length === 0) {
    console.log('Tidak ada user di database. Tidak ada yang perlu dimigrasi.');
    return;
  }

  for (const jid of jids) {
    const user = all[jid];
    const patch = {};
    let changed = false;

    for (const [field, defaultValue] of Object.entries(FIELD_DEFAULTS)) {
      if (user[field] === undefined) {
        patch[field] = defaultValue;
        changed = true;
      }
    }

    if (changed) {
      db.set(jid, { ...user, ...patch });
      migratedCount += 1;
      console.log(`✅ ${jid} → menambahkan field:`, Object.keys(patch).join(', '));
    }
  }

  console.log(`\nSelesai. ${migratedCount}/${jids.length} user dimigrasi.`);
}

migrate();
