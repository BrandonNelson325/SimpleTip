import { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

interface InterstitialAdPlaceholderProps {
  visible: boolean;
  onDismiss: () => void;
}

export function InterstitialAdPlaceholder({
  visible,
  onDismiss,
}: InterstitialAdPlaceholderProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!visible) {
      setCountdown(5);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, onDismiss]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/80 items-center justify-center">
        <View className="bg-gray-800 rounded-2xl p-8 mx-8 items-center">
          <Text className="text-gray-500 text-lg mb-4">Advertisement</Text>
          <View className="w-64 h-40 bg-gray-700 rounded-lg items-center justify-center mb-4">
            <Text className="text-gray-500 text-2xl">Ad</Text>
          </View>
          <Text className="text-gray-500 text-sm mb-4">
            Closing in {countdown}s
          </Text>
          <Pressable
            onPress={onDismiss}
            className="bg-purple-600 px-6 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
