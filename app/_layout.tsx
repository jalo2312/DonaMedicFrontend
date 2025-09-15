import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import { AuthProvider } from './context/AuthContext';
import { PublicationsProvider } from './context/PublicacionesContext';

export default function RootLayout() {
useEffect(() => {
  if (Platform.OS === 'android') {
    // Optionally set the navigation bar background color for Android
    SystemUI.setBackgroundColorAsync('transparent');
  }
}, []);

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <PublicationsProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} /> 
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" translucent={true} />
        </PublicationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

