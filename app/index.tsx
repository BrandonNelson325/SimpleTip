import { Pressable, ScrollView, Text, View } from "react-native";
import { Stack } from "expo-router";
import Slider from "@react-native-community/slider";
import { useCallback, useEffect, useRef, useState } from "react";
import { Keypad } from "@/components/Keypad";
import { TipPresets } from "@/components/TipPresets";
import { InputModeToggle } from "@/components/InputModeToggle";
import { CameraScanner } from "@/components/CameraScanner";
import { AdBanner } from "@/components/AdBanner";
import { InterstitialAdPlaceholder } from "@/components/InterstitialAdPlaceholder";

export default function TipCalculator() {
  const [billAmount, setBillAmount] = useState("");
  const [tipPercentage, setTipPercentage] = useState(18);
  const [inputMode, setInputMode] = useState<"keypad" | "camera">("keypad");
  const [showInterstitial, setShowInterstitial] = useState(false);
  const interstitialShownRef = useRef(false);

  const bill = parseFloat(billAmount) || 0;
  const tipAmount = bill * (tipPercentage / 100);
  const totalAmount = bill + tipAmount;
  const displayBill = billAmount ? `$${billAmount}` : "$0.00";

  // Interstitial timer: 7s after first non-zero bill, once per session
  useEffect(() => {
    if (bill > 0 && !interstitialShownRef.current) {
      const timeout = setTimeout(() => {
        setShowInterstitial(true);
        interstitialShownRef.current = true;
      }, 7000);
      return () => clearTimeout(timeout);
    }
  }, [bill]);

  const handleKeyPress = useCallback((key: string) => {
    setBillAmount((prev) => {
      if (key === "." && prev.includes(".")) return prev;
      if (prev.includes(".")) {
        const [, decimal] = prev.split(".");
        if (decimal && decimal.length >= 2) return prev;
      }
      if (prev.length >= 8) return prev;
      if (prev === "0" && key !== ".") return key;
      return prev + key;
    });
  }, []);

  const handleBackspace = useCallback(() => {
    setBillAmount((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setBillAmount("");
    setTipPercentage(18);
  }, []);

  const handleSliderChange = useCallback((value: number) => {
    setTipPercentage(Math.round(value));
  }, []);

  const handleAmountDetected = useCallback((amount: string) => {
    setBillAmount(amount);
    setInputMode("keypad");
  }, []);

  const handleDismissInterstitial = useCallback(() => {
    setShowInterstitial(false);
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Simple Tip",
        }}
      />
      <View className="flex-1 bg-black">
        {/* Input Mode Toggle */}
        <InputModeToggle mode={inputMode} onModeChange={setInputMode} />

        <ScrollView className="flex-1 p-4">
          {/* Header with Clear button */}
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-lg font-semibold text-white">
              Bill Amount
            </Text>
            <Pressable onPress={handleClear}>
              <Text className="text-purple-400 text-base">Clear</Text>
            </Pressable>
          </View>

          {/* Bill Amount Display */}
          <View className="p-3 bg-gray-800 border-2 border-gray-600 rounded-lg mb-2">
            <Text className="text-3xl text-center font-bold text-white">
              {displayBill}
            </Text>
          </View>

          {/* Tip Presets */}
          <TipPresets selected={tipPercentage} onSelect={setTipPercentage} />

          {/* Slider */}
          <Slider
            style={{ height: 40 }}
            minimumValue={0}
            maximumValue={30}
            step={1}
            value={tipPercentage}
            onValueChange={handleSliderChange}
            minimumTrackTintColor="#9333ea"
            maximumTrackTintColor="#374151"
            thumbTintColor="#9333ea"
          />
          <Text className="text-center text-purple-400 text-4xl font-bold mb-1">
            {tipPercentage}%
          </Text>

          {/* Results Card */}
          <View className="flex-row mt-2 bg-gray-800 p-3 rounded-lg">
            <View className="flex-1 items-center">
              <Text className="text-sm text-gray-400">Tip Amount</Text>
              <Text className="text-2xl font-bold text-purple-400">
                ${tipAmount.toFixed(2)}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-sm text-gray-400">Total</Text>
              <Text className="text-2xl font-bold text-purple-400">
                ${totalAmount.toFixed(2)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Keypad or Camera */}
        {inputMode === "keypad" ? (
          <Keypad onKeyPress={handleKeyPress} onBackspace={handleBackspace} />
        ) : (
          <CameraScanner onAmountDetected={handleAmountDetected} />
        )}

        {/* Banner Ad */}
        <AdBanner />
      </View>

      {/* Interstitial Ad */}
      <InterstitialAdPlaceholder
        visible={showInterstitial}
        onDismiss={handleDismissInterstitial}
      />
    </>
  );
}
