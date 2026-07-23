import React, { useState } from 'react';
import AutocompleteInput from './AutocompleteInput';
import './FloatingPanel.css';

const FloatingPanel = ({ onCalculate }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [cycleHours, setCycleHours] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onCalculate) {
      onCalculate({
        current: currentLocation,
        pickup,
        dropoff,
        cycleHours: parseFloat(cycleHours) || 0
      });
    }
  };

  return (
    <div className="floating-panel">
      <h2 className="panel-title">Trip Details</h2>
      <form onSubmit={handleSubmit} className="panel-form">
        <div className="form-group">
          <label>Current Location</label>
          <AutocompleteInput 
            placeholder="Search current location..." 
            onSelectLocation={setCurrentLocation}
          />
        </div>

        <div className="form-group">
          <label>Pickup Location</label>
          <AutocompleteInput 
            placeholder="Search pickup location..." 
            onSelectLocation={setPickup}
          />
        </div>

        <div className="form-group">
          <label>Dropoff Location</label>
          <AutocompleteInput 
            placeholder="Search dropoff location..." 
            onSelectLocation={setDropoff}
          />
        </div>

        <div className="form-group">
          <label>Current Cycle Used (Hrs)</label>
          <input 
            type="number" 
            className="cycle-input"
            placeholder="e.g. 10.5" 
            step="0.1"
            min="0"
            max="70"
            value={cycleHours}
            onChange={(e) => setCycleHours(e.target.value)}
          />
        </div>

        <button type="submit" className="calculate-btn">
          Calculate Route
        </button>
      </form>
    </div>
  );
};

export default FloatingPanel;
