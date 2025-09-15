// components/NotificacionesSolicitudes.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../app/context/AuthContext';
import solicitudService from '../services/solicitudService';
import publicacionService from '../services/publicacionService';

interface SolicitudItem {
  id: number;
  cantidad: number;
  fecha?: string;
  usuarioId: number;
  publicacionId: number;
  estadoId: number;
  // Podríamos agregar más campos si es necesario
}

const estadoLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Pendiente', color: '#FFA500' }, // Naranja
  2: { label: 'Aceptada', color: '#00b140' },  // Verde
  3: { label: 'Rechazada', color: '#FF0000' },  // Rojo
};

const NotificacionesSolicitudes = () => {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<SolicitudItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Primero obtener las publicaciones del usuario
      const misPublicaciones = await publicacionService.getPublicacionesByUsuario(user.id);
      
      // Luego obtener todas las solicitudes para esas publicaciones
      const todasLasSolicitudes: SolicitudItem[] = [];
      
      for (const publicacion of misPublicaciones) {
        const solicitudesPublicacion = await solicitudService.getSolicitudesByPublicacion(publicacion.id);
        todasLasSolicitudes.push(...solicitudesPublicacion);
      }
      
      // Filtrar solo las solicitudes pendientes (estadoId === 1)
      setSolicitudes(todasLasSolicitudes.filter(sol => sol.estadoId === 1));
    } catch (err: any) {
      setError(err.message || 'Error al cargar las solicitudes');
      Alert.alert('Error', 'No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleResponderSolicitud = async (id: number, decision: 'aceptada' | 'rechazada') => {
    try {
      setLoading(true);
      await solicitudService.responderSolicitud(id, decision);
      
      // Actualizar la lista de solicitudes después de responder
      await cargarSolicitudes();
      
      Alert.alert(
        'Éxito',
        `La solicitud ha sido ${decision === 'aceptada' ? 'aceptada' : 'rechazada'} correctamente`
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || `No se pudo ${decision === 'aceptada' ? 'aceptar' : 'rechazar'} la solicitud`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00b140" />
        <Text style={styles.loadingText}>Cargando solicitudes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF0000" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={cargarSolicitudes}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (solicitudes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No tienes solicitudes pendientes</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={solicitudes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.solicitudCard}>
            <View style={styles.solicitudHeader}>
              <Text style={styles.solicitudTitle}>Solicitud #{item.id}</Text>
              <View style={[styles.estadoBadge, { backgroundColor: estadoLabels[item.estadoId]?.color || '#999' }]}>
                <Text style={styles.estadoText}>{estadoLabels[item.estadoId]?.label || 'Desconocido'}</Text>
              </View>
            </View>
            
            <View style={styles.solicitudDetails}>
              <Text style={styles.detailText}>Cantidad: {item.cantidad}</Text>
              <Text style={styles.detailText}>Fecha: {item.fecha ? new Date(item.fecha).toLocaleDateString() : 'N/A'}</Text>
              <Text style={styles.detailText}>ID Publicación: {item.publicacionId}</Text>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleResponderSolicitud(item.id, 'aceptada')}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Aceptar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleResponderSolicitud(item.id, 'rechazada')}
              >
                <Ionicons name="close-circle" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Rechazar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#00b140',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  solicitudCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  solicitudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  solicitudTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  solicitudDetails: {
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  acceptButton: {
    backgroundColor: '#00b140',
  },
  rejectButton: {
    backgroundColor: '#FF0000',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default NotificacionesSolicitudes;