import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DriverLog from './pages/DriverLog';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/log" element={<DriverLog />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
