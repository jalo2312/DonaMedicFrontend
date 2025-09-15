// app/publicaciones/crear.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { usePublications } from "../context/PublicacionesContext";
import { useAuth } from "../context/AuthContext";

// mock categories & locations (temporal)
const mockCategories = [
  { id: "cat1", nombre: "Analgésicos" },
  { id: "cat2", nombre: "Antibióticos" },
];
const mockLocations = [
  { id: "loc1", nombre: "Casa" },
  { id: "loc2", nombre: "Fundación Barrio" },
];

export default function CrearPublicacion() {
  const router = useRouter();
  const { addPublication, isLoading } = usePublications();
  const { user } = useAuth();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [presentacion, setPresentacion] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [cantidadDisponible, setCantidadDisponible] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled && res.assets && res.assets.length > 0) setImageUri(res.assets[0].uri);
  };

  const handleGuardar = async () => {
    if (!titulo.trim()) {
      Alert.alert("Error", "El título es obligatorio");
      return;
    }
    
    if (!fechaVencimiento) {
      Alert.alert("Error", "La fecha de vencimiento es obligatoria");
      return;
    }

    if (!user) {
      Alert.alert("Error", "Debes estar autenticado para crear publicaciones");
      return;
    }

    try {
      setIsSubmitting(true);
      await addPublication({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        presentacion: presentacion.trim(),
        fechaVencimiento: fechaVencimiento,
        imagen: imageUri || undefined,
        usuarioId: user.id,
        stock: {
          cantidadDisponible: cantidadDisponible ? parseInt(cantidadDisponible) : 0
        }
      });
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nueva Publicación</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Título del medicamento" 
        value={titulo} 
        onChangeText={setTitulo} 
      />
      
      <TextInput 
        style={[styles.input, { height: 80 }]} 
        placeholder="Descripción del medicamento" 
        value={descripcion} 
        onChangeText={setDescripcion} 
        multiline 
      />

      <TextInput 
        style={styles.input} 
        placeholder="Presentación (ej: Tabletas, Jarabe, etc.)" 
        value={presentacion} 
        onChangeText={setPresentacion} 
      />

      <Text style={styles.label}>Fecha de Vencimiento</Text>
      <TextInput 
        style={styles.input} 
        placeholder="YYYY-MM-DD" 
        value={fechaVencimiento} 
        onChangeText={setFechaVencimiento} 
      />

      <Text style={styles.label}>Cantidad Disponible</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Ingrese la cantidad disponible" 
        value={cantidadDisponible} 
        onChangeText={setCantidadDisponible}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
        <Text>{imageUri ? "Cambiar imagen" : "Agregar foto del medicamento"}</Text>
      </TouchableOpacity>
      {imageUri ? <Image source={{ uri: imageUri }} style={{ width: 120, height: 120, marginTop: 8, borderRadius: 8 }} /> : null}

      <TouchableOpacity 
        style={[styles.btn, (isSubmitting || isLoading) && styles.btnDisabled]} 
        onPress={handleGuardar}
        disabled={isSubmitting || isLoading}
      >
        <Text style={styles.btnText}>
          {isSubmitting || isLoading ? "Guardando..." : "Guardar publicación"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  input: { backgroundColor: "#fff", borderRadius: 8, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: "#ddd" },
  label: { fontWeight: "600", marginTop: 8, marginBottom: 6 },
  selector: { padding: 10, backgroundColor: "#fff", marginBottom: 8, borderRadius: 8, borderWidth: 1, borderColor: "#eee" },
  selected: { borderColor: "#00b140", backgroundColor: "#eafbe9" },
  imageBtn: { padding: 12, backgroundColor: "#fff", borderRadius: 8, alignItems: "center" },
  btn: { backgroundColor: "#00b140", padding: 14, borderRadius: 12, alignItems: "center", marginTop: 18 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "700" },
});
