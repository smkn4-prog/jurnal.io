import axios from 'axios';
const base = 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' }
});

export async function login(username, password) {
  const r = await api.post('/login', { username, password });
  return r.data;
}

export async function getJurusan() {
  const r = await api.get('/jurusan');
  return r.data;
}

export async function createJurusan(payload) {
  const r = await api.post('/jurusan', payload);
  return r.data;
}

export async function getSiswa() {
  const r = await api.get('/siswa');
  return r.data;
}

export async function createSiswa(payload) {
  const r = await api.post('/siswa', payload);
  return r.data;
}

export async function getGuru() {
  const r = await api.get('/guru');
  return r.data;
}

export async function createJurnal(payload) {
  const r = await api.post('/jurnal', payload);
  return r.data;
}