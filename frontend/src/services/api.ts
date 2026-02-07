import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// UUID del usuario demo precargado en la base de datos
export const DEMO_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

export default api;
