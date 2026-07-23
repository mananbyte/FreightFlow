import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import './SessionExpiredOverlay.css'; // Let's add basic styles

const SessionExpiredOverlay = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const handleSessionExpired = () => {
            setIsVisible(true);
        };
        window.addEventListener('session-expired', handleSessionExpired);
        return () => window.removeEventListener('session-expired', handleSessionExpired);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const res = await client.post('/token/', { username: email, password });
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            setIsVisible(false);
            setEmail('');
            setPassword('');
        } catch (err) {
            setError('Invalid credentials, please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="session-overlay">
            <div className="session-modal glass-panel">
                <h2>Session Expired</h2>
                <p>Please log in again to continue where you left off.</p>
                {error && <div className="error-msg">{error}</div>}
                
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            required 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" disabled={isLoading} className="btn-primary w-full">
                        {isLoading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SessionExpiredOverlay;
