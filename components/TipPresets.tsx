import { Pressable, Text, View } from "react-native";

const PRESETS = [16, 18, 20] as const;

interface TipPresetsProps {
  selected: number;
  onSelect: (percent: number) => void;
}

export function TipPresets({ selected, onSelect }: TipPresetsProps) {
  return (
    <View className="flex-row mb-2 mt-2">
      {PRESETS.map((percent) => {
        const isActive = selected === percent;
        return (
          <Pressable
            key={percent}
            onPress={() => onSelect(percent)}
            className={`flex-1 mx-1 py-4 rounded-xl items-center ${
              isActive
                ? "bg-purple-600"
                : "bg-gray-800 border-2 border-purple-600"
            }`}
          >
            <Text
              className={`text-xl font-bold ${
                isActive ? "text-white" : "text-purple-400"
              }`}
            >
              {percent}%
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
