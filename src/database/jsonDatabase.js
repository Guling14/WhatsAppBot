// src/database/jsonDatabase.js

const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

const STORAGE_PATH = path.join(__dirname, 'storage');

// Pastikan folder penyimpanan selalu ada sebelum dipakai
fs.ensureDirSync(STORAGE_PATH);

/**
 * Kelas database sederhana berbasis file JSON.
 * Setiap instance mewakili satu "tabel" (satu file .json).
 *
 * Data disimpan di memory (this.data) untuk akses cepat,
 * dan ditulis ke disk setiap kali ada perubahan (write-through).
 */
class JsonDatabase {
  constructor(tableName) {
    this.filePath = path.join(STORAGE_PATH, `${tableName}.json`);
    this.data = {};
    this._load();
  }

  /**
   * Memuat data dari file JSON ke memory.
   * Jika file belum ada, buat file kosong baru.
   */
  _load() {
    try {
      if (fs.existsSync(this.filePath)) {
        this.data = fs.readJsonSync(this.filePath);
      } else {
        fs.writeJsonSync(this.filePath, {});
        this.data = {};
      }
    } catch (err) {
      logger.error({ err }, `Gagal memuat database dari ${this.filePath}`);
      this.data = {};
    }
  }

  /**
   * Menulis kondisi data saat ini ke file JSON di disk.
   */
  _save() {
    try {
      fs.writeJsonSync(this.filePath, this.data, { spaces: 2 });
    } catch (err) {
      logger.error({ err }, `Gagal menyimpan database ke ${this.filePath}`);
    }
  }

  /**
   * Mengambil data berdasarkan key. Jika tidak ada, kembalikan defaultValue.
   */
  get(key, defaultValue = null) {
    return this.data[key] !== undefined ? this.data[key] : defaultValue;
  }

  /**
   * Menyimpan data untuk sebuah key, lalu langsung menulis ke disk.
   */
  set(key, value) {
    this.data[key] = value;
    this._save();
    return value;
  }

  /**
   * Menghapus sebuah key dari database.
   */
  delete(key) {
    delete this.data[key];
    this._save();
  }

  /**
   * Mengecek apakah sebuah key ada di database.
   */
  has(key) {
    return this.data[key] !== undefined;
  }

  /**
   * Mengambil semua data sebagai objek.
   */
  getAll() {
    return this.data;
  }
}

module.exports = JsonDatabase;