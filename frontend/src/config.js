// API Configuration
const isDevelopment = import.meta.env.DEV;

export const API_BASE_URL = isDevelopment 
  ? 'http://127.0.0.1:8000'  // Local development
  : import.meta.env.VITE_API_URL || 'https://resume-rag-api.railway.app'; // Railway.app backend URL