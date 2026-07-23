import axios from 'axios';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
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
