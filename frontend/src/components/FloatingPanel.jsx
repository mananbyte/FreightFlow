import React, { useState } from 'react';

export default function FloatingPanel({ onSubmit }) {
  const [current, setCurrent] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [cycleHours, setCycleHours] = useState(0);
  const [startTime, setStartTime] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ current, pickup, dropoff, cycleHours, startTime });
  };

  return (
    <div className="floating-panel">
      <form onSubmit={handleSubmit}>
        <input type="text" value={current} onChange={e => setCurrent(e.target.value)} placeholder="Current Location" />
        <input type="text" value={pickup} onChange={e => setPickup(e.target.value)} placeholder="Pickup Location" />
        <input type="text" value={dropoff} onChange={e => setDropoff(e.target.value)} placeholder="Dropoff Location" />
        <input type="number" value={cycleHours} onChange={e => setCycleHours(e.target.value)} placeholder="Cycle Hours Used" />
        <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
        <button type="submit">Calculate Route</button>
      </form>
    </div>
  );
}
