// app/login.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validación visual básica (sin backend)
  const validate = () => {
    if (!email || !password) {
      setError('Por favor completa correo y contraseña.');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Formato de correo inválido.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

          <TextInput
            placeholder="Correo electrónico"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
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
            <Pressable
              onPress={() => setShowPass(s => !s)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeText}>{showPass ? 'Ocultar' : 'Mostrar'}</Text>
            </Pressable>
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity onPress={() => setRemember(r => !r)} style={styles.remember}>
              <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
                {remember && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>Recordarme</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => alert('Olvidé contraseña — funcionalidad pendiente')}>
              <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
          </TouchableOpacity>

          <View style={styles.signUpRow}>
            <Text style={styles.signUpText}>¿No tienes cuenta?</Text>
            <TouchableOpacity onPress={() => alert('Registro pendiente')}>
              <Text style={styles.signUpLink} onPress={() => router.push('/register')} > Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  container: { flex: 1, justifyContent: 'center', padding: 20 },

  card: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 6,
  },

  title: { fontSize: 26, fontWeight: '700', color: '#0f172a', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 6, marginBottom: 16, textAlign: 'center' },

  input: {
    borderWidth: 1,
    borderColor: '#e6e9ef',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },

  row: { flexDirection: 'row', alignItems: 'center' },
  eyeButton: { paddingHorizontal: 10, marginLeft: 8 },
  eyeText: { color: PRIMARY, fontWeight: '600' },

  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  remember: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  checkMark: { color: '#fff', fontWeight: '700' },
  rememberText: { color: '#334155' },
  forgot: { color: PRIMARY, fontWeight: '600' },

  error: { color: DANGER, marginBottom: 8, textAlign: 'center' },

  button: { backgroundColor: PRIMARY, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: '700' },

  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  line: { height: 1, backgroundColor: '#e6e9ef', flex: 1 },
  orText: { marginHorizontal: 12, color: '#94a3b8' },

  socialRow: { flexDirection: 'column', gap: 8 },
  socialButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6e9ef',
  },
  google: { backgroundColor: '#fff' },
  apple: { backgroundColor: '#000' },
  socialText: { color: '#111', fontWeight: '600' },

  signUpRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 14 },
  signUpText: { color: '#64748b' },
  signUpLink: { color: PRIMARY, fontWeight: '700' },
});
