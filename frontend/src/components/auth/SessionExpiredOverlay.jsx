import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import './SessionExpiredOverlay.css'; // Let's add basic styles

const SessionExpiredOverlay = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const handleSessionExpired = () => {
            setIsVisible(true);
        };
        window.addEventListener('session-expired', handleSessionExpired);
        return () => window.removeEventListener('session-expired', handleSessionExpired);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            if (isRegisterMode) {
                await client.post('/register/', { email, password, name });
                // Automatically log in after register
            }
            const res = await client.post('/token/', { username: email, password });
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            setIsVisible(false);
            setEmail('');
            setPassword('');
            setName('');
            setIsRegisterMode(false);
        } catch (err) {
            setError(isRegisterMode ? 'Registration failed.' : 'Invalid credentials, please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="session-overlay">
            <div className="session-modal glass-panel">
                <h2>{isRegisterMode ? 'Create Account' : 'Sign In Required'}</h2>
                <p>{isRegisterMode ? 'Sign up to save your trips.' : 'Please log in to save your trips.'}</p>
                {error && <div className="error-msg">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    {isRegisterMode && (
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Name</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                    )}
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Email</label>
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label>Password</label>
                        <input 
                            type="password" 
                            required 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" disabled={isLoading} className="btn-primary w-full">
                        {isLoading ? 'Processing...' : (isRegisterMode ? 'Create Account' : 'Log In')}
                    </button>
                </form>
                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    <button type="button" onClick={() => setIsRegisterMode(!isRegisterMode)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>
                        {isRegisterMode ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                    </button>
                </div>
                <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    <button type="button" onClick={() => setIsVisible(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        Continue as Guest
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionExpiredOverlay;
