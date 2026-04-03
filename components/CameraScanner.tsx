import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Linking, Pressable, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import TextRecognition from "@react-native-ml-kit/text-recognition";
import { extractBillAmount } from "@/utils/extractBillAmount";

type ScanState = "idle" | "processing" | "error";

interface CameraScannerProps {
  onAmountDetected: (amount: string) => void;
}

export function CameraScanner({ onAmountDetected }: CameraScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>("idle");
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (scanState === "error") {
      const timeout = setTimeout(() => setScanState("idle"), 3000);
      return () => clearTimeout(timeout);
    }
  }, [scanState]);

  if (!permission) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator color="#9333ea" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center p-4">
        <Text className="text-white text-center text-lg mb-4">
          Camera access needed to scan bills
        </Text>
        {permission.canAskAgain ? (
          <Pressable
            onPress={requestPermission}
            className="bg-purple-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Grant Access</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => Linking.openSettings()}
            className="bg-purple-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Open Settings</Text>
          </Pressable>
        )}
      </View>
    );
  }

  const handleScan = async () => {
    if (!cameraRef.current || scanState === "processing") return;

    setScanState("processing");
    try {
      const photo = await cameraRef.current.takePictureAsync();
      if (!photo) {
        setScanState("error");
        return;
      }

      const result = await TextRecognition.recognize(photo.uri);
      const amount = extractBillAmount(result.text);

      if (amount) {
        setScanState("idle");
        onAmountDetected(amount);
      } else {
        setScanState("error");
      }
    } catch {
      setScanState("error");
    }
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
      >
        <View className="flex-1 justify-end items-center pb-4">
          {scanState === "idle" && (
            <Pressable
              onPress={handleScan}
              className="bg-purple-600 px-8 py-3 rounded-full"
            >
              <Text className="text-white font-bold text-lg">Scan</Text>
            </Pressable>
          )}
          {scanState === "processing" && (
            <View className="bg-gray-800/80 px-6 py-3 rounded-full">
              <ActivityIndicator color="#9333ea" />
            </View>
          )}
          {scanState === "error" && (
            <View className="bg-red-900/80 px-6 py-3 rounded-full">
              <Text className="text-white font-semibold">
                Couldn't find a total - try again
              </Text>
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
}
