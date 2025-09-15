// app/(tabs)/publicaciones/editar/[id].tsx
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { usePublications } from "../../context/PublicacionesContext";

// MOCK (temporal) — reemplaza por contexto/endpoint de categorias y ubicaciones cuando los tengas
const mockCategories = [
  { id: "cat1", nombre: "Analgésicos" },
  { id: "cat2", nombre: "Antibióticos" },
  { id: "cat3", nombre: "Vitaminas" },
];
const mockLocations = [
  { id: "loc1", nombre: "Casa" },
  { id: "loc2", nombre: "Fundación Barrio" },
];

export default function EditarPublicacion() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById, updatePublication } = usePublications();

  const pub = getById(parseInt(id!));
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [presentacion, setPresentacion] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pub) {
      setTitulo(pub.titulo ?? "");
      setDescripcion(pub.descripcion ?? "");
      setPresentacion(pub.presentacion ?? "");
      setFechaVencimiento(pub.fechaVencimiento ?? "");
      setImageUri(pub.imagen ?? null);
    }
  }, [pub]);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!res.canceled && res.assets && res.assets.length > 0) setImageUri(res.assets[0].uri);
  };

  const removeImage = () => {
    Alert.alert("Eliminar imagen", "¿Quieres eliminar la imagen actual?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => setImageUri(null) },
    ]);
  };

  const handleGuardar = async () => {
    if (!titulo.trim()) return Alert.alert("Validación", "El título es obligatorio.");
    if (!fechaVencimiento) return Alert.alert("Validación", "La fecha de vencimiento es obligatoria.");
    setSaving(true);
    try {
      await updatePublication(pub!.id, {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        presentacion: presentacion.trim(),
        fechaVencimiento: fechaVencimiento,
        imagen: imageUri ?? undefined,
      });
      router.back();
    } catch (e) {
      console.warn("Error guardando publicación:", e);
      Alert.alert("Error", "No se pudo guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  if (!pub) return <View style={styles.center}><Text>Publicación no encontrada.</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Publicación</Text>

      <TextInput style={styles.input} placeholder="Título" value={titulo} onChangeText={setTitulo} />

      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Descripción"
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

      <Text style={styles.label}>Imagen</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
          <Text>{imageUri ? "Cambiar imagen" : "Agregar imagen"}</Text>
        </TouchableOpacity>
        {imageUri ? (
          <>
            <Image source={{ uri: imageUri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
            <TouchableOpacity onPress={removeImage} style={{ marginLeft: 8 }}>
              <Text style={{ color: "#c53030" }}>Eliminar</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      <TouchableOpacity style={[styles.btn, saving && { opacity: 0.7 }]} onPress={handleGuardar} disabled={saving}>
        <Text style={styles.btnText}>{saving ? "Guardando..." : "Guardar cambios"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 20, backgroundColor: "#f5f5f5", paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  input: { backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#ddd" },
  label: { fontWeight: "600", marginTop: 8, marginBottom: 6 },
  selector: { padding: 10, backgroundColor: "#fff", marginBottom: 8, borderRadius: 8, borderWidth: 1, borderColor: "#eee" },
  selected: { borderColor: "#00b140", backgroundColor: "#eafbe9" },
  imageBtn: { padding: 10, backgroundColor: "#fff", borderRadius: 8 },
  btn: { backgroundColor: "#00b140", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 18 },
  btnText: { color: "#fff", fontWeight: "700" },
});
