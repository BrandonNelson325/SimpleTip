import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#9333ea" },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "bold" },
          contentStyle: { backgroundColor: "#000000" },
        }}
      />
    </SafeAreaProvider>
  );
}
