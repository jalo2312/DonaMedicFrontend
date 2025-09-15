// services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@donaMedic_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      await AsyncStorage.removeItem('@donaMedic_token');
      await AsyncStorage.removeItem('@donaMedic_user');
      // Aquí podrías redirigir al login
    }
    return Promise.reject(error);
  }
);

export default api;
