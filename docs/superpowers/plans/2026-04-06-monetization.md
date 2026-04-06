# CamTip Monetization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add AdMob ads (banner + interstitial) and a $0.99 non-consumable IAP to remove ads permanently.

**Architecture:** Three new modules in `lib/` — `admob.ts` (ad SDK), `store.ts` (IAP logic), `adState.tsx` (React context). The ad state context wraps the app and gates all ad rendering. The pattern mirrors the working locknrollv2 implementation.

**Tech Stack:** `react-native-google-mobile-ads`, `react-native-iap`, `@react-native-async-storage/async-storage`, Expo SDK 53, React Native 0.79

---

## File Structure

| File | Responsibility |
|------|---------------|
| `lib/admob.ts` (create) | AdMob SDK init, interstitial load/show, banner ad unit ID export |
| `lib/store.ts` (create) | IAP connection, purchase, restore, transaction handling |
| `lib/adState.tsx` (create) | React context/provider: `isAdFree`, purchase/restore actions, AsyncStorage persistence |
| `app.json` (modify) | Add `react-native-google-mobile-ads` plugin + iOS config |
| `app/_layout.tsx` (modify) | Wrap app in `AdStateProvider`, init ads on mount |
| `app/index.tsx` (modify) | Conditional ads, remove placeholder logic, add Remove Ads / Restore buttons |
| `components/AdBanner.tsx` (modify) | Real `BannerAd` component, gated by `isAdFree` |
| `components/InterstitialAdPlaceholder.tsx` (delete) | Replaced by real interstitial in `lib/admob.ts` |

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`
- Modify: `app.json`

- [ ] **Step 1: Install packages**

```bash
npx expo install react-native-google-mobile-ads react-native-iap @react-native-async-storage/async-storage
```

- [ ] **Step 2: Add AdMob plugin config to app.json**

In `app.json`, add the `react-native-google-mobile-ads` plugin to the `plugins` array and add `ios.config.googleMobileAdsAppId`. The iOS app ID needs to be created in your AdMob console for CamTip — use a placeholder until then.

Add to `plugins` array after the existing entries:

```json
[
  "react-native-google-mobile-ads",
  {
    "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
    "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
  }
]
```

Add to `ios` object:

```json
"config": {
  "googleMobileAdsAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
}
```

**Note:** The engineer must ask the user for their actual AdMob app ID and ad unit IDs before proceeding. Use `TestIds` in dev, but production IDs are needed in `app.json` and `lib/admob.ts`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json app.json
git commit -m "chore: install admob, iap, and async-storage dependencies"
```

---

### Task 2: Create `lib/admob.ts`

**Files:**
- Create: `lib/admob.ts`

- [ ] **Step 1: Create the AdMob module**

Create `lib/admob.ts` mirroring the locknrollv2 pattern (banner + interstitial only, no app-open):

```typescript
import { Platform } from "react-native";
import MobileAds, {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

const AD_UNIT_IDS = {
  ios: {
    banner: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
    interstitial: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
  },
  android: {
    banner: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
    interstitial: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
  },
};

const getAdUnitId = (type: "banner" | "interstitial") => {
  if (__DEV__) {
    return type === "banner" ? TestIds.BANNER : TestIds.INTERSTITIAL;
  }
  const ids = Platform.OS === "ios" ? AD_UNIT_IDS.ios : AD_UNIT_IDS.android;
  return ids[type];
};

// ── Initialization ──────────────────────────────────────────────────

let initialized = false;

export const initializeAds = async () => {
  if (initialized) return;
  try {
    await MobileAds().initialize();
    initialized = true;
  } catch (error) {
    console.log("Ad init error:", error);
  }
};

// ── Interstitial ────────────────────────────────────────────────────

let interstitial: InterstitialAd | null = null;
let interstitialLoaded = false;

export const loadInterstitialAd = () => {
  interstitialLoaded = false;
  interstitial = InterstitialAd.createForAdRequest(
    getAdUnitId("interstitial")
  );

  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    interstitialLoaded = true;
  });

  interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    loadInterstitialAd();
  });

  interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
    console.log("Interstitial error:", error);
    interstitialLoaded = false;
  });

  interstitial.load();
};

export const showInterstitialAd = async (): Promise<boolean> => {
  if (!interstitial || !interstitialLoaded) return false;
  try {
    await interstitial.show();
    interstitialLoaded = false;
    return true;
  } catch (error) {
    console.log("Show interstitial error:", error);
    return false;
  }
};

// ── Exports ─────────────────────────────────────────────────────────

export const getBannerAdUnitId = () => getAdUnitId("banner");
export { BannerAd, BannerAdSize };
```

**Note:** Replace the `XXXXXXXXXXXXXXXX` placeholders with the user's actual AdMob ad unit IDs. Ask the user before proceeding.

- [ ] **Step 2: Commit**

```bash
git add lib/admob.ts
git commit -m "feat: add AdMob module with banner and interstitial support"
```

---

### Task 3: Create `lib/store.ts`

**Files:**
- Create: `lib/store.ts`

- [ ] **Step 1: Create the IAP store module**

Create `lib/store.ts`:

```typescript
import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  getAvailablePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  type ProductPurchase,
  type PurchaseError,
  type Subscription,
} from "react-native-iap";
import { Platform } from "react-native";

const PRODUCT_ID = "com.camtip.removeads";

let purchaseUpdateSubscription: Subscription | null = null;
let purchaseErrorSubscription: Subscription | null = null;

export const initIAP = async (
  onPurchaseSuccess: () => void
): Promise<void> => {
  try {
    await initConnection();
    await getProducts({ skus: [PRODUCT_ID] });

    purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: ProductPurchase) => {
        if (purchase.productId === PRODUCT_ID) {
          await finishTransaction({ purchase });
          onPurchaseSuccess();
        }
      }
    );

    purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        console.log("IAP purchase error:", error);
      }
    );
  } catch (error) {
    console.log("IAP init error:", error);
  }
};

export const purchaseRemoveAds = async (): Promise<void> => {
  try {
    await requestPurchase({ sku: PRODUCT_ID });
  } catch (error) {
    console.log("Purchase error:", error);
  }
};

export const restorePurchases = async (): Promise<boolean> => {
  try {
    const purchases = await getAvailablePurchases();
    return purchases.some((p) => p.productId === PRODUCT_ID);
  } catch (error) {
    console.log("Restore error:", error);
    return false;
  }
};

export const endIAP = () => {
  purchaseUpdateSubscription?.remove();
  purchaseErrorSubscription?.remove();
  endConnection();
};
```

- [ ] **Step 2: Commit**

```bash
git add lib/store.ts
git commit -m "feat: add IAP store module for remove-ads purchase"
```

---

### Task 4: Create `lib/adState.tsx`

**Files:**
- Create: `lib/adState.tsx`

- [ ] **Step 1: Create the ad state context/provider**

Create `lib/adState.tsx`:

```tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  initIAP,
  purchaseRemoveAds as iapPurchase,
  restorePurchases as iapRestore,
  endIAP,
} from "./store";

const AD_FREE_KEY = "@camtip/ad_free";

interface AdStateContextType {
  isAdFree: boolean;
  loading: boolean;
  purchaseRemoveAds: () => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const AdStateContext = createContext<AdStateContextType>({
  isAdFree: false,
  loading: true,
  purchaseRemoveAds: async () => {},
  restorePurchases: async () => {},
});

export const useAdState = () => useContext(AdStateContext);

export function AdStateProvider({ children }: { children: ReactNode }) {
  const [isAdFree, setIsAdFree] = useState(false);
  const [loading, setLoading] = useState(true);

  const markAdFree = useCallback(async () => {
    await AsyncStorage.setItem(AD_FREE_KEY, "true");
    setIsAdFree(true);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      // Check cached state first (fast, avoids ad flash)
      const cached = await AsyncStorage.getItem(AD_FREE_KEY);
      if (cached === "true") {
        setIsAdFree(true);
        setLoading(false);
        return;
      }

      // Initialize IAP and listen for purchases
      await initIAP(() => {
        markAdFree();
      });

      setLoading(false);
    };

    bootstrap();
    return () => endIAP();
  }, [markAdFree]);

  const purchaseRemoveAds = useCallback(async () => {
    await iapPurchase();
  }, []);

  const restorePurchases = useCallback(async () => {
    const restored = await iapRestore();
    if (restored) {
      await markAdFree();
    }
  }, [markAdFree]);

  return (
    <AdStateContext.Provider
      value={{ isAdFree, loading, purchaseRemoveAds, restorePurchases }}
    >
      {children}
    </AdStateContext.Provider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/adState.tsx
git commit -m "feat: add ad state context with AsyncStorage persistence"
```

---

### Task 5: Update `components/AdBanner.tsx`

**Files:**
- Modify: `components/AdBanner.tsx`

- [ ] **Step 1: Replace placeholder with real BannerAd**

Replace the entire contents of `components/AdBanner.tsx`:

```tsx
import { BannerAd, BannerAdSize, getBannerAdUnitId } from "@/lib/admob";
import { useAdState } from "@/lib/adState";

export function AdBanner() {
  const { isAdFree } = useAdState();

  if (isAdFree) return null;

  return (
    <BannerAd
      unitId={getBannerAdUnitId()}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      onAdFailedToLoad={(error: any) => console.log("Banner error:", error)}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/AdBanner.tsx
git commit -m "feat: replace ad banner placeholder with real AdMob banner"
```

---

### Task 6: Delete `components/InterstitialAdPlaceholder.tsx`

**Files:**
- Delete: `components/InterstitialAdPlaceholder.tsx`

- [ ] **Step 1: Delete the placeholder component**

```bash
rm components/InterstitialAdPlaceholder.tsx
```

- [ ] **Step 2: Commit**

```bash
git add components/InterstitialAdPlaceholder.tsx
git commit -m "chore: remove interstitial ad placeholder component"
```

---

### Task 7: Update `app/_layout.tsx`

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Wrap app in AdStateProvider and initialize ads**

Replace the entire contents of `app/_layout.tsx`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: wrap app in AdStateProvider and initialize ads on mount"
```

---

### Task 8: Update `app/index.tsx`

**Files:**
- Modify: `app/index.tsx`

This is the biggest change. We need to:
1. Remove the `InterstitialAdPlaceholder` import and its state/refs/effects
2. Add real interstitial logic using `showInterstitialAd` from `lib/admob.ts`, gated by `isAdFree`
3. Add Remove Ads / Restore Purchases buttons

- [ ] **Step 1: Replace the entire contents of `app/index.tsx`**

```tsx
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { Stack } from "expo-router";
import Slider from "@react-native-community/slider";
import { useCallback, useEffect, useRef, useState } from "react";
import { Keypad } from "@/components/Keypad";
import { TipPresets } from "@/components/TipPresets";
import { InputModeToggle } from "@/components/InputModeToggle";
import { CameraScanner } from "@/components/CameraScanner";
import { AdBanner } from "@/components/AdBanner";
import { useAdState } from "@/lib/adState";
import { showInterstitialAd } from "@/lib/admob";

export default function TipCalculator() {
  const [billAmount, setBillAmount] = useState("");
  const [tipPercentage, setTipPercentage] = useState(18);
  const [inputMode, setInputMode] = useState<"keypad" | "camera">("camera");
  const interstitialShownRef = useRef(false);
  const { isAdFree, purchaseRemoveAds, restorePurchases } = useAdState();

  const bill = parseFloat(billAmount) || 0;
  const tipAmount = bill * (tipPercentage / 100);
  const totalAmount = bill + tipAmount;
  const displayBill = billAmount ? `$${billAmount}` : "$0.00";

  // Interstitial timer: 7s after first non-zero bill, once per session
  useEffect(() => {
    if (bill > 0 && !interstitialShownRef.current && !isAdFree) {
      const timeout = setTimeout(() => {
        showInterstitialAd();
        interstitialShownRef.current = true;
      }, 7000);
      return () => clearTimeout(timeout);
    }
  }, [bill, isAdFree]);

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

  const handleRemoveAds = useCallback(async () => {
    try {
      await purchaseRemoveAds();
    } catch {
      Alert.alert("Error", "Unable to complete purchase. Please try again.");
    }
  }, [purchaseRemoveAds]);

  const handleRestore = useCallback(async () => {
    try {
      await restorePurchases();
    } catch {
      Alert.alert("Error", "Unable to restore purchases. Please try again.");
    }
  }, [restorePurchases]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "CamTip",
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

          {/* Remove Ads / Restore */}
          {!isAdFree && (
            <View className="flex-row justify-center items-center mt-4 gap-4">
              <Pressable onPress={handleRemoveAds}>
                <Text className="text-purple-400 text-sm underline">
                  Remove Ads ($0.99)
                </Text>
              </Pressable>
              <Text className="text-gray-600">|</Text>
              <Pressable onPress={handleRestore}>
                <Text className="text-gray-500 text-sm underline">
                  Restore Purchase
                </Text>
              </Pressable>
            </View>
          )}
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
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/index.tsx
git commit -m "feat: wire up real interstitial ads and remove-ads purchase UI"
```

---

### Task 9: Build and Test

**Files:** None (verification only)

- [ ] **Step 1: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 2: Verify Expo config is valid**

```bash
npx expo config --type public
```

Expected: JSON output with the `react-native-google-mobile-ads` plugin listed.

- [ ] **Step 3: Create a development build**

Ads and IAP require native code, so they won't work in Expo Go. You need a development build:

```bash
npx expo prebuild --clean
npx expo run:ios
```

Or use EAS:

```bash
eas build --platform ios --profile development
```

- [ ] **Step 4: Verify ads appear**

In the dev build, test ads (from `TestIds`) should render:
- Banner ad visible at bottom of screen
- Interstitial appears ~7s after entering a bill amount

- [ ] **Step 5: Verify IAP flow**

In a TestFlight/sandbox build:
- "Remove Ads ($0.99)" button visible above the banner
- Tapping triggers the App Store purchase sheet
- After purchase, ads disappear and buttons hide
- "Restore Purchase" restores the ad-free state on a fresh install

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete monetization setup with AdMob ads and remove-ads IAP"
```
