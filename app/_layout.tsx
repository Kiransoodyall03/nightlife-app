import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { LogBox } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    LogBox.ignoreLogs(['Warning: ...']); // Ignore specific warnings if needed
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerShadowVisible: false,
        // Remove headerBackTitleVisible as it's not supported
      }}
    />
  );
}