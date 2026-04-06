import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AdStateProvider } from "@/lib/adState";
import { initializeAds, loadInterstitialAd } from "@/lib/admob";

export default function RootLayout() {
  useEffect(() => {
    const bootstrap = async () => {
      await initializeAds();
      loadInterstitialAd();
    };
    bootstrap();
  }, []);

  return (
    <SafeAreaProvider>
      <AdStateProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#9333ea" },
            headerTintColor: "#ffffff",
            headerTitleStyle: { fontWeight: "bold" },
            contentStyle: { backgroundColor: "#000000" },
          }}
        />
      </AdStateProvider>
    </SafeAreaProvider>
  );
}
