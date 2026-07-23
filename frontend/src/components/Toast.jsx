import React, { useEffect, useState } from 'react';
import './Toast.css';

export default function Toast({ message, onClose, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message && !isVisible) return null;

  return (
    <div className={`toast-container ${isVisible ? 'show' : 'hide'}`}>
      <div className="toast-content glass-panel">
        <span className="toast-icon">⚠️</span>
        <span className="toast-message">{message}</span>
      </div>
    </div>
  );
}
