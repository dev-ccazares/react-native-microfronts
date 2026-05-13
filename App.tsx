import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  TouchableOpacity,
  Text,
  Alert,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

/**
 * Microfrontends host:
 *
 *  - Botón Svelte → carga la URL del MFE Svelte en un WebView (Svelte compila a web).
 *  - Botón Repack → abre el APK `com.repackmicrofront` via deep link.
 *    Es una app RN aparte. Tiene que estar instalada en el dispositivo.
 *    Patrón "super-app" donde cada microfront es su propio APK.
 */

// 🟢 Cambia esta URL a donde sirvas el build de svelte-microfront
//    (vite preview, devtunnel, Vercel, etc.)
const SVELTE_URL = 'http://10.0.2.2:4173/';

// 🟣 Package del repack-microfront (info para el usuario al tocar el botón)
const REPACK_PACKAGE = 'com.repackmicrofront';
const REPACK_DEEPLINK = 'repackmicrofront://launch';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [screen, setScreen] = useState<'home' | 'svelte'>('home');
  const [reloadKey, setReloadKey] = useState(0);

  async function openRepackMicrofront() {
    // El repack-microfront es una app RN independiente. Como cada app RN debug
    // necesita su propio Metro en el puerto 8081, NO pueden correr el host y
    // el microfront al mismo tiempo. Hay que matar el Metro del host primero
    // y arrancar el del repack-microfront en su lugar.
    Alert.alert(
      'Antes de abrir el microfront Repack',
      'El microfront Repack es una app RN aparte y necesita su propio Metro en :8081.\n\n' +
        'Si está corriendo el Metro del host, MÁTALO PRIMERO (Ctrl+C) y arranca el de repack-microfront:\n\n' +
        '  cd Repos/repack-microfront\n' +
        '  npm install --legacy-peer-deps\n' +
        '  npm start\n' +
        '  (en otra terminal)\n' +
        '  npm run android\n\n' +
        `Package: ${REPACK_PACKAGE}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abrir',
          onPress: async () => {
            try {
              const canOpen = await Linking.canOpenURL(REPACK_DEEPLINK);
              if (!canOpen) {
                Alert.alert(
                  'No está instalado',
                  `No encontré la app ${REPACK_PACKAGE}. Instálala con:\n\n` +
                    '  cd Repos/repack-microfront\n' +
                    '  npm run android',
                );
                return;
              }
              await Linking.openURL(REPACK_DEEPLINK);
            } catch (err) {
              Alert.alert('Error abriendo el microfront', String(err));
            }
          },
        },
      ],
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: safeAreaInsets.top,
          paddingBottom: safeAreaInsets.bottom,
        },
      ]}
    >
      {screen === 'home' && (
        <View style={styles.menu}>
          <Text style={styles.title}>Microfrontends POC</Text>
          <Text style={styles.subtitle}>Host shell · 2 estrategias</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setScreen('svelte')}
          >
            <Text style={styles.buttonText}>Abrir Svelte (WebView)</Text>
            <Text style={styles.buttonHint}>web app embebida</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonRepack]}
            onPress={openRepackMicrofront}
          >
            <Text style={styles.buttonText}>Abrir Repack</Text>
            <Text style={styles.buttonHint}>RN app aparte (deep link)</Text>
          </TouchableOpacity>
        </View>
      )}

      {screen === 'svelte' && (
        <View style={styles.webContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setScreen('home')}
          >
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>

          <WebView
            key={reloadKey}
            source={{ uri: `${SVELTE_URL}?reload=${reloadKey}` }}
            javaScriptEnabled
            domStorageEnabled
            cacheEnabled
            cacheMode="LOAD_CACHE_ELSE_NETWORK"
            startInLoadingState
          />

          <TouchableOpacity onPress={() => setReloadKey(prev => prev + 1)}>
            <Text style={styles.reloadText}>🔄 Recargar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  menu: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#202020' },
  subtitle: { fontSize: 14, color: '#6F7D9D', marginBottom: 16 },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: 280,
    alignItems: 'center',
  },
  buttonRepack: { backgroundColor: '#4C1D80' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  buttonHint: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 4 },
  webContainer: { flex: 1 },
  backButton: { padding: 12, backgroundColor: '#eee' },
  backText: { fontSize: 16 },
  reloadText: {
    padding: 12,
    textAlign: 'center',
    backgroundColor: '#f8f8f8',
    color: '#4C1D80',
    fontWeight: '600',
  },
});

export default App;
