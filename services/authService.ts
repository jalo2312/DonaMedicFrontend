// services/authService.ts
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: number;
  status: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: number;
  password: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/login', credentials);
      const { token } = response.data;
      
      // Guardar token
      await AsyncStorage.setItem('@donaMedic_token', token);
      
      // Obtener información del usuario
      const userResponse = await this.getCurrentUser();
      
      return {
        token,
        user: userResponse
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  }

  async register(userData: RegisterRequest): Promise<{ message: string; userId: number }> {
    try {
      const response = await api.post('/users', userData);
      return {
        message: response.data.message,
        userId: parseInt(response.data.message.split(' ').pop() || '0')
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al registrarse');
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const token = await AsyncStorage.getItem('@donaMedic_token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Decodificar el token para obtener el ID del usuario
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;

      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuario');
    }
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<boolean> {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar usuario');
    }
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@donaMedic_token');
      await AsyncStorage.removeItem('@donaMedic_user');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('@donaMedic_token');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('@donaMedic_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  async storeUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem('@donaMedic_user', JSON.stringify(user));
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  }
}

export default new AuthService();
