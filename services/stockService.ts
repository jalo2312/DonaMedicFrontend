// services/stockService.ts
import api from './api';

export interface Stock {
  id: number;
  cantidadTotal: number;
  cantidadDisponible: number;
  cantidadReservada: number;
  status: string;
  publicacionId: number;
}

export interface CreateStockRequest {
  cantidadTotal: number;
  cantidadDisponible: number;
  cantidadReservada: number;
  status: string;
  publicacionId: number;
}

export interface UpdateStockRequest {
  cantidadTotal?: number;
  cantidadDisponible?: number;
  cantidadReservada?: number;
  status?: string;
}

class StockService {
  async getAllStocks(): Promise<Stock[]> {
    try {
      const response = await api.get('/stock');
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener stocks');
    }
  }

  async getStockById(id: number): Promise<Stock> {
    try {
      const response = await api.get(`/stock/${id}`);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener stock');
    }
  }

  async getStockByPublicacion(publicacionId: number): Promise<Stock> {
    try {
      const response = await api.get(`/stock/publicacion/${publicacionId}`);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener stock de la publicación');
    }
  }

  async createStock(stock: CreateStockRequest): Promise<{ message: string; stockId: number }> {
    try {
      const response = await api.post('/stock', stock);
      return {
        message: response.data.message,
        stockId: response.data.stockId || response.data.id
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear stock');
    }
  }

  async updateStock(id: number, stock: UpdateStockRequest): Promise<boolean> {
    try {
      const response = await api.put(`/stock/${id}`, stock);
      return response.data.status || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar stock');
    }
  }

  async updateStockCantidades(id: number, cantidadDisponible: number, cantidadReservada: number): Promise<boolean> {
    try {
      const response = await api.put(`/stock/${id}/cantidades`, {
        cantidadDisponible,
        cantidadReservada
      });
      return response.data.status || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar cantidades de stock');
    }
  }

  async updateStockStatus(id: number, status: string): Promise<boolean> {
    try {
      const response = await api.put(`/stock/${id}/status`, { status });
      return response.data.status || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar estado de stock');
    }
  }

  async deleteStock(id: number): Promise<boolean> {
    try {
      const response = await api.delete(`/stock/${id}`);
      return response.data.status || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar stock');
    }
  }
}

export default new StockService();
