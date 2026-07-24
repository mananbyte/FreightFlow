import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DriverLog from './pages/DriverLog';
import MyTrips from './pages/MyTrips';
import CompletedTrips from './pages/CompletedTrips';
import RouteSeoPage from './pages/RouteSeoPage';
import Navbar from './components/Navbar';
import SessionExpiredOverlay from './components/auth/SessionExpiredOverlay';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/log" element={<DriverLog />} />
        <Route path="/trips" element={<MyTrips />} />
        <Route path="/completed-trips" element={<CompletedTrips />} />
        <Route path="/route/:routeSlug" element={<RouteSeoPage />} />
      </Routes>
      <SessionExpiredOverlay />
    </BrowserRouter>
  );
}

export default App;
