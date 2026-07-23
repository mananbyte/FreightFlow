import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DriverLog from './pages/DriverLog';
import SessionExpiredOverlay from './components/auth/SessionExpiredOverlay';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/log" element={<DriverLog />} />
      </Routes>
      <SessionExpiredOverlay />
    </BrowserRouter>
  );
}

export default App;
