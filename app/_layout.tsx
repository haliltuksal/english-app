import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="chat/[id]"
        options={{
          headerShown: true,
          headerTitle: 'Chat',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="session/today"
        options={{
          headerShown: true,
          headerTitle: 'Daily Session',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
