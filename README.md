# react-native-microfronts (HOST)

Shell React Native con **2 estrategias** de microfrontends mobile:

1. **Svelte microfront** → app web cargada en `WebView` (embebido)
2. **Repack microfront** → APK RN independiente, abierto vía deep link

Forma parte del POC de microfrontends junto con:
- [`svelte-microfront`](https://github.com/dev-ccazares/svelte-microfront) — microfront Svelte
- [`repack-microfront`](https://github.com/dev-ccazares/repack-microfront) — microfront RN con Repack

## Arquitectura

```
┌─ react-native-microfronts (HOST) ───────────────┐
│                                                 │
│   [ Abrir Svelte ]  ── WebView(URL) ──→  svelte-microfront
│                                            (app web servida en :4173)
│                                                 │
│   [ Abrir Repack ]  ── Linking deep link ──→  com.repackmicrofront
│                                            (otra app RN instalada en el device)
│                                                 │
└─────────────────────────────────────────────────┘
```

## Stack

- **React Native 0.80.3** + **React 19.1**
- **Metro** (bundler default)
- `react-native-webview` para embeber el Svelte
- `Linking` para abrir el Repack como app separada

## Cómo levantarlo (paso a paso)

### Pre-requisitos
- Node 18+
- Android Studio + emulador (o device físico)
- `adb` en PATH
- **Java 17**

### Paso 0: clonar los 3 repos (una sola vez)

```bash
cd ~/Documents/Project/Repos          # o donde prefieras
git clone https://github.com/dev-ccazares/react-native-microfronts.git
git clone https://github.com/dev-ccazares/svelte-microfront.git
git clone https://github.com/dev-ccazares/repack-microfront.git
```

### Paso 1 — Levantar el Svelte microfront (Terminal 1)

```bash
cd svelte-microfront
npm install
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

Deja la terminal corriendo. Verás `Local: http://localhost:4173/`.

### Paso 2 — Compilar e instalar el repack-microfront en el device (Terminal 2)

Sólo una vez (o cuando cambies código del microfront):

```bash
cd repack-microfront
npm install --legacy-peer-deps    # necesita .npmrc privado de Deuna
cd android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Esto deja el APK `com.repackmicrofront` instalado en el emulador, listo para ser abierto por el deep link.

> Más detalles en [`repack-microfront/README.md`](https://github.com/dev-ccazares/repack-microfront/blob/main/README.md).

### Paso 3 — Arrancar el host (Terminal 3)

```bash
cd react-native-microfronts
npm install --legacy-peer-deps
npm start                          # Metro en :8081
```

Deja Metro corriendo.

### Paso 4 — Instalar el APK del host (Terminal 4)

```bash
cd react-native-microfronts
npm run android                    # build + install + launch
```

Si todo va bien, se abre la app **"Microfronts POC"** automáticamente.

### Si el emulador no detecta Metro (pantalla roja)

```bash
adb reverse tcp:8081 tcp:8081      # host Metro
adb reverse tcp:4173 tcp:4173      # Svelte preview
```

Reload la app (`Cmd+M` → Reload).

## Uso

1. Tap **"Abrir Svelte (WebView)"** → carga el WebView con el flujo de pagos en Svelte.
2. Tap **"Abrir Repack"** → muestra un Alert con instrucciones y un botón "Abrir".

### Workflow del botón Repack

Como host y repack-microfront son ambas apps RN debug, **ambas pelean por el puerto 8081**. Para que el repack-microfront cargue su JS:

1. Tap "Abrir Repack" en el host → aparece el Alert
2. **Mata el Metro del host** (`Ctrl+C` en Terminal 3)
3. **Arranca el Metro del repack-microfront** en su lugar:
   ```bash
   cd repack-microfront
   npm start                       # también en :8081
   ```
4. Tap "Abrir" en el Alert → se lanza la app del microfront, conecta a SU Metro, y carga su bundle correctamente
5. Cuando termines de probarlo, matá el Metro del repack-microfront y volvé a arrancar el del host si querés ver el botón Svelte

> **Sí, es engorroso** — refleja que cada microfront RN debug es una app separada con sus propias deps de dev. En producción cada APK tendría su JS embebido y este conflicto no existe.

## Repos relacionados

| Repo | Tech | Cómo lo carga el host |
|------|------|----------------------|
| **`react-native-microfronts`** (este) | RN 0.80.3 + Metro | — |
| `svelte-microfront` | Svelte 5 + Vite | `<WebView source={{ uri }} />` |
| `repack-microfront` | RN 0.80.3 + Repack + libs Deuna | `Linking.openURL('repackmicrofront://launch')` |

## ¿Por qué deep link en vez de cargar el Repack en un WebView?

Un bundle de Repack es código React Native, no HTML. **No puede ejecutarse adentro de un WebView**. Las 2 opciones reales en mobile son:

- **Deep link** (este enfoque) — cada microfront es su propio APK. Patrón "super-app" (WeChat, Rappi).
- **Module Federation 2** — el host descarga el bundle remoto del microfront y lo monta en su runtime. Más cercano al concepto web de microfrontend pero requiere configurar Repack en el host también y manejar singletons de React/RN. Lo intentamos en `repack-microfront` y vimos issues con Hermes — viable a futuro pero no en este PoC.

## Cambios respecto al scaffolding original RN

- Versión RN bajada de **0.85.2 → 0.80.3** para alinearse con `repack-microfront` y poder compartir las libs Deuna en su ecosistema 0.80
- `AndroidManifest.xml` (main): removido `${usesCleartextTraffic}` placeholder + agregado `<queries>` para Android 11+ (declarar qué schemes externos abre)
- `AndroidManifest.xml` (debug): agregado con `usesCleartextTraffic="true"` (necesario para conectar a Metro en HTTP)
- `MainApplication.kt`: refactor a la API de RN 0.80 (con `ReactNativeHost`)
- `gradle-wrapper.properties`: Gradle 9.3.1 → 8.14.1
- `android/build.gradle`: buildToolsVersion 36 → 35
- `App.tsx`: botón Repack usa `Linking.openURL` con Alert de aviso

## Troubleshooting

| Error | Causa | Fix |
|---|---|---|
| Pantalla roja "Unable to load script" | Metro no corriendo, o el device no llega a él | `adb reverse tcp:8081 tcp:8081`, verificar `npm start` arriba, reload |
| `CLEARTEXT communication not permitted` | Falta debug manifest | Verificar `android/app/src/debug/AndroidManifest.xml` |
| Alert "No está instalado" al tocar Abrir Repack | El APK del repack-microfront no está instalado | Ver Paso 2 |
| WebView del Svelte en blanco | `SVELTE_URL` apunta al host equivocado | Confirmar que vite preview corre y que la URL es `10.0.2.2:4173` (emulador) o IP de la Mac (device físico) |
