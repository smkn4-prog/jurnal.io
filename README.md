# Jurnal Digital 7 Kebiasaan Anak Indonesia Hebat (Starter Kit)

Deskripsi singkat
Aplikasi starter full-stack: backend Express + SQLite, frontend React (Vite). Menyertakan:
- Login 3 role: admin, guru wali, siswa (hardcoded awalnya)
- CRUD Jurusan, Guru, Siswa
- Penautan siswa ke guru wali
- Form jurnal siswa (7 kebiasaan) sederhana
- Import XLSX (stubs / implementasi dasar)
- Contoh UI dasar: Login, Admin Dashboard, Guru Dashboard, Form Siswa

Cara menjalankan (lokal)
1. Pastikan Node.js >= 18 dan npm terpasang.
2. Backend:
   - cd server
   - npm install
   - node index.js
   Server berjalan di http://localhost:4000
3. Frontend:
   - cd client
   - npm install
   - npm run dev
   Frontend berjalan di http://localhost:5173

Database
- SQLite file: server/data/jurnal.db
- Skema awal ada di server/schema.sql

Pengguna awal (untuk demo)
- Admin: username: admin, password: admin123
- Guru Wali: username: guru1, password: guru123
- Siswa: username: siswa1, password: siswa123

Catatan pengembangan
- Autentikasi saat ini sederhana (token statis) — untuk produksi gunakan JWT dan hashing password.
- Upload XLSX menggunakan paket `xlsx` sudah di-setup; lakukan validasi lebih kuat pada kolom.
- Frontend masih sederhana; Anda bisa mengganti styling dengan Tailwind/Bootstrap/Ant Design.
- Fitur laporan (generate HTML/PDF) disiapkan sebagai endpoint/placeholder di backend.

Roadmap singkat (saran langkah selanjutnya)
1. Tambah autentikasi lengkap (JWT + refresh token)
2. Validasi input dan sanitasi (backend + frontend)
3. UI/UX: komponen tabel yang lengkap, pagination, filter kompleks
4. Unit & integration tests
5. Deployment (Heroku/Vercel + managed DB)

Kontak