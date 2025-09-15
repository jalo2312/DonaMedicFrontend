import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a DonaMedic</Text>
      
      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/publicaciones")}
        >
          <Ionicons name="add-circle-outline" size={40} color="#00b140" />
          <Text style={styles.cardText}>Publicar Medicamento</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/publicaciones-disponibles")}
        >
          <Ionicons name="search-outline" size={40} color="#00b140" />
          <Text style={styles.cardText}>Ver Publicaciones</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.loginButtonText}>Ir al Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  card: {
    width: "45%",
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 10,
    borderRadius: 15,
    alignItems: "center",
    elevation: 3, // sombra Android
    shadowColor: "#000", // sombra iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    color: "#333",
  },
  loginButton: {
    marginTop: 30,
    backgroundColor: "#00b140",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
