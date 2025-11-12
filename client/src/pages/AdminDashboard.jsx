import React, { useEffect, useState } from 'react';
import { getJurusan, createJurusan, getGuru, getSiswa, createSiswa } from '../services/api';

export default function AdminDashboard() {
  const [jurusan, setJurusan] = useState([]);
  const [guru, setGuru] = useState([]);
  const [siswa, setSiswa] = useState([]);
  const [newJ, setNewJ] = useState({ kode: '', nama: '', deskripsi: '' });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setJurusan(await getJurusan());
    setGuru(await getGuru());
    setSiswa(await getSiswa());
  }

  async function addJurusan(e) {
    e.preventDefault();
    await createJurusan(newJ);
    setNewJ({ kode: '', nama: '', deskripsi: '' });
    load();
  }

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <section style={{ marginBottom: 20 }}>
        <h3>Manajemen Jurusan</h3>
        <form onSubmit={addJurusan}>
          <input placeholder="kode" value={newJ.kode} onChange={e=>setNewJ({...newJ,kode:e.target.value})} />
          <input placeholder="nama" value={newJ.nama} onChange={e=>setNewJ({...newJ,nama:e.target.value})} />
          <input placeholder="deskripsi" value={newJ.deskripsi} onChange={e=>setNewJ({...newJ,deskripsi:e.target.value})} />
          <button type="submit">Tambah Jurusan</button>
        </form>
        <table border="1" cellPadding="6" style={{ marginTop: 10 }}>
          <thead><tr><th>Kode</th><th>Nama</th><th>Deskripsi</th></tr></thead>
          <tbody>
            {jurusan.map(j => <tr key={j.kode}><td>{j.kode}</td><td>{j.nama}</td><td>{j.deskripsi}</td></tr>)}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Guru & Siswa (singkat)</h3>
        <div style={{ display: 'flex', gap: 20 }}>
          <div>
            <h4>Guru</h4>
            <table border="1" cellPadding="6"><thead><tr><th>Nama</th><th>Jurusan</th></tr></thead>
              <tbody>{guru.map(g => <tr key={g.id}><td>{g.nama}</td><td>{g.jurusan_nama}</td></tr>)}</tbody>
            </table>
          </div>

          <div>
            <h4>Siswa</h4>
            <table border="1" cellPadding="6"><thead><tr><th>Nama</th><th>Kelas</th><th>Jurusan</th></tr></thead>
              <tbody>{siswa.map(s => <tr key={s.id}><td>{s.nama}</td><td>{s.kelas}</td><td>{s.jurusan_nama}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}