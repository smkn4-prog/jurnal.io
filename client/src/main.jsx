import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import GuruDashboard from './pages/GuruDashboard';
import StudentForm from './pages/StudentForm';

const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Login />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="guru" element={<GuruDashboard />} />
        <Route path="siswa" element={<StudentForm />} />
      </Route>
    </Routes>
  </BrowserRouter>
);