// src/database/userDatabase.js

const JsonDatabase = require('./jsonDatabase');
const SHOP_ITEMS = require('../config/shopItems');

const db = new JsonDatabase('users');

const EXP_COOLDOWN_MS = 60 * 1000;
const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const XP_BOOST_DURATION_MS = 60 * 60 * 1000;
const WARNING_LIMIT = 3;

function createDefaultUser(jid, pushName) {
  return {
    jid,
    name: pushName || 'Unknown',
    isPremium: false,
    premiumUntil: null,
    isBanned: false,
    warningCount: 0,
    limit: 25,
    limitResetAt: getNextMidnight(),
    level: 1,
    exp: 0,
    lastExpAt: null,
    balance: 0,
    lastDailyAt: null,
    xpBoostUntil: null,
    inventory: [],
    isAfk: false,
    afkReason: null,
    afkSince: null,
    registeredAt: Date.now(),
  };
}

function getNextMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function expNeededForLevel(level) {
  return level * 100;
}

function getUser(jid, pushName) {
  if (!db.has(jid)) {
    db.set(jid, createDefaultUser(jid, pushName));
  }

  const user = db.get(jid);

  if (Date.now() >= user.limitResetAt) {
    user.limit = 25;
    user.limitResetAt = getNextMidnight();
    db.set(jid, user);
  }

  return user;
}

function updateUser(jid, partialData) {
  const user = getUser(jid);
  const updated = { ...user, ...partialData };
  db.set(jid, updated);
  return updated;
}

function consumeLimit(jid) {
  const user = getUser(jid);
  if (user.isPremium) return true;
  if (user.limit <= 0) return false;

  updateUser(jid, { limit: user.limit - 1 });
  return true;
}

function addExp(jid, amount = null) {
  const user = getUser(jid);
  const now = Date.now();

  if (user.lastExpAt && now - user.lastExpAt < EXP_COOLDOWN_MS) {
    return { gained: 0, leveledUp: false, newLevel: user.level, user };
  }

  const isBoosted = user.xpBoostUntil && user.xpBoostUntil > now;
  const baseGain = amount ?? randomInt(5, 15);
  const gained = isBoosted ? baseGain * 2 : baseGain;

  let { level, exp } = user;
  exp += gained;

  let leveledUp = false;
  let needed = expNeededForLevel(level);
  while (exp >= needed) {
    exp -= needed;
    level += 1;
    leveledUp = true;
    needed = expNeededForLevel(level);
  }

  const updated = updateUser(jid, { exp, level, lastExpAt: now });
  return { gained, leveledUp, newLevel: level, user: updated };
}

function addBalance(jid, amount) {
  const user = getUser(jid);
  return updateUser(jid, { balance: user.balance + amount });
}

function claimDaily(jid) {
  const user = getUser(jid);
  const now = Date.now();

  if (user.lastDailyAt && now - user.lastDailyAt < DAILY_COOLDOWN_MS) {
    const remainingMs = DAILY_COOLDOWN_MS - (now - user.lastDailyAt);
    return { success: false, remainingMs };
  }

  const baseReward = randomInt(500, 1500);
  const levelBonus = user.level * 10;
  const reward = baseReward + levelBonus;

  const updated = updateUser(jid, {
    balance: user.balance + reward,
    lastDailyAt: now,
  });

  return { success: true, reward, baseReward, levelBonus, user: updated };
}

function transferBalance(fromJid, toJid, amount) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error('Jumlah transfer harus berupa angka bulat lebih dari 0.');
  }

  if (fromJid === toJid) {
    throw new Error('Tidak bisa transfer ke diri sendiri.');
  }

  const sender = getUser(fromJid);
  if (sender.balance < amount) {
    throw new Error('Saldo kamu tidak cukup.');
  }

  const receiver = getUser(toJid);

  updateUser(fromJid, { balance: sender.balance - amount });
  updateUser(toJid, { balance: receiver.balance + amount });

  return { senderBalance: sender.balance - amount, receiverBalance: receiver.balance + amount };
}

function buyItem(jid, itemId) {
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item) {
    throw new Error('Item tidak ditemukan. Cek `!shop` untuk lihat daftar item.');
  }

  const user = getUser(jid);
  if (user.balance < item.price) {
    throw new Error(`Saldo tidak cukup. Butuh ${item.price}, saldo kamu ${user.balance}.`);
  }

  const updates = { balance: user.balance - item.price };

  if (item.stackable) {
    const now = Date.now();
    const currentBoostBase = user.xpBoostUntil && user.xpBoostUntil > now ? user.xpBoostUntil : now;
    updates.xpBoostUntil = currentBoostBase + XP_BOOST_DURATION_MS;
  } else {
    if (user.inventory.includes(item.id)) {
      throw new Error('Kamu sudah punya item ini.');
    }
    updates.inventory = [...user.inventory, item.id];
  }

  const updated = updateUser(jid, updates);
  return { item, user: updated };
}

function getLeaderboard(type = 'balance', limit = 10) {
  const all = Object.values(db.getAll());

  const sorted = all.sort((a, b) => {
    if (type === 'level') {
      if (b.level !== a.level) return b.level - a.level;
      return b.exp - a.exp;
    }
    return b.balance - a.balance;
  });

  return sorted.slice(0, limit);
}

function banUser(jid) {
  return updateUser(jid, { isBanned: true });
}

function unbanUser(jid) {
  return updateUser(jid, { isBanned: false, warningCount: 0 });
}

function addPremium(jid, days) {
  const user = getUser(jid);
  const now = Date.now();
  const base = user.premiumUntil && user.premiumUntil > now ? user.premiumUntil : now;
  const premiumUntil = base + days * 24 * 60 * 60 * 1000;
  return updateUser(jid, { isPremium: true, premiumUntil });
}

function delPremium(jid) {
  return updateUser(jid, { isPremium: false, premiumUntil: null });
}

function addWarning(jid) {
  const user = getUser(jid);
  const warningCount = (user.warningCount || 0) + 1;
  const updates = { warningCount };
  let autoBanned = false;

  if (warningCount >= WARNING_LIMIT) {
    updates.isBanned = true;
    autoBanned = true;
  }

  const updated = updateUser(jid, updates);
  return { warningCount, autoBanned, user: updated };
}

function resetWarning(jid) {
  return updateUser(jid, { warningCount: 0 });
}

module.exports = {
  getUser,
  updateUser,
  consumeLimit,
  createDefaultUser,
  addExp,
  addBalance,
  claimDaily,
  transferBalance,
  buyItem,
  getLeaderboard,
  expNeededForLevel,
  banUser,
  unbanUser,
  addPremium,
  delPremium,
  addWarning,
  resetWarning,
  WARNING_LIMIT,
};
