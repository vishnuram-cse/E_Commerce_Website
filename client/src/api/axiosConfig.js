import axios from 'axios';

let apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Remove trailing slash if present
if (apiURL.endsWith('/')) {
  apiURL = apiURL.slice(0, -1);
}

// Append /api if not already present
const baseURL = apiURL.endsWith('/api') ? apiURL : `${apiURL}/api`;

const api = axios.create({
  baseURL
});

export default api;
