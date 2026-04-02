import { Pressable, Text, View } from "react-native";

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "⌫"],
] as const;

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
}

export function Keypad({ onKeyPress, onBackspace }: KeypadProps) {
  return (
    <View className="bg-black p-2">
      {KEYS.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row">
          {row.map((key) => (
            <Pressable
              key={key}
              onPress={() => {
                if (key === "⌫") {
                  onBackspace();
                } else {
                  onKeyPress(key);
                }
              }}
              className="flex-1 m-1 py-4 bg-gray-800 border border-gray-700 rounded-xl items-center active:bg-gray-700"
            >
              <Text className="text-2xl text-white">{key}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}
