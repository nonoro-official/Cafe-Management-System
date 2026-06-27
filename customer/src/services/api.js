import axios from 'axios';
import { API_BASE_URL } from '../utilities/constants.js';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export default api;
