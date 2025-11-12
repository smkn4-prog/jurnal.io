const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const multer = require('multer');
const xlsx = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'jurnal.db');
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });

const db = new Database(DB_FILE);
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize DB schema if not exists
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

// --- Simple hardcoded users for demo (replace with proper auth) ---
const demoUsers = [
  { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
  { username: 'guru1', password: 'guru123', role: 'guru', name: 'Guru Wali 1' },
  { username: 'siswa1', password: 'siswa123', role: 'siswa', name: 'Siswa 1' }
];

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const u = demoUsers.find(x => x.username === username && x.password === password);
  if (!u) return res.status(401).json({ error: 'Invalid credentials' });
  // simple token for demo
  const token = Buffer.from(`${username}:${u.role}`).toString('base64');
  res.json({ token, username: u.username, role: u.role, name: u.name });
});

// --- Jurusan CRUD ---
app.get('/api/jurusan', (req, res) => {
  const rows = db.prepare('SELECT * FROM jurusan ORDER BY kode').all();
  res.json(rows);
});

app.post('/api/jurusan', (req, res) => {
  const { kode, nama, deskripsi } = req.body;
  try {
    db.prepare('INSERT INTO jurusan (kode, nama, deskripsi) VALUES (?, ?, ?)').run(kode, nama, deskripsi);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/jurusan/:kode', (req, res) => {
  const kode = req.params.kode;
  const { nama, deskripsi } = req.body;
  db.prepare('UPDATE jurusan SET nama = ?, deskripsi = ? WHERE kode = ?').run(nama, deskripsi, kode);
  res.json({ ok: true });
});

app.delete('/api/jurusan/:kode', (req, res) => {
  const kode = req.params.kode;
  db.prepare('DELETE FROM jurusan WHERE kode = ?').run(kode);
  res.json({ ok: true });
});

// --- Guru CRUD ---
app.get('/api/guru', (req, res) => {
  const rows = db.prepare('SELECT g.*, j.nama as jurusan_nama FROM guru g LEFT JOIN jurusan j ON g.kode_jurusan = j.kode ORDER BY g.id').all();
  res.json(rows);
});

app.post('/api/guru', (req, res) => {
  const { nama, username, password, kode_jurusan, jabatan } = req.body;
  try {
    db.prepare('INSERT INTO guru (nama, username, password, kode_jurusan, jabatan) VALUES (?, ?, ?, ?, ?)').run(nama, username, password, kode_jurusan, jabatan || '');
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/guru/:id', (req, res) => {
  const id = req.params.id;
  const { nama, username, password, kode_jurusan, jabatan } = req.body;
  db.prepare('UPDATE guru SET nama=?, username=?, password=?, kode_jurusan=?, jabatan=? WHERE id=?').run(nama, username, password, kode_jurusan, jabatan, id);
  res.json({ ok: true });
});

app.delete('/api/guru/:id', (req, res) => {
  db.prepare('DELETE FROM guru WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// --- Siswa CRUD ---
app.get('/api/siswa', (req, res) => {
  const rows = db.prepare('SELECT s.*, j.nama as jurusan_nama, g.nama as guru_nama FROM siswa s LEFT JOIN jurusan j ON s.kode_jurusan=j.kode LEFT JOIN guru g ON s.guru_id=g.id ORDER BY s.id').all();
  res.json(rows);
});

app.post('/api/siswa', (req, res) => {
  const { nama, username, password, kelas, kode_jurusan } = req.body;
  try {
    db.prepare('INSERT INTO siswa (nama, username, password, kelas, kode_jurusan) VALUES (?, ?, ?, ?, ?)').run(nama, username, password, kelas || '', kode_jurusan);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/siswa/:id', (req, res) => {
  const id = req.params.id;
  const { nama, username, password, kelas, kode_jurusan, guru_id } = req.body;
  db.prepare('UPDATE siswa SET nama=?, username=?, password=?, kelas=?, kode_jurusan=?, guru_id=? WHERE id=?').run(nama, username, password, kelas, kode_jurusan, guru_id || null, id);
  res.json({ ok: true });
});

app.delete('/api/siswa/:id', (req, res) => {
  db.prepare('DELETE FROM siswa WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// --- Penugasan (link siswa <-> guru) ---
app.post('/api/penugasan', (req, res) => {
  const { guru_id, siswa_ids } = req.body; // siswa_ids: array
  const stmt = db.prepare('UPDATE siswa SET guru_id = ? WHERE id = ?');
  const tr = db.transaction((ids) => {
    ids.forEach(id => stmt.run(guru_id, id));
  });
  tr(siswa_ids);
  res.json({ ok: true });
});

// --- Jurnal siswa (7 kebiasaan) ---
app.post('/api/jurnal', (req, res) => {
  const { siswa_id, tanggal, data } = req.body; // data: JSON object for 7 kebiasaan
  const id = uuidv4();
  db.prepare('INSERT INTO jurnal (id, siswa_id, tanggal, data_json) VALUES (?, ?, ?, ?)').run(id, siswa_id, tanggal, JSON.stringify(data));
  res.json({ ok: true, id });
});

app.get('/api/jurnal', (req, res) => {
  // support query params: siswa_id, tanggal, kelas, kode_jurusan
  const { siswa_id, tanggal, kelas, kode_jurusan } = req.query;
  let q = 'SELECT j.*, s.nama as siswa_nama, s.kelas, s.kode_jurusan, g.nama as guru_nama FROM jurnal j JOIN siswa s ON j.siswa_id = s.id LEFT JOIN guru g ON s.guru_id = g.id WHERE 1=1';
  const params = [];
  if (siswa_id) { q += ' AND s.id = ?'; params.push(siswa_id); }
  if (tanggal) { q += ' AND j.tanggal = ?'; params.push(tanggal); }
  if (kelas) { q += ' AND s.kelas = ?'; params.push(kelas); }
  if (kode_jurusan) { q += ' AND s.kode_jurusan = ?'; params.push(kode_jurusan); }
  q += ' ORDER BY j.tanggal DESC';
  const rows = db.prepare(q).all(...params).map(r => ({ ...r, data: JSON.parse(r.data_json) }));
  res.json(rows);
});

// --- XLSX upload endpoints (basic parsing) ---
const upload = multer({ dest: path.join(__dirname, 'uploads') });

app.post('/api/import/jurusan', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file missing' });
  const wb = xlsx.readFile(req.file.path);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json = xlsx.utils.sheet_to_json(sheet);
  const stmt = db.prepare('INSERT OR REPLACE INTO jurusan (kode, nama, deskripsi) VALUES (?, ?, ?)');
  const tr = db.transaction((rows) => {
    rows.forEach(r => stmt.run(r.kode, r.nama, r.deskripsi || ''));
  });
  tr(json);
  fs.unlinkSync(req.file.path);
  res.json({ ok: true, imported: json.length });
});

app.post('/api/import/guru', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file missing' });
  const wb = xlsx.readFile(req.file.path);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json = xlsx.utils.sheet_to_json(sheet);
  const stmt = db.prepare('INSERT INTO guru (nama, username, password, kode_jurusan, jabatan) VALUES (?, ?, ?, ?, ?)');
  const tr = db.transaction((rows) => {
    rows.forEach(r => stmt.run(r.nama, r.username, r.password, r.kode_jurusan || null, r.jabatan || ''));
  });
  tr(json);
  fs.unlinkSync(req.file.path);
  res.json({ ok: true, imported: json.length });
});

app.post('/api/import/siswa', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file missing' });
  const wb = xlsx.readFile(req.file.path);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json = xlsx.utils.sheet_to_json(sheet);
  const stmt = db.prepare('INSERT INTO siswa (nama, username, password, kelas, kode_jurusan) VALUES (?, ?, ?, ?, ?)');
  const tr = db.transaction((rows) => {
    rows.forEach(r => stmt.run(r.nama, r.username, r.password, r.kelas || '', r.kode_jurusan || null));
  });
  tr(json);
  fs.unlinkSync(req.file.path);
  res.json({ ok: true, imported: json.length });
});

// --- Static health check ---
app.get('/', (req, res) => res.send({ ok: true, message: 'Jurnal server running' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));