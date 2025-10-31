import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/authContext';
import Home from './pages/Home';
import UserSpace from './pages/UserSpace';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user-space/:id" element={<UserSpace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/user-space" element={<UserSpace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;