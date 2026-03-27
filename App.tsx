import 'react-native-url-polyfill/auto';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';
import { RootNavigator } from './src/navigation';
import { useAuthStore } from './src/stores/authStore';
import { loadGoogleSigninModule } from './src/utils/googleSignin';
import { colors } from './src/theme/colors';

function TopSafeAreaMask() {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="none"
      style={[
        styles.safeTopMask,
        { height: insets.top },
      ]}
    />
  );
}

export default function App() {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    const extra = (Constants.expoConfig as {
      extra?: { googleWebClientId?: string; googleIosClientId?: string };
    } | null)?.extra;
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || extra?.googleWebClientId;
    const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || extra?.googleIosClientId;

    if (webClientId) {
      const googleSigninModule = loadGoogleSigninModule();
      if (googleSigninModule) {
        googleSigninModule.GoogleSignin.configure({ webClientId, iosClientId });
      }
    }

    restoreSession();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="dark" translucent={false} backgroundColor={colors.background.primary} />
        <TopSafeAreaMask />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeTopMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    zIndex: 999,
  },
});
