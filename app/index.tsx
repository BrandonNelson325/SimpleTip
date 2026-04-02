import { Pressable, ScrollView, Text, View } from "react-native";
import { Stack } from "expo-router";
import Slider from "@react-native-community/slider";
import { useCallback, useState } from "react";
import { Keypad } from "@/components/Keypad";
import { TipPresets } from "@/components/TipPresets";

export default function TipCalculator() {
  const [billAmount, setBillAmount] = useState("");
  const [tipPercentage, setTipPercentage] = useState(18);

  const bill = parseFloat(billAmount) || 0;
  const tipAmount = bill * (tipPercentage / 100);
  const totalAmount = bill + tipAmount;
  const displayBill = billAmount ? `$${billAmount}` : "$0.00";

  const handleKeyPress = useCallback((key: string) => {
    setBillAmount((prev) => {
      // No multiple decimal points
      if (key === "." && prev.includes(".")) return prev;

      // Max 2 decimal places
      if (prev.includes(".")) {
        const [, decimal] = prev.split(".");
        if (decimal && decimal.length >= 2) return prev;
      }

      // Max 8 characters
      if (prev.length >= 8) return prev;

      // No leading zeros except before decimal
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

  return (
    <>
      <Stack.Screen
        options={{
          title: "Simple Tip",
        }}
      />
      <View className="flex-1 bg-black">
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

        {/* Keypad */}
        <Keypad onKeyPress={handleKeyPress} onBackspace={handleBackspace} />

        {/* Ad Space */}
        <View className="bg-gray-900 h-16" />
      </View>
    </>
  );
}
