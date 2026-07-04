// src/utils/contentFilter.js

// Pola sederhana untuk mendeteksi link (http, https, www, dan domain WhatsApp grup invite)
const LINK_REGEX = /(https?:\/\/|www\.|chat\.whatsapp\.com)/i;

/**
 * Mengecek apakah sebuah teks mengandung link.
 */
function containsLink(text) {
  if (!text) return false;
  return LINK_REGEX.test(text);
}

// Daftar kata kasar dasar — bisa ditambah sesuai kebutuhan.
// Sengaja disimpan sederhana dan mudah di-extend di tahap lanjutan.
const TOXIC_WORDS = ['anjing', 'bangsat', 'kontol', 'memek'];

/**
 * Mengecek apakah teks mengandung kata-kata toxic/kasar.
 */
function containsToxicWord(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return TOXIC_WORDS.some((word) => lowerText.includes(word));
}

/**
 * Mendeteksi "virtex" (virus text) sederhana:
 * pesan dengan panjang karakter sangat besar dalam sekali kirim,
 * biasanya dipakai untuk membuat aplikasi WhatsApp penerima crash/lag.
 */
function isVirtex(text) {
  if (!text) return false;
  const VIRTEX_LENGTH_THRESHOLD = 3000;
  return text.length > VIRTEX_LENGTH_THRESHOLD;
}

module.exports = { containsLink, containsToxicWord, isVirtex };