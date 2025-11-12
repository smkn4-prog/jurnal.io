import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function App() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 20 }}>
      <header style={{ marginBottom: 20 }}>
        <h1>Jurnal Digital 7 Kebiasaan Anak Indonesia Hebat</h1>
        <nav>
          <Link to="/">Login</Link> {' | '}
          <Link to="/admin">Admin</Link> {' | '}
          <Link to="/guru">Guru Wali</Link> {' | '}
          <Link to="/siswa">Siswa</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}