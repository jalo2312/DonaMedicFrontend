# DonaMedic – Frontend

App móvil del proyecto **DonaMedic**, una plataforma para donar y solicitar medicamentos entre usuarios. Construida con **React Native + Expo** (Expo Router), en TypeScript.

Este frontend consume la API del repositorio [DonaMedicBackend](https://github.com/jalo2312/DonaMedicBackend).

## Tecnologías

- React Native 0.81 + React 19
- Expo SDK 54 + Expo Router (navegación basada en archivos)
- `axios` para consumo de la API, con interceptores para token JWT
- `@react-native-async-storage/async-storage` para persistencia local (token y sesión)
- `@react-navigation` (bottom tabs)
- `expo-image-picker` (carga de imágenes en publicaciones)

## Estructura del proyecto

```
app/
├── (tabs)/                        # Navegación principal por pestañas
│   ├── index.tsx                    # Inicio
│   ├── publicaciones.tsx            # Mis publicaciones
│   └── perfil.tsx                   # Perfil del usuario
├── context/
│   ├── AuthContext.tsx              # Estado global de sesión/autenticación
│   └── PublicacionesContext.tsx     # Estado global de publicaciones
├── login.tsx / register.tsx         # Autenticación
├── publicaciones/
│   ├── crear.tsx                    # Crear publicación de medicamento
│   ├── [id].tsx                     # Detalle de publicación
│   └── editar/[id].tsx              # Editar publicación
├── publicaciones-disponibles.tsx    # Listado de publicaciones disponibles para solicitar
├── publicaciones-disponibles/[id].tsx
└── solicitar-medicamento/[id].tsx   # Flujo de solicitud de un medicamento

components/          # Componentes reutilizables de UI (temas, tabs, etc.)
config/api.ts        # URL base y configuración de la API
services/             # Llamadas a la API: auth, publicaciones, solicitudes, stock
android/              # Proyecto nativo Android generado por Expo
```

## Funcionalidad

- Registro e inicio de sesión de usuarios (JWT persistido en `AsyncStorage`).
- Publicar medicamentos disponibles para donar.
- Ver publicaciones propias y publicaciones disponibles de otros usuarios.
- Solicitar un medicamento publicado.
- Notificaciones de solicitudes (`NotificacionesSolicitudes`).

## Requisitos

- Node.js
- Expo CLI (se ejecuta vía `npx`, no requiere instalación global)
- App **Expo Go** en el celular, o un emulador Android/iOS, para probar la app

## Instalación

```bash
npm install
```

## Configuración

La URL base de la API se define en `config/api.ts`:

```ts
export const API_CONFIG = {
  BASE_URL: 'http://192.168.0.3:4200/api',
  TIMEOUT: 10000,
  ...
};
```

> Cambia `BASE_URL` por la IP local de tu máquina (donde corre el backend) y el puerto configurado en el backend (`PORT` en su `.env`). Si pruebas desde un celular físico, debe ser una IP accesible en tu red local, no `localhost`.

## Ejecución

```bash
npx expo start
```

Desde la terminal de Expo puedes abrir la app en:
- **Expo Go** (escaneando el QR) — forma más rápida de probar en un celular físico.
- Emulador Android: `npm run android`
- Simulador iOS: `npm run ios`
- Navegador: `npm run web`

## Notas

- El proyecto fue generado a partir de la plantilla base de Expo Router (quedan algunos componentes de ejemplo como `HelloWave`, `ParallaxScrollView`, etc., que pueden limpiarse con `npm run reset-project`).
- Requiere que el backend (`DonaMedicBackend`) esté corriendo y accesible desde la red donde se prueba la app.
