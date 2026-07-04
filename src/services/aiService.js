// src/services/aiService.js
// Layer terpisah untuk komunikasi ke provider AI.
// Kalau mau ganti provider (OpenAI, Claude, dll), cukup ubah isi file ini —
// command yang manggil (ai.js) tidak perlu diubah sama sekali.

const axios = require('axios');
const logger = require('../utils/logger');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_INSTRUCTION =
  'Kamu adalah asisten WhatsApp yang ramah, singkat, dan membantu. Jawab dalam Bahasa Indonesia kecuali diminta bahasa lain. Hindari jawaban yang bertele-tele.';

/**
 * Mengirim prompt ke Gemini API dan mengembalikan teks jawabannya.
 * @param {string} prompt - Pertanyaan/perintah dari user.
 * @returns {Promise<string>} Jawaban dari AI.
 */
async function askGemini(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY belum diset di .env');
  }

  try {
    const response = await axios.post(
      GEMINI_ENDPOINT,
      {
        system_instruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        timeout: 30000,
      }
    );

    const candidate = response.data?.candidates?.[0];
    const text = candidate?.content?.parts?.map((p) => p.text).join('');

    if (!text) {
      logger.warn({ data: response.data }, 'Gemini tidak mengembalikan teks jawaban');
      throw new Error('Gemini tidak memberikan jawaban (kemungkinan diblokir safety filter).');
    }

    return text.trim();
  } catch (err) {
    if (err.response) {
      logger.error(
        { status: err.response.status, data: err.response.data },
        'Gemini API mengembalikan error'
      );
      if (err.response.status === 429) {
        throw new Error('Kuota Gemini API sudah habis untuk saat ini, coba lagi nanti.');
      }
      if (err.response.status === 400) {
        throw new Error('Permintaan ke Gemini API tidak valid (cek API key di .env).');
      }
      if (err.response.status === 403) {
        throw new Error('API key ditolak. Cek kembali GEMINI_API_KEY di .env.');
      }
    } else {
      logger.error({ err }, 'Gagal menghubungi Gemini API');
    }
    throw new Error('Gagal mendapatkan jawaban dari AI, coba lagi nanti.');
  }
}

module.exports = { askGemini };
