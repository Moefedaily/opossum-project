import { Stack } from "expo-router";
import { ThemeProvider } from "@rneui/themed";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AuthProvider } from "../contexts/AuthContext";
import FontLoader from "../components/FontLoader";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <FontLoader>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <Toast />
          </AuthProvider>
        </FontLoader>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
