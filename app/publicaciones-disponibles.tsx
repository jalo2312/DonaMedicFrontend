// app/publicaciones-disponibles.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import publicacionService, { Publicacion } from '../services/publicacionService';
import stockService, { Stock } from '../services/stockService';
import { useAuth } from './context/AuthContext';

// Función para determinar el color del estado según el stock
const getStatusColor = (stock: Stock): string => {
  if (stock.cantidadDisponible > 0) {
    return '#4ade80'; // Verde para disponible
  } else if (stock.cantidadReservada > 0) {
    return '#fbbf24'; // Amarillo para agotado temporalmente
  } else {
    return '#ef4444'; // Rojo para sin stock
  }
};

// Función para determinar el texto del estado según el stock
const getStatusText = (stock: Stock): string => {
  if (stock.cantidadDisponible > 0) {
    return '✅ Disponible para solicitar';
  } else if (stock.cantidadReservada > 0) {
    return '⏳ Agotada temporalmente';
  } else {
    return '❌ Sin stock disponible';
  }
};

export default function PublicacionesDisponiblesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [stockMap, setStockMap] = useState<Record<number, Stock>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadPublicaciones();
  }, []);

  const loadPublicaciones = async () => {
    try {
      setIsLoading(true);
      const data = await publicacionService.getAllPublicaciones();
      setPublicaciones(data);
      
      // Cargar el stock para cada publicación
      const stockData: Record<number, Stock> = {};
      await Promise.all(
        data.map(async (publicacion) => {
          try {
            const stock = await stockService.getStockByPublicacion(publicacion.id);
            stockData[publicacion.id] = stock;
          } catch (error) {
            console.error(`Error cargando stock para publicación ${publicacion.id}:`, error);
          }
        })
      );
      setStockMap(stockData);
    } catch (error) {
      console.error('Error cargando publicaciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadPublicaciones();
    setIsRefreshing(false);
  };

  const filteredPublicaciones = publicaciones.filter(publicacion =>
    publicacion.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
    publicacion.descripcion?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handlePublicacionPress = (publicacion: Publicacion) => {
    router.push(`/publicaciones-disponibles/${publicacion.id}`);
  };

  const handleSolicitar = (publicacion: Publicacion) => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push(`/solicitar-medicamento/${publicacion.id}`);
  };

  const renderPublicacion = ({ item }: { item: Publicacion }) => (
    <TouchableOpacity
      style={styles.publicacionCard}
      onPress={() => handlePublicacionPress(item)}
    >
      <View style={styles.publicacionHeader}>
        <View style={styles.publicacionInfo}>
          <Text style={styles.publicacionTitulo}>{item.titulo}</Text>
          <Text style={styles.publicacionDescripcion} numberOfLines={2}>
            {item.descripcion || 'Sin descripción'}
          </Text>
          <Text style={styles.publicacionFecha}>
            Publicado: {new Date(item.fecha || '').toLocaleDateString()}
          </Text>
        </View>
        {item.imagen && (
          <Image source={{ uri: item.imagen }} style={styles.publicacionImagen} />
        )}
      </View>
      
      <View style={styles.publicacionFooter}>
        <View style={styles.statusContainer}>
          {stockMap[item.id] && (
            <>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(stockMap[item.id]) }
              ]}>
                <Text style={styles.statusText}>
                  {getStatusText(stockMap[item.id])}
                </Text>
              </View>
              
              <View style={styles.stockContainer}>
                <Ionicons name="cube-outline" size={16} color="#666" />
                <Text style={styles.stockText}>
                  {stockMap[item.id].cantidadDisponible} disponibles
                  {stockMap[item.id].cantidadReservada > 0 && `, ${stockMap[item.id].cantidadReservada} reservadas`}
                </Text>
              </View>
            </>
          )}
        </View>
        
        <TouchableOpacity
          style={[
            styles.solicitarButton,
            { opacity: stockMap[item.id]?.cantidadDisponible > 0 ? 1 : 0.5 }
          ]}
          onPress={() => handleSolicitar(item)}
          disabled={!stockMap[item.id] || stockMap[item.id].cantidadDisponible <= 0}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.solicitarButtonText}>Solicitar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00b140" />
        <Text style={styles.loadingText}>Cargando publicaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Medicamentos Disponibles</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar medicamentos..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
        data={filteredPublicaciones}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPublicacion}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#00b140']}
            tintColor="#00b140"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay medicamentos disponibles</Text>
            <Text style={styles.emptySubtext}>
              {searchText ? 'Intenta con otros términos de búsqueda' : 'Vuelve más tarde para ver nuevas publicaciones'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 8,
    elevation: 1,
  },
  stockText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
    marginLeft: 4,
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
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 10,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  publicacionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  publicacionHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  publicacionInfo: {
    flex: 1,
    marginRight: 12,
  },
  publicacionTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  publicacionDescripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  publicacionFecha: {
    fontSize: 12,
    color: '#999',
  },
  publicacionImagen: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  publicacionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
    elevation: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  solicitarButton: {
    backgroundColor: '#00b140',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  solicitarButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
