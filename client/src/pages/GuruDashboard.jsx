import React, { useEffect, useState } from 'react';
import { api, getJurusan, getSiswa, getGuru } from '../services/api';

// Simple helper to determine status color based on completeness/values
function statusFor(data) {
  try {
    const keys = ['bangun','ibadah','olahraga','makan','belajar','bermasyarakat','tidur'];
    let filled = 0;
    keys.forEach(k => {
      const v = data[k];
      if (v === undefined || v === null) return;
      if (typeof v === 'string' && v.trim() !== '') filled++;
      else if (typeof v === 'object' && Object.keys(v).length) filled++;
      else if (typeof v === 'number') filled++;
    });
    const pct = (filled / keys.length) * 100;
    if (pct >= 85) return { label: 'Berprestasi', color: '#28a745' };
    if (pct >= 50) return { label: 'Baik', color: '#ffc107' };
    return { label: 'Perlu Perhatian', color: '#dc3545' };
  } catch (e) {
    return { label: 'Unknown', color: '#6c757d' };
  }
}

export default function GuruDashboard() {
  const [tab, setTab] = useState('monitoring'); // 'monitoring' | 'jurnal'
  const [subTab, setSubTab] = useState('pengaturan');

  // Monitoring jurnal state
  const [jurusanList, setJurusanList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [filterKelas, setFilterKelas] = useState('');
  const [filterTanggal, setFilterTanggal] = useState('');
  const [filterAgama, setFilterAgama] = useState('');
  const [filterJurusan, setFilterJurusan] = useState([]);
  const [monitoringRows, setMonitoringRows] = useState([]);
  const [detail, setDetail] = useState(null);

  const agamaOptions = [
    { value: '', label: '--Semua Agama--' },
    { value: 'islam', label: 'Islam' },
    { value: 'kristen', label: 'Kristen' },
    { value: 'katolik', label: 'Katolik' },
    { value: 'hindu', label: 'Hindu' },
    { value: 'buddha', label: 'Buddha' },
    { value: 'konghucu', label: 'Konghucu' }
  ];

  useEffect(() => {
    loadOptions();
    fetchMonitoring();
  }, []);

  async function loadOptions() {
    const [j, s, g] = await Promise.all([getJurusan(), getSiswa(), getGuru()]);
    setJurusanList(j);
    setSiswaList(s);
    setGuruList(g);
  }

  // Derive kelas options from siswa list
  const kelasOptions = Array.from(new Set(siswaList.map(s => s.kelas).filter(Boolean)));

  async function fetchMonitoring() {
    try {
      const params = {};
      if (filterKelas) params.kelas = filterKelas;
      if (filterTanggal) params.tanggal = filterTanggal;
      // backend doesn't have agama on siswa by default; assume agama stored inside jurnal.data.ibadah.agama
      if (filterJurusan.length) params.kode_jurusan = filterJurusan.join(',');
      // For simplicity: fetch jurnal and client-side filter agama & jurusan
      const res = await api.get('/jurnal', { params: {} });
      let rows = res.data || [];
      if (filterKelas) rows = rows.filter(r => r.kelas === filterKelas);
      if (filterTanggal) rows = rows.filter(r => r.tanggal === filterTanggal);
      if (filterJurusan.length) rows = rows.filter(r => filterJurusan.includes(r.kode_jurusan));
      if (filterAgama) rows = rows.filter(r => (r.data?.ibadah?.agama || '').toLowerCase() === filterAgama);
      setMonitoringRows(rows);
    } catch (err) {
      console.error('fetchMonitoring error', err);
    }
  }

  function toggleJurusan(kode) {
    setFilterJurusan(prev => prev.includes(kode) ? prev.filter(x => x !== kode) : [...prev, kode]);
  }

  function resetFilters() {
    setFilterKelas('');
    setFilterTanggal('');
    setFilterAgama('');
    setFilterJurusan([]);
    fetchMonitoring();
  }

  // Data Siswa module (simple CRUD operations)
  const [searchName, setSearchName] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [siswaPageRows, setSiswaPageRows] = useState([]);

  useEffect(() => {
    // refresh siswa list whenever changed
    setSiswaPageRows(siswaList);
  }, [siswaList]);

  function applySiswaFilters() {
    let rows = siswaList.slice();
    if (searchName) rows = rows.filter(s => s.nama.toLowerCase().includes(searchName.toLowerCase()));
    if (genderFilter) rows = rows.filter(s => (s.jenis_kelamin || '').toLowerCase() === genderFilter.toLowerCase());
    setSiswaPageRows(rows);
  }

  // Simple toggle detail modal close
  function closeDetail() { setDetail(null); }

  return (
    <div>
      <h2>Dashboard Guru Wali</h2>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <button onClick={() => setTab('monitoring')} style={{ padding: '8px 12px', background: tab==='monitoring' ? '#007bff' : '#f0f0f0', color: tab==='monitoring' ? '#fff' : '#000' }}>Monitoring Jurnal</button>
        <button onClick={() => setTab('jurnal')} style={{ padding: '8px 12px', background: tab==='jurnal' ? '#007bff' : '#f0f0f0', color: tab==='jurnal' ? '#fff' : '#000' }}>Jurnal Guru Wali</button>
      </div>

      {tab === 'monitoring' && (
        <section>
          <h3>Monitoring Jurnal Siswa yang Diampu</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <div>
              <label>Kelas</label><br />
              <select value={filterKelas} onChange={e=>{setFilterKelas(e.target.value);}}>
                <option value="">-- Semua Kelas --</option>
                {kelasOptions.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            <div>
              <label>Tanggal</label><br />
              <input type="date" value={filterTanggal} onChange={e=>setFilterTanggal(e.target.value)} />
            </div>

            <div>
              <label>Agama</label><br />
              <select value={filterAgama} onChange={e=>setFilterAgama(e.target.value)}>
                {agamaOptions.map(a => <option key={a.value} value={a.value}>{a.label}</option>)})
              </select>
            </div>

            <div style={{ minWidth: 220 }}>
              <label>Jurusan</label><br />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: 6, border: '1px solid #ddd' }}>
                {jurusanList.map(j => (
                  <label key={j.kode} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="checkbox" checked={filterJurusan.includes(j.kode)} onChange={()=>toggleJurusan(j.kode)} /> {j.nama}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ alignSelf: 'end' }}>
              <button onClick={fetchMonitoring} style={{ marginRight: 8 }}>Terapkan</button>
              <button onClick={resetFilters}>Reset</button>
            </div>
          </div>

          <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Siswa</th>
                <th>Kelas</th>
                <th>Jurusan</th>
                <th>Guru Wali</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {monitoringRows.map(r => {
                const st = statusFor(r.data);
                return (
                  <tr key={r.id}>
                    <td>{r.tanggal}</td>
                    <td>{r.siswa_nama}</td>
                    <td>{r.kelas}</td>
                    <td>{r.kode_jurusan}</td>
                    <td>{r.guru_nama}</td>
                    <td><span style={{ padding: '6px 8px', background: st.color, color: '#fff', borderRadius: 4 }}>{st.label}</span></td>
                    <td><button onClick={()=>setDetail(r)}>Lihat Detail</button></td>
                  </tr>
                );
              })}
              {monitoringRows.length === 0 && <tr><td colSpan="7">Tidak ada data</td></tr>}
            </tbody>
          </table>

          {detail && (
            <div style={{ position: 'fixed', left:0, top:0, right:0, bottom:0, background: 'rgba(0,0,0,0.4)', display:'flex', justifyContent:'center', alignItems:'center' }} onClick={closeDetail}>
              <div style={{ background:'#fff', padding:20, minWidth:600 }} onClick={e=>e.stopPropagation()}>
                <h4>Detail Jurnal - {detail.siswa_nama} ({detail.tanggal})</h4>
                <pre style={{ maxHeight: '60vh', overflow: 'auto', background: '#f8f9fa', padding: 12 }}>{JSON.stringify(detail.data, null, 2)}</pre>
                <div style={{ marginTop: 8 }}>
                  <button onClick={closeDetail}>Tutup</button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {tab === 'jurnal' && (
        <section>
          <h3>Jurnal Guru Wali</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button onClick={()=>setSubTab('pengaturan')} style={{ background: subTab==='pengaturan' ? '#17a2b8' : '#f0f0f0', color: subTab==='pengaturan' ? '#fff' : '#000' }}>Pengaturan</button>
            <button onClick={()=>setSubTab('data-siswa')} style={{ background: subTab==='data-siswa' ? '#17a2b8' : '#f0f0f0', color: subTab==='data-siswa' ? '#fff' : '#000' }}>Data Siswa</button>
            <button onClick={()=>setSubTab('monitoring-akademik')} style={{ background: subTab==='monitoring-akademik' ? '#17a2b8' : '#f0f0f0', color: subTab==='monitoring-akademik' ? '#fff' : '#000' }}>Monitoring Akademik</button>
            <button onClick={()=>setSubTab('monitoring-non-akademik')} style={{ background: subTab==='monitoring-non-akademik' ? '#17a2b8' : '#f0f0f0', color: subTab==='monitoring-non-akademik' ? '#fff' : '#000' }}>Monitoring Non-Akademik</button>
            <button onClick={()=>setSubTab('program')} style={{ background: subTab==='program' ? '#17a2b8' : '#f0f0f0', color: subTab==='program' ? '#fff' : '#000' }}>Program & Tindak Lanjut</button>
            <button onClick={()=>setSubTab('laporan')} style={{ background: subTab==='laporan' ? '#17a2b8' : '#f0f0f0', color: subTab==='laporan' ? '#fff' : '#000' }}>Laporan</button>
          </div>

          {subTab === 'pengaturan' && (
            <div>
              <h4>Modul Pengaturan</h4>
              <p>Form pengaturan sekolah, guru wali, tahun ajaran, kelas, jurusan, dan semester. (Simpan data menggunakan endpoint /api/settings — belum tersedia, placeholder.)</p>
              <form onSubmit={(e)=>{ e.preventDefault(); alert('Simpan pengaturan (placeholder)'); }}>
                <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label>Nama Sekolah</label>
                    <input />
                  </div>
                  <div>
                    <label>Nama Guru Wali</label>
                    <input />
                  </div>
                  <div>
                    <label>Tahun Ajaran</label>
                    <input />
                  </div>
                  <div>
                    <label>Semester</label>
                    <select><option>Ganjil</option><option>Genap</option></select>
                  </div>
                  <div>
                    <label>Kelas yang Diampu (pisahkan koma)</label>
                    <input />
                  </div>
                  <div>
                    <label>Jurusan yang Diampu</label>
                    <div style={{ border: '1px solid #ddd', padding: 8 }}>
                      {jurusanList.map(j => <label key={j.kode} style={{ display:'block' }}><input type="checkbox" /> {j.nama}</label>)})
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}><button type="submit">Simpan</button></div>
              </form>
            </div>
          )}

          {subTab === 'data-siswa' && (
            <div>
              <h4>Modul Data Siswa</h4>
              <div style={{ display:'flex', gap: 8, marginBottom: 8 }}>
                <input placeholder="Cari nama..." value={searchName} onChange={e=>setSearchName(e.target.value)} />
                <select value={genderFilter} onChange={e=>setGenderFilter(e.target.value)}>
                  <option value="">--Semua Jenis Kelamin--</option>
                  <option value="laki-laki">Laki-laki</option>
                  <option value="perempuan">Perempuan</option>
                </select>
                <button onClick={applySiswaFilters}>Cari</button>
                <button onClick={()=>{ setSearchName(''); setGenderFilter(''); setSiswaPageRows(siswaList); }}>Reset</button>
              </div>

              <table border="1" cellPadding="6" style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr><th>NISN</th><th>Nama</th><th>Jenis Kelamin</th><th>TTL</th><th>Alamat</th><th>Kelas</th><th>Jurusan</th></tr></thead>
                <tbody>
                  {siswaPageRows.map(s => (
                    <tr key={s.id}>
                      <td>{s.nisn || '-'}</td>
                      <td>{s.nama}</td>
                      <td>{s.jenis_kelamin || '-'}</td>
                      <td>{(s.tempat_lahir||'') + ' ' + (s.tanggal_lahir||'')}</td>
                      <td>{s.alamat || '-'}</td>
                      <td>{s.kelas}</td>
                      <td>{s.jurusan_nama || s.kode_jurusan}</td>
                    </tr>
                  ))}
                  {siswaPageRows.length === 0 && <tr><td colSpan="7">Tidak ada siswa</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {subTab === 'monitoring-akademik' && (
            <div>
              <h4>Modul Monitoring Akademik</h4>
              <p>Form input nilai UTS & UAS per mata pelajaran, perhitungan rata-rata kelas, dan status warna otomatis. (Placeholder UI.)</p>
              <p>Implementasi backend expected: /api/akademik endpoints. Saat ini masih placeholder.</p>
            </div>
          )}

          {subTab === 'monitoring-non-akademik' && (
            <div>
              <h4>Modul Monitoring Non-Akademik</h4>
              <p>Catatan kedisiplinan & sosial-emosional, termasuk tanggal kejadian dan tindak lanjut. (Placeholder UI.)</p>
            </div>
          )}

          {subTab === 'program' && (
            <div>
              <h4>Modul Program & Tindak Lanjut</h4>
              <p>Catat program: Kasus, Pertemuan Orang Tua, Bimbingan, Program Khusus. Toggle status Dalam Proses / Selesai. (Placeholder UI.)</p>
            </div>
          )}

          {subTab === 'laporan' && (
            <div>
              <h4>Modul Laporan</h4>
              <p>Generate: Laporan Akademik, Non-Akademik, Program & Tindak Lanjut, atau Laporan Lengkap. Dapat dicetak atau didownload sebagai HTML.</p>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>alert('Generate Laporan Akademik (placeholder)')}>Laporan Akademik</button>
                <button onClick={()=>alert('Generate Laporan Non-Akademik (placeholder)')}>Laporan Non-Akademik</button>
                <button onClick={()=>alert('Generate Laporan Program (placeholder)')}>Laporan Program</button>
                <button onClick={()=>alert('Generate Laporan Lengkap (placeholder)')}>Laporan Lengkap</button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}