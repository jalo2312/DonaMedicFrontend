// app/publicaciones-disponibles/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import publicacionService, { Publicacion } from '../../services/publicacionService';
import { useAuth } from '../context/AuthContext';

export default function DetallePublicacionDisponibleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [publicacion, setPublicacion] = useState<Publicacion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPublicacion();
    }
  }, [id]);

  const loadPublicacion = async () => {
    try {
      setIsLoading(true);
      const data = await publicacionService.getPublicacionById(parseInt(id!));
      setPublicacion(data);
    } catch (error) {
      console.error('Error cargando publicación:', error);
      Alert.alert('Error', 'No se pudo cargar la publicación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSolicitar = () => {
    if (!user) {
      Alert.alert(
        'Iniciar Sesión',
        'Necesitas iniciar sesión para solicitar medicamentos',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Iniciar Sesión', onPress: () => router.push('/login') }
        ]
      );
      return;
    }
    router.push(`/solicitar-medicamento/${id}`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00b140" />
        <Text style={styles.loadingText}>Cargando publicación...</Text>
      </View>
    );
  }

  if (!publicacion) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#e53e3e" />
        <Text style={styles.errorText}>Publicación no encontrada</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Medicamento</Text>
        <View style={styles.placeholder} />
      </View>

      {publicacion.imagen && (
        <Image source={{ uri: publicacion.imagen }} style={styles.imagen} />
      )}

      <View style={styles.content}>
        <View style={styles.tituloContainer}>
          <Text style={styles.titulo}>{publicacion.titulo}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: publicacion.status === 'disponible' ? '#4ade80' : '#fbbf24' }
          ]}>
            <Text style={styles.statusText}>
              {publicacion.status === 'disponible' ? 'Disponible' : 'Reservado'}
            </Text>
          </View>
        </View>

        {publicacion.descripcion && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.sectionContent}>{publicacion.descripcion}</Text>
          </View>
        )}

        {publicacion.presentacion && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Presentación</Text>
            <Text style={styles.sectionContent}>{publicacion.presentacion}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fecha de Vencimiento</Text>
          <Text style={styles.sectionContent}>
            {new Date(publicacion.fechaVencimiento).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fecha de Publicación</Text>
          <Text style={styles.sectionContent}>
            {new Date(publicacion.fecha || '').toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color="#00b140" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Información Importante</Text>
            <Text style={styles.infoText}>
              • Verifica la fecha de vencimiento antes de solicitar{'\n'}
              • Asegúrate de que el medicamento esté en buen estado{'\n'}
              • Contacta al donante para coordinar la entrega
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.solicitarButton,
            { opacity: publicacion.status === 'disponible' ? 1 : 0.5 }
          ]}
          onPress={handleSolicitar}
          disabled={publicacion.status !== 'disponible'}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.solicitarButtonText}>
            {publicacion.status === 'disponible' ? 'Solicitar Medicamento' : 'No Disponible'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

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
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#e53e3e',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#00b140',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  imagen: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 20,
  },
  tituloContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00b140',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  solicitarButton: {
    backgroundColor: '#00b140',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  solicitarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
