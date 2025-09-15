// services/solicitudService.ts
import api from './api';

export interface Solicitud {
  id: number;
  cantidad: number;
  fecha?: string;
  usuarioId: number;
  publicacionId: number;
  estadoId: number;
}

export interface Envio {
  id: number;
  direccion: string;
  localidad?: string;
  barrio?: string;
  solicitudId: number;
}

export interface CreateSolicitudRequest {
  cantidad: number;
  usuarioId: number;
  publicacionId: number;
  estadoId?: number;
  envio?: {
    direccion: string;
    localidad?: string;
    barrio?: string;
  };
}

export interface UpdateSolicitudRequest {
  cantidad?: number;
  estadoId?: number;
}

export interface ResponderSolicitudRequest {
  decision: 'aceptada' | 'rechazada';
}

class SolicitudService {
  async getAllSolicitudes(): Promise<Solicitud[]> {
    try {
      const response = await api.get('/solicitudes');
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener solicitudes');
    }
  }

  async getSolicitudById(id: number): Promise<Solicitud> {
    try {
      const response = await api.get(`/solicitudes/${id}`);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener solicitud');
    }
  }

  async getSolicitudesByUsuario(usuarioId: number): Promise<Solicitud[]> {
    try {
      const response = await api.get(`/solicitudes/usuario/${usuarioId}`);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener solicitudes del usuario');
    }
  }

  async getSolicitudesByPublicacion(publicacionId: number): Promise<Solicitud[]> {
    try {
      const response = await api.get(`/solicitudes/publicacion/${publicacionId}`);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener solicitudes de la publicación');
    }
  }

  async getSolicitudesByEstado(estadoId: number): Promise<Solicitud[]> {
    try {
      const response = await api.get(`/solicitudes/estado/${estadoId}`);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener solicitudes por estado');
    }
  }

  async createSolicitud(solicitud: CreateSolicitudRequest): Promise<{ solicitudId: number; envioId?: number }> {
    try {
      const response = await api.post('/solicitudes', solicitud);
      return response.data.data || {
        solicitudId: response.data.solicitudId,
        envioId: response.data.envioId
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear solicitud');
    }
  }

  async updateSolicitud(id: number, solicitud: UpdateSolicitudRequest): Promise<boolean> {
    try {
      const response = await api.put(`/solicitudes/${id}`, solicitud);
      return response.data.status || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar solicitud');
    }
  }

  async deleteSolicitud(id: number): Promise<boolean> {
    try {
      const response = await api.delete(`/solicitudes/${id}`);
      return response.data.status || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar solicitud');
    }
  }

  async cambiarEstadoSolicitud(id: number, estadoId: number): Promise<boolean> {
    try {
      const response = await api.patch(`/solicitudes/${id}/estado`, { estadoId });
      return response.data.status || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cambiar estado de solicitud');
    }
  }

  async responderSolicitud(id: number, decision: 'aceptada' | 'rechazada'): Promise<boolean> {
    try {
      const response = await api.put(`/solicitudes/${id}/responder`, { decision });
      return response.data.status || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al responder solicitud');
    }
  }
}

export default new SolicitudService();
