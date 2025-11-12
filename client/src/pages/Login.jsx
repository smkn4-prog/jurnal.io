import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const data = await login(username, password);
      // simple routing based on role
      if (data.role === 'admin') nav('/admin');
      else if (data.role === 'guru') nav('/guru');
      else nav('/siswa');
    } catch (e) {
      setErr('Login gagal: ' + (e.response?.data?.error || e.message));
    }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Username</label><br />
          <input value={username} onChange={e=>setUsername(e.target.value)} />
        </div>
        <div>
          <label>Password</label><br />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button type="submit">Login</button>
        {err && <div style={{ color: 'red' }}>{err}</div>}
      </form>
      <p>Demo accounts: admin/admin123 | guru1/guru123 | siswa1/siswa123</p>
    </div>
  );
}