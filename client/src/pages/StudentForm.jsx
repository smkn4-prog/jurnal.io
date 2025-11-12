import React, { useState } from 'react';
import { createJurnal } from '../services/api';

export default function StudentForm() {
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0,10));
  const [bangun, setBangun] = useState('');
  const [ibadah, setIbadah] = useState({ agama: '', ritual: []});
  const [olahraga, setOlahraga] = useState({ jenis:'', durasi:'' });
  const [makan, setMakan] = useState({ sarapan:false, siang:false, malam:false });
  const [belajar, setBelajar] = useState('');
  const [bermasyarakat, setBermasyarakat] = useState('');
  const [tidur, setTidur] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    const data = {
      bangun, ibadah, olahraga, makan, belajar, bermasyarakat, tidur
    };
    // siswa_id hardcoded demo -> in real app, get from auth token
    const payload = { siswa_id: 1, tanggal, data };
    await createJurnal(payload);
    alert('Jurnal terkirim (demo).');
  }

  function toggleRitual(r) {
    const s = new Set(ibadah.ritual);
    if (s.has(r)) s.delete(r); else s.add(r);
    setIbadah({ ...ibadah, ritual: Array.from(s) });
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <h2>Form 7 Kebiasaan (Siswa)</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Tanggal</label><br />
          <input type="date" value={tanggal} onChange={e=>setTanggal(e.target.value)} />
        </div>

        <div>
          <h4>1. Bangun Pagi</h4>
          <input value={bangun} onChange={e=>setBangun(e.target.value)} placeholder="Waktu bangun / catatan" />
        </div>

        <div>
          <h4>2. Beribadah</h4>
          <select value={ibadah.agama} onChange={e=>setIbadah({...ibadah, agama: e.target.value, ritual: []})}>
            <option value="">--Pilih Agama--</option>
            <option value="islam">Islam</option>
            <option value="kristen">Kristen</option>
            <option value="katolik">Katolik</option>
            <option value="hindu">Hindu</option>
            <option value="buddha">Buddha</option>
            <option value="konghucu">Konghucu</option>
          </select>
          <div>
            <label><input type="checkbox" onChange={()=>toggleRitual('sholat')} /> Sholat / Doa</label>
            <label><input type="checkbox" onChange={()=>toggleRitual('puasa')} /> Puasa / Ibadah khusus</label>
          </div>
        </div>

        <div>
          <h4>3. Berolahraga</h4>
          <input placeholder="Jenis olahraga" value={olahraga.jenis} onChange={e=>setOlahraga({...olahraga, jenis:e.target.value})} />
          <input placeholder="Durasi (menit)" value={olahraga.durasi} onChange={e=>setOlahraga({...olahraga, durasi:e.target.value})} />
        </div>

        <div>
          <h4>4. Makan Sehat</h4>
          <label><input type="checkbox" checked={makan.sarapan} onChange={e=>setMakan({...makan, sarapan: e.target.checked})} /> Sarapan</label>
          <label><input type="checkbox" checked={makan.siang} onChange={e=>setMakan({...makan, siang: e.target.checked})} /> Makan Siang</label>
          <label><input type="checkbox" checked={makan.malam} onChange={e=>setMakan({...makan, malam: e.target.checked})} /> Makan Malam</label>
        </div>

        <div>
          <h4>5. Gemar Belajar</h4>
          <textarea placeholder="Kegiatan belajar" value={belajar} onChange={e=>setBelajar(e.target.value)} />
        </div>

        <div>
          <h4>6. Bermasyarakat</h4>
          <textarea placeholder="Kegiatan sosial" value={bermasyarakat} onChange={e=>setBermasyarakat(e.target.value)} />
        </div>

        <div>
          <h4>7. Tidur Cepat</h4>
          <input placeholder="Waktu tidur" value={tidur} onChange={e=>setTidur(e.target.value)} />
        </div>

        <button type="submit">Kirim Jurnal</button>
      </form>
    </div>
  );
}