-- Schema untuk Jurnal Digital (SQLite)

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS jurusan (
  kode TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  deskripsi TEXT
);

CREATE TABLE IF NOT EXISTS guru (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  username TEXT UNIQUE,
  password TEXT,
  kode_jurusan TEXT,
  jabatan TEXT,
  FOREIGN KEY (kode_jurusan) REFERENCES jurusan(kode) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS siswa (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  username TEXT UNIQUE,
  password TEXT,
  kelas TEXT,
  kode_jurusan TEXT,
  guru_id INTEGER,
  FOREIGN KEY (kode_jurusan) REFERENCES jurusan(kode) ON DELETE SET NULL,
  FOREIGN KEY (guru_id) REFERENCES guru(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS jurnal (
  id TEXT PRIMARY KEY,
  siswa_id INTEGER NOT NULL,
  tanggal TEXT NOT NULL,
  data_json TEXT NOT NULL,
  FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE
);