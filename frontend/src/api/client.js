import axios from 'axios';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
});

// Request interceptor: attach token
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Response interceptor: handle 401
client.interceptors.response.use((response) => {
    return response;
}, async (error) => {
    const originalRequest = error.config;
    
    // Ignore health check failures
    if (originalRequest.url.includes('/health/')) {
        return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
            try {
                const response = await axios.post(`${client.defaults.baseURL}/token/refresh/`, {
                    refresh: refreshToken
                });
                const newAccess = response.data.access;
                localStorage.setItem('access_token', newAccess);
                
                // Retry original request
                originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                return client(originalRequest);
            } catch (refreshError) {
                // Refresh failed
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.dispatchEvent(new Event('session-expired'));
                return Promise.reject(refreshError);
            }
        } else {
            // No refresh token available, session expired
            window.dispatchEvent(new Event('session-expired'));
        }
    }
    
    return Promise.reject(error);
});

export const checkHealth = async () => {
    try {
        const response = await client.get('/health/');
        return response.data;
    } catch (error) {
        console.error("Health check failed", error);
        throw error;
    }
};

export default client;
