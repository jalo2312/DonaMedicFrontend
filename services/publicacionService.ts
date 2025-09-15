// services/publicacionService.ts
import api from './api';

export interface Publicacion {
  id: number;
  titulo: string;
  descripcion?: string;
  imagen?: string;
  presentacion?: string;
  fechaVencimiento: string;
  fecha?: string;
  status?: string;
  usuarioId: number;
}

export interface CreatePublicacionRequest {
  titulo: string;
  descripcion?: string;
  imagen?: string;
  presentacion?: string;
  fechaVencimiento: string;
  usuarioId: number;
  stock?: {
    cantidadDisponible: number;
  };
}

export interface UpdatePublicacionRequest {
  titulo?: string;
  descripcion?: string;
  imagen?: string;
  presentacion?: string;
  fechaVencimiento?: string;
  status?: string;
}

class PublicacionService {
  async getAllPublicaciones(): Promise<Publicacion[]> {
    try {
      const response = await api.get('/publicaciones');
      // Verificar si la respuesta tiene el formato esperado
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Formato de respuesta inesperado:', response.data);
        return [];
      }
    } catch (error: any) {
      console.error('Error al obtener publicaciones:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener publicaciones');
    }
  }

  async getPublicacionById(id: number): Promise<Publicacion> {
    try {
      const response = await api.get(`/publicaciones/${id}`);
      // Verificar si la respuesta tiene el formato esperado
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data && !Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Formato de respuesta inesperado:', response.data);
        throw new Error('Formato de respuesta inesperado');
      }
    } catch (error: any) {
      console.error('Error al obtener publicación:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener publicación');
    }
  }

  async getPublicacionesByUsuario(usuarioId: number): Promise<Publicacion[]> {
    try {
      const response = await api.get(`/publicaciones/usuario/${usuarioId}`);
      // Verificar si la respuesta tiene el formato esperado
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Formato de respuesta inesperado:', response.data);
        return [];
      }
    } catch (error: any) {
      console.error('Error al obtener publicaciones del usuario:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener publicaciones del usuario');
    }
  }

  async getPublicacionesByStatus(status: string): Promise<Publicacion[]> {
    try {
      const response = await api.get(`/publicaciones/status/${status}`);
      // Verificar si la respuesta tiene el formato esperado
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Formato de respuesta inesperado:', response.data);
        return [];
      }
    } catch (error: any) {
      console.error('Error al obtener publicaciones por estado:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener publicaciones por estado');
    }
  }

  async createPublicacion(publicacion: CreatePublicacionRequest): Promise<{ message: string; publicacionId: number }> {
    try {
      const response = await api.post('/publicaciones', publicacion);
      return {
        message: response.data.message,
        publicacionId: response.data.publicacionId || response.data.id
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear publicación');
    }
  }

  async updatePublicacion(id: number, publicacion: UpdatePublicacionRequest): Promise<boolean> {
    try {
      const response = await api.put(`/publicaciones/${id}`, publicacion);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar publicación');
    }
  }

  async deletePublicacion(id: number): Promise<boolean> {
    try {
      const response = await api.delete(`/publicaciones/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar publicación');
    }
  }
}

export default new PublicacionService();
