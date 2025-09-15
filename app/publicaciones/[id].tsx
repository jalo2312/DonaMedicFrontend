// app/publicaciones/[id].tsx
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { usePublications } from "../context/PublicacionesContext";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import stockService from "../../services/stockService";

export default function DetallePublicacion() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById, deletePublication } = usePublications();
  const pub = getById(parseInt(id!));
  const [stock, setStock] = useState({ cantidadDisponible: 0, cantidadReservada: 0, cantidadTotal: 0 });
  const [loadingStock, setLoadingStock] = useState(false);
  
  useEffect(() => {
    if (pub) {
      setLoadingStock(true);
      stockService.getStockByPublicacion(pub.id)
        .then(stockData => {
          setStock(stockData);
        })
        .catch(error => {
          console.error("Error al obtener el stock:", error);
        })
        .finally(() => {
          setLoadingStock(false);
        });
    }
  }, [pub]);

  if (!pub) return (
    <View style={styles.container}>
      <Text style={styles.errorText}>Publicación no encontrada.</Text>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Publicación</Text>
        <View style={styles.placeholder} />
      </View>

      {pub.imagen && (
        <Image source={{ uri: pub.imagen }} style={styles.imagen} />
      )}

      <View style={styles.content}>
        <View style={styles.tituloContainer}>
          <Text style={styles.title}>{pub.titulo}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: pub.status === 'disponible' ? '#4ade80' : '#fbbf24' }
          ]}>
            <Text style={styles.statusText}>
              {pub.status === 'disponible' ? 'Disponible' : 'Reservado'}
            </Text>
          </View>
        </View>

        {pub.descripcion && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.sectionContent}>{pub.descripcion}</Text>
          </View>
        )}

        {pub.presentacion && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Presentación</Text>
            <Text style={styles.sectionContent}>{pub.presentacion}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fecha de Vencimiento</Text>
          <Text style={styles.sectionContent}>
            {new Date(pub.fechaVencimiento).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fecha de Publicación</Text>
          <Text style={styles.sectionContent}>
            {new Date(pub.fecha || '').toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stock Disponible</Text>
          <Text style={styles.sectionContent}>
            {loadingStock ? "Cargando..." : `${stock.cantidadDisponible} unidades`}
          </Text>
        </View>
        
        {stock.cantidadReservada > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stock Reservado</Text>
            <Text style={styles.sectionContent}>
              {stock.cantidadReservada} unidades
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.btn} 
          onPress={() => router.push(`/publicaciones/editar/${pub.id}`)}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, styles.deleteBtn]} 
          onPress={() => {
            Alert.alert("Eliminar", "¿Eliminar publicación?", [
              { text: "Cancelar", style: "cancel" },
              { 
                text: "Eliminar", 
                style: "destructive", 
                onPress: async () => { 
                  try {
                    await deletePublication(pub.id); 
                    router.replace("/(tabs)/publicaciones"); 
                  } catch (error: any) {
                    Alert.alert("Error", error.message);
                  }
                } 
              }
            ]);
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.btnText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
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
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
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
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    gap: 12,
  },
  btn: { 
    backgroundColor: "#00b140", 
    padding: 14, 
    borderRadius: 12, 
    alignItems: "center",
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: '#e53e3e',
  },
  btnText: { 
    color: "#fff", 
    fontWeight: "700",
    marginLeft: 8,
  },
  errorText: {
    fontSize: 18,
    color: '#e53e3e',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#00b140',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
