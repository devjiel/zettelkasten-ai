import axios from 'axios';

// Création d'une instance d'axios avec une configuration de base
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api; 