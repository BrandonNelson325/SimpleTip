import { Pressable, Text, View } from "react-native";

type InputMode = "keypad" | "camera";

interface InputModeToggleProps {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
}

export function InputModeToggle({ mode, onModeChange }: InputModeToggleProps) {
  return (
    <View className="flex-row mx-4 my-2 rounded-lg overflow-hidden">
      <Pressable
        onPress={() => onModeChange("camera")}
        className={`flex-1 py-2 items-center ${
          mode === "camera" ? "bg-purple-600" : "bg-gray-800"
        }`}
      >
        <Text
          className={`text-sm font-semibold ${
            mode === "camera" ? "text-white" : "text-purple-400"
          }`}
        >
          Camera
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onModeChange("keypad")}
        className={`flex-1 py-2 items-center ${
          mode === "keypad" ? "bg-purple-600" : "bg-gray-800"
        }`}
      >
        <Text
          className={`text-sm font-semibold ${
            mode === "keypad" ? "text-white" : "text-purple-400"
          }`}
        >
          Keypad
        </Text>
      </Pressable>
    </View>
  );
}
