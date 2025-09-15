// app/(tabs)/publicaciones.tsx
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { usePublications } from "../context/PublicacionesContext";
import { useAuth } from "../context/AuthContext";

export default function PublicacionesScreen() {
  const router = useRouter();
  const { publicaciones, deletePublication, isLoading } = usePublications();
  const { user, isAuthenticated } = useAuth();

  const handleDelete = (id: number) => {
    Alert.alert("Eliminar", "¿Eliminar publicación?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePublication(id);
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Mis Publicaciones</Text>
        <View style={styles.loginPrompt}>
          <Ionicons name="person-outline" size={64} color="#ccc" />
          <Text style={styles.loginText}>Inicia sesión para ver tus publicaciones</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Mis Publicaciones</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00b140" />
          <Text style={styles.loadingText}>Cargando publicaciones...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Publicaciones</Text>

      <FlatList
        data={publicaciones}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/publicaciones/${item.id}`)}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.titulo}</Text>
              <Text style={styles.cardDesc}>{item.descripcion || 'Sin descripción'}</Text>
              <Text style={styles.cardDate}>
                Vence: {new Date(item.fechaVencimiento).toLocaleDateString()}
              </Text>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: item.status === 'disponible' ? '#4ade80' : '#fbbf24' }
                ]}>
                  <Text style={styles.statusText}>
                    {item.status === 'disponible' ? 'Disponible' : 'Reservado'}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.smallDelete}>
              <Ionicons name="trash-outline" size={20} color="#c53030" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>No tienes publicaciones todavía.</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push("/publicaciones/crear")}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loginText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  loginButton: {
    backgroundColor: '#00b140',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  cardDesc: { fontSize: 14, color: "#666", marginBottom: 4 },
  cardDate: { fontSize: 12, color: "#999", marginBottom: 8 },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  fab: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#00b140",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  smallDelete: { padding: 6 },
});
