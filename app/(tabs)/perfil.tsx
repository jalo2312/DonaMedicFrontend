// app/(tabs)/perfil.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import NotificacionesSolicitudes from '../../components/NotificacionesSolicitudes';

export default function PerfilScreen() {
  const { user, logout, updateUser, isLoading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showNotificaciones, setShowNotificaciones] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone?.toString() || '',
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone?.toString() || '',
    });
  };

  const handleSave = async () => {
    try {
      await updateUser({
        name: editData.name,
        email: editData.email,
        phone: parseInt(editData.phone) || 0,
      });
      setIsEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone?.toString() || '',
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Editar Perfil',
      onPress: handleEdit,
    },
    {
      icon: 'notifications-outline',
      title: 'Notificaciones',
      onPress: () => setShowNotificaciones(true),
    },
    {
      icon: 'settings-outline',
      title: 'Configuración',
      onPress: () => Alert.alert('Próximamente', 'Esta funcionalidad estará disponible pronto'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Ayuda',
      onPress: () => Alert.alert('Próximamente', 'Esta funcionalidad estará disponible pronto'),
    },
    {
      icon: 'information-circle-outline',
      title: 'Acerca de',
      onPress: () => Alert.alert('DonaMedic', 'Versión 1.0.0\n\nUna app para donar medicamentos y ayudar a la comunidad.'),
    },
  ];

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00b140" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Nombre</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editData.name}
              onChangeText={(text) => setEditData({ ...editData, name: text })}
            />
          ) : (
            <Text style={styles.infoValue}>{user.name}</Text>
          )}
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editData.email}
              onChangeText={(text) => setEditData({ ...editData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : (
            <Text style={styles.infoValue}>{user.email}</Text>
          )}
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Teléfono</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editData.phone}
              onChangeText={(text) => setEditData({ ...editData, phone: text })}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.infoValue}>{user.phone || 'No especificado'}</Text>
          )}
        </View>

        {isEditing && (
          <View style={styles.editButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Menú</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon as any} size={24} color="#666" />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#fff" />
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
      
      {/* Modal para mostrar las notificaciones */}
      <Modal
        visible={showNotificaciones}
        animationType="slide"
        onRequestClose={() => setShowNotificaciones(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notificaciones</Text>
            <TouchableOpacity onPress={() => setShowNotificaciones(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <NotificacionesSolicitudes />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#00b140',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
  header: {
    backgroundColor: '#00b140',
    padding: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#00b140',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  logoutButton: {
    backgroundColor: '#e53e3e',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
