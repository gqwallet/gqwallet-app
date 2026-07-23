import axios from 'axios';

// Single centralized Axios instance every service imports (qs-vue-frontend rule 8).
// withCredentials is mandatory: the backend transports the JWT in an httpOnly cookie,
// which the browser only sends cross-origin when credentials are explicitly allowed.
export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});
