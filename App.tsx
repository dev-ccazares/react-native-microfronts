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

const SVELTE_URL = 'https://68ssdj04-5173.use2.devtunnels.ms/';
// luego aquí pondrás tu host de repack
const REPACK_URL = 'https://tu-repack-host.com';

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
  const [screen, setScreen] = useState<'home' | 'svelte' | 'repack'>('home');

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

          <TouchableOpacity
            style={styles.button}
            onPress={() => setScreen('svelte')}
          >
            <Text style={styles.buttonText}>Abrir Svelte (WebView)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setScreen('repack')}
          >
            <Text style={styles.buttonText}>Abrir Repack</Text>
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
            source={{ uri: SVELTE_URL }}
            style={{ flex: 1 }}
            javaScriptEnabled
            domStorageEnabled
          />
        </View>
      )}

      {screen === 'repack' && (
        <View style={styles.webContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setScreen('home')}
          >
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>

          {/* 🔥 Por ahora placeholder */}
          <View style={styles.placeholder}>
            <Text style={styles.title}>Repack Microfront</Text>
            <Text>Aquí luego cargas bundle remoto</Text>
          </View>

          {/* 👉 futuro:
          <WebView source={{ uri: REPACK_URL }} />
          o carga dinámica de bundle */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menu: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: 250,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  webContainer: {
    flex: 1,
  },
  backButton: {
    padding: 10,
    backgroundColor: '#eee',
  },
  backText: {
    fontSize: 16,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;