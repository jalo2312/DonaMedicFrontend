// app/register.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [terms, setTerms] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const validate = () => {
    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError('Completa todos los campos requeridos.');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Formato de correo inválido.');
      return false;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return false;
    }
    if (!terms) {
      setError('Debes aceptar los términos y condiciones.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    
    try {
      setSuccessMsg(null);
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: parseInt(phone) || 0,
        password
      });
      setSuccessMsg('Registro exitoso. Bienvenido/a 👋');
      setTimeout(() => router.replace('/(tabs)'), 800);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>Regístrate para empezar a usar la app</Text>

            <TextInput
              placeholder="Nombre completo"
              style={styles.input}
              value={name}
              onChangeText={setName}
              editable={!isLoading}
            />

            <TextInput
              placeholder="Teléfono (opcional)"
              style={styles.input}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              editable={!isLoading}
            />

            <TextInput
              placeholder="Correo electrónico"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
            />

            <View style={styles.row}>
              <TextInput
                placeholder="Contraseña"
                secureTextEntry={!showPass}
                style={[styles.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
              <Pressable onPress={() => setShowPass(s => !s)} style={styles.eyeButton}>
                <Text style={styles.eyeText}>{showPass ? 'Ocultar' : 'Mostrar'}</Text>
              </Pressable>
            </View>

            <TextInput
              placeholder="Confirmar contraseña"
              secureTextEntry={!showPass}
              style={styles.input}
              value={confirm}
              onChangeText={setConfirm}
              editable={!isLoading}
            />

            <View style={styles.termsRow}>
              <TouchableOpacity onPress={() => setTerms(t => !t)} style={styles.remember}>
                <View style={[styles.checkbox, terms && styles.checkboxChecked]}>
                  {terms && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={styles.rememberText}>Acepto términos y condiciones</Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {successMsg ? <Text style={styles.success}>{successMsg}</Text> : null}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registrarme</Text>}
            </TouchableOpacity>

            <View style={styles.signInRow}>
              <Text style={styles.signInText}>¿Ya tienes cuenta?</Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.signInLink}> Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const PRIMARY = '#2f6bf6';
const BG = '#f7f8fb';
const CARD = '#fff';
const DANGER = '#e03131';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  card: { backgroundColor: CARD, borderRadius: 14, padding: 22, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 6 },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 6, marginBottom: 12, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#e6e9ef', padding: 12, borderRadius: 10, marginBottom: 12, backgroundColor: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center' },
  eyeButton: { paddingHorizontal: 10, marginLeft: 8 },
  eyeText: { color: PRIMARY, fontWeight: '600' },
  termsRow: { marginBottom: 8 },
  remember: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, borderColor: '#cbd5e1', marginRight: 8, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  checkMark: { color: '#fff', fontWeight: '700' },
  rememberText: { color: '#334155' },
  error: { color: DANGER, marginBottom: 8, textAlign: 'center' },
  success: { color: '#0f9d58', marginBottom: 8, textAlign: 'center' },
  button: { backgroundColor: PRIMARY, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: '700' },
  signInRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 14 },
  signInText: { color: '#64748b' },
  signInLink: { color: PRIMARY, fontWeight: '700' },
});
