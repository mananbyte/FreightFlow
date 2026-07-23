import React, { useState, useEffect, useRef } from 'react';

export default function LocationAutocomplete({ label, placeholder, onLocationSelect, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchText) => {
    if (searchText.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchText)}&limit=5`);
      const data = await res.json();
      setSuggestions(data.features || []);
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    fetchSuggestions(val);
  };

  const handleSelect = (feature) => {
    const name = [feature.properties.name, feature.properties.state, feature.properties.country]
      .filter(Boolean)
      .join(', ');
    setQuery(name);
    setIsOpen(false);
    onLocationSelect(feature.geometry.coordinates, name); // [lon, lat], name
  };

  return (
    <div className="form-group" ref={wrapperRef} style={{ position: 'relative' }}>
      <label>{label}</label>
      <input 
        type="text" 
        value={query} 
        onChange={handleInputChange} 
        onFocus={() => setIsOpen(query.length > 0)}
        placeholder={placeholder} 
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="autocomplete-dropdown">
          {suggestions.map((feature, idx) => (
            <li key={idx} onClick={() => handleSelect(feature)}>
              <div className="loc-name">{feature.properties.name}</div>
              <div className="loc-details">
                {[feature.properties.city, feature.properties.state, feature.properties.country].filter(Boolean).join(', ')}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
