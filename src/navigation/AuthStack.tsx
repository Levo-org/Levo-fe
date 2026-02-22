import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import SplashScreen from '../screens/auth/SplashScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LanguageSelectScreen from '../screens/auth/LanguageSelectScreen';
import LevelSelectScreen from '../screens/auth/LevelSelectScreen';
import GoalSettingScreen from '../screens/auth/GoalSettingScreen';
import NotificationSetupScreen from '../screens/auth/NotificationSetupScreen';

const Stack: any = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
      <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
      <Stack.Screen name="GoalSetting" component={GoalSettingScreen} />
      <Stack.Screen name="NotificationSetup" component={NotificationSetupScreen} />
    </Stack.Navigator>
  );
}
