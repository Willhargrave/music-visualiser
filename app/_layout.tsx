import { Stack } from "expo-router";
import { AuthProvider } from "../auth-context";
import { SafeAreaProvider } from 'react-native-safe-area-context';


export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack />
      </AuthProvider>
    </SafeAreaProvider>

  );
}
