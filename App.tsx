import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { PaperTheme } from './src/theme';

const navigationTheme = {
  dark: true,
  colors: {
    primary: '#7C3AED',
    background: '#0A0A1A',
    card: '#13132A',
    text: '#F0F0FF',
    border: '#2D2D55',
    notification: '#EC4899',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={PaperTheme}>
        <AuthProvider>
          <NavigationContainer theme={navigationTheme}>
            <StatusBar style="light" backgroundColor="#0A0A1A" />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
