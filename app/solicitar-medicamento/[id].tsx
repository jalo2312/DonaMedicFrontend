// app/solicitar-medicamento/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import publicacionService, { Publicacion } from '../../services/publicacionService';
import solicitudService from '../../services/solicitudService';
import stockService, { Stock } from '../../services/stockService';
import { useAuth } from '../context/AuthContext';

export default function SolicitarMedicamentoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [publicacion, setPublicacion] = useState<Publicacion | null>(null);
  const [stock, setStock] = useState<Stock | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Formulario de solicitud
  const [cantidad, setCantidad] = useState('1');
  const [direccion, setDireccion] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [barrio, setBarrio] = useState('');
  const [comentarios, setComentarios] = useState('');
  
  // Estado para mostrar mensaje de ajuste de cantidad
  const [mostrarMensajeAjuste, setMostrarMensajeAjuste] = useState(false);

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
      
      // Cargar información de stock
      try {
        const stockData = await stockService.getStockByPublicacion(parseInt(id!));
        setStock(stockData);
        
        // Ajustar cantidad inicial si es necesario
        if (stockData.cantidadDisponible < 1) {
          setCantidad('0');
        } else {
          setCantidad('1');
        }
      } catch (stockError) {
        console.error('Error cargando stock:', stockError);
        // No mostramos alerta para no interrumpir el flujo
      }
    } catch (error) {
      console.error('Error cargando publicación:', error);
      Alert.alert('Error', 'No se pudo cargar la publicación');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para validar y ajustar la cantidad según el stock disponible
  const validarCantidad = (cantidadIngresada: string): number => {
    if (!stock) return 0;
    
    const cantidadNum = parseInt(cantidadIngresada);
    if (isNaN(cantidadNum) || cantidadNum < 1) return 0;
    
    // Si la cantidad solicitada es mayor al stock disponible, ajustar
    if (cantidadNum > stock.cantidadDisponible) {
      return stock.cantidadDisponible;
    }
    
    return cantidadNum;
  };
  
  // Función para manejar cambios en la cantidad
  const handleCantidadChange = (value: string) => {
    setCantidad(value);
    setMostrarMensajeAjuste(false);
  };
  
  const handleSolicitar = async () => {
    if (!user || !publicacion || !stock) return;

    // Validaciones
    if (!cantidad || parseInt(cantidad) < 1) {
      Alert.alert('Error', 'La cantidad debe ser mayor a 0');
      return;
    }
    
    if (!direccion.trim()) {
      Alert.alert('Error', 'La dirección es obligatoria');
      return;
    }
    
    // Validar cantidad contra stock disponible
    const cantidadValidada = validarCantidad(cantidad);
    
    // Si no hay stock disponible
    if (stock.cantidadDisponible <= 0) {
      Alert.alert('Sin stock', 'Lo sentimos, este medicamento no tiene unidades disponibles actualmente.');
      return;
    }
    
    // Si la cantidad solicitada es mayor al stock disponible
    if (parseInt(cantidad) > stock.cantidadDisponible) {
      // Preguntar al usuario si desea ajustar la cantidad
      Alert.alert(
        'Cantidad no disponible',
        `Solo hay ${stock.cantidadDisponible} unidades disponibles. ¿Desea ajustar la cantidad?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Ajustar y continuar',
            onPress: () => {
              setCantidad(stock.cantidadDisponible.toString());
              setMostrarMensajeAjuste(true);
            }
          }
        ]
      );
      return;
    }

    try {
      setIsSubmitting(true);
      
      await solicitudService.createSolicitud({
        cantidad: cantidadValidada,
        usuarioId: user.id,
        publicacionId: publicacion.id,
        estadoId: 1, // Estado pendiente
        envio: {
          direccion: direccion.trim(),
          localidad: localidad.trim() || undefined,
          barrio: barrio.trim() || undefined,
        }
      });

      Alert.alert(
        'Solicitud Enviada',
        'Tu solicitud ha sido enviada correctamente. El donante será notificado.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00b140" />
        <Text style={styles.loadingText}>Cargando información...</Text>
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
        <Text style={styles.headerTitle}>Solicitar Medicamento</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.medicamentoInfo}>
          <Text style={styles.medicamentoTitulo}>{publicacion.titulo}</Text>
          {publicacion.descripcion && (
            <Text style={styles.medicamentoDescripcion}>{publicacion.descripcion}</Text>
          )}
          <Text style={styles.medicamentoVencimiento}>
            Vence: {new Date(publicacion.fechaVencimiento).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Cantidad</Text>
          <View style={styles.cantidadContainer}>
            <TextInput
              style={styles.input}
              value={cantidad}
              onChangeText={handleCantidadChange}
              keyboardType="numeric"
              placeholder="Cantidad a solicitar"
              editable={(stock?.cantidadDisponible ?? 0) > 0}
            />
            {stock && (
              <Text style={styles.stockInfo}>
                Disponible: {stock.cantidadDisponible} unidades
              </Text>
            )}
          </View>
          {mostrarMensajeAjuste && (
            <View style={styles.mensajeAjuste}>
              <Ionicons name="information-circle" size={16} color="#f59e0b" />
              <Text style={styles.mensajeAjusteTexto}>
                Cantidad ajustada al máximo disponible
              </Text>
            </View>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Información de Entrega</Text>
          
          <Text style={styles.fieldLabel}>Dirección *</Text>
          <TextInput
            style={styles.input}
            value={direccion}
            onChangeText={setDireccion}
            placeholder="Dirección completa"
            multiline
          />

          <Text style={styles.fieldLabel}>Localidad</Text>
          <TextInput
            style={styles.input}
            value={localidad}
            onChangeText={setLocalidad}
            placeholder="Ej: Bogotá, Medellín"
          />

          <Text style={styles.fieldLabel}>Barrio</Text>
          <TextInput
            style={styles.input}
            value={barrio}
            onChangeText={setBarrio}
            placeholder="Nombre del barrio"
          />
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color="#00b140" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Proceso de Solicitud</Text>
            <Text style={styles.infoText}>
              1. Tu solicitud será enviada al donante{'\n'}
              2. El donante revisará y responderá{'\n'}
              3. Si es aceptada, coordinarán la entrega{'\n'}
              4. Recibirás una notificación del resultado
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.solicitarButton, isSubmitting && styles.solicitarButtonDisabled]}
          onPress={handleSolicitar}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="send-outline" size={24} color="#fff" />
              <Text style={styles.solicitarButtonText}>Enviar Solicitud</Text>
            </>
          )}
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
  cantidadContainer: {
    marginBottom: 8,
  },
  stockInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  mensajeAjuste: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  mensajeAjusteTexto: {
    fontSize: 12,
    color: '#92400e',
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
  content: {
    padding: 20,
  },
  medicamentoInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  medicamentoTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  medicamentoDescripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  medicamentoVencimiento: {
    fontSize: 12,
    color: '#00b140',
    fontWeight: '500',
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  solicitarButtonDisabled: {
    opacity: 0.6,
  },
  solicitarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
