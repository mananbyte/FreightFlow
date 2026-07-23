import React, { useState, useEffect, useRef } from 'react';
import './AutocompleteInput.css';

const AutocompleteInput = ({ value, onChange, placeholder, onSelectLocation }) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.length < 3 || !isOpen) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setSuggestions(data.features || []);
      } catch (error) {
        console.error('Error fetching autocomplete:', error);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, isOpen]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    if (onChange) {
      onChange(val);
    }
  };

  const handleSelect = (feature) => {
    const { name, state, country } = feature.properties;
    const [lon, lat] = feature.geometry.coordinates;
    const displayName = [name, state, country].filter(Boolean).join(', ');
    
    setQuery(displayName);
    setIsOpen(false);
    
    if (onSelectLocation) {
      onSelectLocation({
        name: displayName,
        lat,
        lon
      });
    }
  };

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <input
        type="text"
        className="autocomplete-input"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="autocomplete-dropdown">
          {suggestions.map((feature, index) => {
            const { name, state, country } = feature.properties;
            const displayName = [name, state, country].filter(Boolean).join(', ');
            return (
              <li 
                key={`${index}-${feature.properties.osm_id || index}`}
                onClick={() => handleSelect(feature)}
                className="autocomplete-item"
              >
                {displayName}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;
