import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const SVELTE_URL = 'https://svelte-microfront.vercel.app/';

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
          <Text style={styles.subtitle}>Host shell · Svelte WebView</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setScreen('svelte')}
          >
            <Text style={styles.buttonText}>Abrir Svelte (WebView)</Text>
            <Text style={styles.buttonHint}>web app embebida</Text>
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
    backgroundColor: '#662D91',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: 280,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  buttonHint: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 4 },
  webContainer: { flex: 1 },
  backButton: { padding: 12, backgroundColor: '#eee' },
  backText: { fontSize: 16 },
  reloadText: {
    padding: 12,
    textAlign: 'center',
    backgroundColor: '#f8f8f8',
    color: '#662D91',
    fontWeight: '600',
  },
});

export default App;
