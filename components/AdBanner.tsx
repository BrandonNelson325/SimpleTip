import { Text, View } from "react-native";

export function AdBanner() {
  return (
    <View
      className="bg-gray-900 items-center justify-center"
      style={{ height: 50 }}
    >
      <Text className="text-gray-600 text-xs">Ad</Text>
    </View>
  );
}
