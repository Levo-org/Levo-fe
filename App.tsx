import 'react-native-url-polyfill/auto';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { StyleSheet } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { RootNavigator } from './src/navigation';
import { useAuthStore } from './src/stores/authStore';

export default function App() {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    const extra = (Constants.expoConfig as { extra?: { googleWebClientId?: string } } | null)?.extra;
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || extra?.googleWebClientId;

    if (webClientId) {
      GoogleSignin.configure({ webClientId });
    }

    restoreSession();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
