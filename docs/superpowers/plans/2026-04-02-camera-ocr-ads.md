# Camera OCR & Ad Placeholders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add camera-based bill scanning with on-device OCR and AdMob-sized ad placeholders to SimpleTip.

**Architecture:** Toggle in `app/index.tsx` swaps keypad and camera in the same screen area. Camera captures a photo, ML Kit extracts text, a pure utility picks the largest dollar amount. Ad placeholders (banner at bottom, interstitial after 7s) are styled for AdMob dimensions but contain no SDK code yet.

**Tech Stack:** expo-camera, @react-native-ml-kit/text-recognition, React Native, NativeWind

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `utils/extractBillAmount.ts` | Create | Pure function: OCR text in, largest dollar amount out |
| `components/InputModeToggle.tsx` | Create | Keypad/Camera segmented control |
| `components/AdBanner.tsx` | Create | Bottom banner ad placeholder (320x50) |
| `components/InterstitialAdPlaceholder.tsx` | Create | Full-screen modal ad placeholder |
| `components/CameraScanner.tsx` | Create | Camera preview, capture, OCR, amount extraction |
| `app/index.tsx` | Modify | Add toggle, swap keypad/camera, interstitial timer, ad components |
| `components/Keypad.tsx` | No change | — |
| `components/TipPresets.tsx` | No change | — |

---

### Task 1: Install Dependencies

Install `expo-camera` and `@react-native-ml-kit/text-recognition`.

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install expo-camera**

```bash
npx expo install expo-camera
```

- [ ] **Step 2: Install ML Kit text recognition**

```bash
npm install @react-native-ml-kit/text-recognition
```

- [ ] **Step 3: Add camera permission to app.json**

Open `app.json` and add the `expo-camera` plugin with the camera usage description. The `plugins` array should become:

```json
"plugins": [
  "expo-router",
  "expo-asset",
  [
    "expo-camera",
    {
      "cameraPermission": "SimpleTip needs camera access to scan your bill."
    }
  ]
]
```

- [ ] **Step 4: Verify install**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json app.json
git commit -m "feat: add expo-camera and ML Kit text recognition dependencies"
```

---

### Task 2: Create `extractBillAmount` Utility

Pure function that parses OCR text and returns the largest dollar amount found.

**Files:**
- Create: `utils/extractBillAmount.ts`

- [ ] **Step 1: Create `utils/extractBillAmount.ts`**

```typescript
/**
 * Extracts the largest dollar amount from OCR-recognized text.
 * Returns digits and decimal only (e.g. "42.50"), or null if none found.
 */
export function extractBillAmount(ocrText: string): string | null {
  const amounts: number[] = [];

  // Match dollar amounts: $12.34, $1,234.56, etc.
  const dollarPattern = /\$\s?([\d,]+\.?\d{0,2})/g;
  let match: RegExpExecArray | null;
  while ((match = dollarPattern.exec(ocrText)) !== null) {
    const cleaned = match[1].replace(/,/g, "");
    const value = parseFloat(cleaned);
    if (!isNaN(value) && value > 0) {
      amounts.push(value);
    }
  }

  // Match bare numbers near keywords (total, amount due, balance, due, grand total)
  const keywordPattern =
    /(?:total|amount\s*due|balance\s*due|grand\s*total|amount|due)\s*:?\s*\$?\s*([\d,]+\.\d{2})/gi;
  while ((match = keywordPattern.exec(ocrText)) !== null) {
    const cleaned = match[1].replace(/,/g, "");
    const value = parseFloat(cleaned);
    if (!isNaN(value) && value > 0) {
      amounts.push(value);
    }
  }

  if (amounts.length === 0) {
    return null;
  }

  const largest = Math.max(...amounts);
  return largest.toFixed(2);
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
mkdir -p utils
git add utils/extractBillAmount.ts
git commit -m "feat: add extractBillAmount utility for OCR text parsing"
```

---

### Task 3: Create `InputModeToggle` Component

Compact segmented control to switch between Keypad and Camera input.

**Files:**
- Create: `components/InputModeToggle.tsx`

- [ ] **Step 1: Create `components/InputModeToggle.tsx`**

```tsx
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
    </View>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/InputModeToggle.tsx
git commit -m "feat: add InputModeToggle segmented control component"
```

---

### Task 4: Create `AdBanner` Component

Bottom banner ad placeholder sized for AdMob standard banner (320x50).

**Files:**
- Create: `components/AdBanner.tsx`

- [ ] **Step 1: Create `components/AdBanner.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/AdBanner.tsx
git commit -m "feat: add AdBanner placeholder component"
```

---

### Task 5: Create `InterstitialAdPlaceholder` Component

Full-screen modal overlay that simulates an interstitial ad. Auto-dismisses after 5 seconds or on user tap.

**Files:**
- Create: `components/InterstitialAdPlaceholder.tsx`

- [ ] **Step 1: Create `components/InterstitialAdPlaceholder.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/InterstitialAdPlaceholder.tsx
git commit -m "feat: add InterstitialAdPlaceholder modal component"
```

---

### Task 6: Create `CameraScanner` Component

Camera preview with scan button, ML Kit OCR, and amount extraction.

**Files:**
- Create: `components/CameraScanner.tsx`

- [ ] **Step 1: Create `components/CameraScanner.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors. If `@react-native-ml-kit/text-recognition` has no types, you may need to add a declaration. If so, create `types/react-native-ml-kit.d.ts`:

```typescript
declare module "@react-native-ml-kit/text-recognition" {
  interface TextRecognitionResult {
    text: string;
  }
  const TextRecognition: {
    recognize(imageUri: string): Promise<TextRecognitionResult>;
  };
  export default TextRecognition;
}
```

And add `"types/**/*.ts"` to the `include` array in `tsconfig.json` if not already there.

- [ ] **Step 3: Commit**

```bash
git add components/CameraScanner.tsx
# If type declaration was needed:
# git add types/react-native-ml-kit.d.ts tsconfig.json
git commit -m "feat: add CameraScanner component with ML Kit OCR"
```

---

### Task 7: Update `app/index.tsx` — Wire Everything Together

Add input mode toggle, swap keypad/camera, integrate ad components, add interstitial timer.

**Files:**
- Modify: `app/index.tsx`

- [ ] **Step 1: Replace `app/index.tsx` with the updated version**

```tsx
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Verify the app builds and launches**

```bash
npx expo run:ios
```

Expected: App launches with the toggle visible below the header. Keypad mode works as before. Tapping "Camera" switches to the camera view. Scanning a receipt fills in the bill amount. Banner ad placeholder visible at the bottom. Interstitial shows 7 seconds after entering a bill amount.

- [ ] **Step 4: Commit**

```bash
git add app/index.tsx
git commit -m "feat: integrate input mode toggle, camera scanner, and ad placeholders"
```

---

### Task 8: Rebuild iOS and Final Verification

The new native dependencies (`expo-camera`, `@react-native-ml-kit/text-recognition`) require a native rebuild.

**Files:**
- None (build step only)

- [ ] **Step 1: Clean and rebuild iOS**

```bash
rm -rf ios
npx expo run:ios
```

This regenerates the `ios/` directory with the new native modules and builds the app.

Expected: Build succeeds, app launches on simulator.

- [ ] **Step 2: Test keypad mode**

- Enter a bill amount via keypad
- Adjust tip percentage with presets and slider
- Verify tip and total calculations are correct
- Tap Clear, verify reset

Expected: Identical behavior to before this feature.

- [ ] **Step 3: Test camera mode**

- Tap "Camera" toggle
- Grant camera permission when prompted
- Point at a receipt or text with a dollar amount
- Tap "Scan"
- Verify the amount populates in the bill display
- Verify toggle switches back to keypad after scan

Expected: Amount detected and filled in, toggle returns to keypad.

- [ ] **Step 4: Test interstitial ad**

- Enter a bill amount
- Wait 7 seconds
- Verify the interstitial placeholder appears
- Tap "Close" or wait for auto-dismiss
- Enter another amount — verify interstitial does NOT appear again

Expected: Shows once per session, auto-dismisses after 5 seconds.

- [ ] **Step 5: Test banner ad**

- Verify the dark gray "Ad" bar is visible at the bottom of the screen at all times
- Verify it stays visible in both keypad and camera modes

Expected: Always visible, 50px height.

- [ ] **Step 6: Commit any remaining changes**

```bash
git add -A
git commit -m "chore: rebuild iOS with camera and ML Kit native modules"
```

Only commit if there are changes (e.g., updated Podfile.lock or ios/ directory). Skip if clean.
