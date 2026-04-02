# SimpleTip Expo Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the NativeScript tip calculator to an Expo SDK 52 app with Expo Router, NativeWind, and EAS build support.

**Architecture:** Fresh Expo managed-workflow project with file-based routing (`app/` directory). NativeWind v4 for Tailwind styling in React Native. Two reusable components (`Keypad`, `TipPresets`) composed in a single calculator screen. State managed with React `useState` hooks.

**Tech Stack:** Expo SDK 52, Expo Router, NativeWind v4, TypeScript, EAS CLI

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `package.json` | Replace | Expo dependencies, scripts |
| `tsconfig.json` | Replace | Expo/RN TypeScript config |
| `app.json` | Create | Expo app configuration |
| `eas.json` | Create | EAS build profiles |
| `babel.config.js` | Create | Babel with NativeWind preset |
| `metro.config.js` | Create | Metro bundler with NativeWind |
| `tailwind.config.js` | Replace | NativeWind v4 Tailwind config |
| `global.css` | Create | Tailwind directives |
| `nativewind-env.d.ts` | Create | NativeWind type declarations |
| `.gitignore` | Replace | Expo-appropriate ignores |
| `app/_layout.tsx` | Create | Root layout, SafeAreaProvider, dark theme |
| `app/index.tsx` | Create | Tip calculator screen |
| `components/Keypad.tsx` | Create | Custom 4x3 numeric keypad |
| `components/TipPresets.tsx` | Create | 16/18/20% quick-select buttons |
| Old NativeScript files | Delete | `nativescript.config.ts`, `webpack.config.js`, `references.d.ts`, `project.json`, `.stackblitzrc`, `.bolt/`, `hooks/`, `platforms/`, `app/` (old NativeScript files) |

---

### Task 1: Clean Up NativeScript Files

Remove all NativeScript-specific files and directories. The old `app/` directory contents will be replaced by Expo Router files in later tasks.

**Files:**
- Delete: `nativescript.config.ts`
- Delete: `webpack.config.js`
- Delete: `references.d.ts`
- Delete: `project.json`
- Delete: `.stackblitzrc`
- Delete: `.bolt/` (directory)
- Delete: `hooks/` (directory)
- Delete: `platforms/` (directory)
- Delete: `app/app-root.xml`
- Delete: `app/app.css`
- Delete: `app/app.ts`
- Delete: `app/main-page.ts`
- Delete: `app/main-page.xml`
- Delete: `app/main-view-model.ts`
- Delete: `package-lock.json`
- Delete: `tailwind.config.js` (will be recreated for NativeWind)
- Delete: `.DS_Store`
- Delete: `README.md`

- [ ] **Step 1: Delete NativeScript files and directories**

```bash
rm -f nativescript.config.ts webpack.config.js references.d.ts project.json .stackblitzrc .DS_Store README.md package-lock.json tailwind.config.js
rm -rf .bolt hooks platforms
rm -f app/app-root.xml app/app.css app/app.ts app/main-page.ts app/main-page.xml app/main-view-model.ts
```

- [ ] **Step 2: Verify only docs and .git remain**

```bash
ls -la
```

Expected: Only `.git/`, `.gitignore`, `app/` (empty dir), and `docs/` remain.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove NativeScript files in preparation for Expo conversion"
```

---

### Task 2: Initialize Expo Project Scaffolding

Create all config files for the Expo project: `package.json`, `app.json`, `eas.json`, `tsconfig.json`, `babel.config.js`, `metro.config.js`, `.gitignore`.

**Files:**
- Create: `package.json`
- Create: `app.json`
- Create: `eas.json`
- Create: `tsconfig.json`
- Create: `babel.config.js`
- Create: `metro.config.js`
- Replace: `.gitignore`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "simple-tip",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "lint": "expo lint"
  },
  "dependencies": {
    "@react-native-community/slider": "^4.5.5",
    "expo": "~52.0.0",
    "expo-constants": "~17.0.0",
    "expo-linking": "~7.0.0",
    "expo-router": "~4.0.0",
    "expo-status-bar": "~2.0.0",
    "nativewind": "^4.1.23",
    "react": "18.3.1",
    "react-native": "0.76.7",
    "react-native-reanimated": "~3.16.0",
    "react-native-safe-area-context": "4.14.1",
    "react-native-screens": "~4.4.0"
  },
  "devDependencies": {
    "@types/react": "~18.3.0",
    "tailwindcss": "^3.4.0",
    "typescript": "~5.3.0"
  },
  "private": true
}
```

- [ ] **Step 2: Create `app.json`**

```json
{
  "expo": {
    "name": "SimpleTip",
    "slug": "simple-tip",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "dark",
    "scheme": "simpletip",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.simpletip.app"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#000000"
      },
      "package": "com.simpletip.app"
    },
    "plugins": [
      "expo-router"
    ]
  }
}
```

- [ ] **Step 3: Create `eas.json`**

```json
{
  "cli": {
    "version": ">= 13.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts", "nativewind-env.d.ts"]
}
```

- [ ] **Step 5: Create `babel.config.js`**

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

- [ ] **Step 6: Create `metro.config.js`**

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

- [ ] **Step 7: Replace `.gitignore`**

```
node_modules/
.expo/
dist/
npm-debug.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
.DS_Store

# EAS
eas-build-*

# env files
.env*.local
```

- [ ] **Step 8: Commit**

```bash
git add package.json app.json eas.json tsconfig.json babel.config.js metro.config.js .gitignore
git commit -m "feat: add Expo SDK 52 project scaffolding"
```

---

### Task 3: Configure NativeWind / Tailwind CSS

Set up NativeWind v4 with Tailwind CSS so utility classes work in React Native components.

**Files:**
- Create: `tailwind.config.js`
- Create: `global.css`
- Create: `nativewind-env.d.ts`

- [ ] **Step 1: Create `tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

- [ ] **Step 2: Create `global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: Create `nativewind-env.d.ts`**

```typescript
/// <reference types="nativewind/types" />
```

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.js global.css nativewind-env.d.ts
git commit -m "feat: configure NativeWind v4 with Tailwind CSS"
```

---

### Task 4: Create Root Layout

Set up the Expo Router root layout with SafeAreaProvider, dark status bar, and global CSS import.

**Files:**
- Create: `app/_layout.tsx`

- [ ] **Step 1: Create `app/_layout.tsx`**

```tsx
import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#9333ea" },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "bold" },
          contentStyle: { backgroundColor: "#000000" },
        }}
      />
    </SafeAreaProvider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: add Expo Router root layout with dark theme"
```

---

### Task 5: Build the TipPresets Component

Create the tip percentage quick-select buttons (16%, 18%, 20%).

**Files:**
- Create: `components/TipPresets.tsx`

- [ ] **Step 1: Create `components/TipPresets.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
mkdir -p components
git add components/TipPresets.tsx
git commit -m "feat: add TipPresets component"
```

---

### Task 6: Build the Keypad Component

Create the custom 4x3 numeric keypad.

**Files:**
- Create: `components/Keypad.tsx`

- [ ] **Step 1: Create `components/Keypad.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/Keypad.tsx
git commit -m "feat: add Keypad component"
```

---

### Task 7: Build the Tip Calculator Screen

Create the main calculator screen at `app/index.tsx` with all state, calculation logic, and layout.

**Files:**
- Create: `app/index.tsx`

- [ ] **Step 1: Create `app/index.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add app/index.tsx
git commit -m "feat: add tip calculator screen with keypad and calculations"
```

---

### Task 8: Install Dependencies and Verify Build

Install all npm dependencies and verify the project starts without errors.

**Files:**
- Modify: `package.json` (lockfile generated)

- [ ] **Step 1: Install dependencies**

```bash
npm install
```

Expected: Clean install with no errors. `node_modules/` and `package-lock.json` created.

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Start Expo dev server to verify bundling**

```bash
npx expo start --no-dev --minify 2>&1 | head -20
```

Expected: Metro bundler starts, no crash. Look for "Metro waiting on" message.

- [ ] **Step 4: Commit lockfile**

```bash
git add package-lock.json
git commit -m "chore: add package-lock.json"
```

---

### Task 9: Final Cleanup and Verification

Remove any remaining old files and verify the full project is clean.

**Files:**
- Delete: `package.json` leftover NativeScript entries (if any)
- Verify: all files in place

- [ ] **Step 1: Verify project structure**

```bash
find . -not -path './.git/*' -not -path './node_modules/*' -not -path './.expo/*' -not -path './docs/*' -not -name '.DS_Store' -not -path './.claude/*' | sort
```

Expected output should show only:
```
.
./.gitignore
./app
./app/_layout.tsx
./app/index.tsx
./app.json
./babel.config.js
./components
./components/Keypad.tsx
./components/TipPresets.tsx
./eas.json
./global.css
./metro.config.js
./nativewind-env.d.ts
./package-lock.json
./package.json
./tailwind.config.js
./tsconfig.json
```

- [ ] **Step 2: Verify the app launches in iOS simulator**

```bash
npx expo start --ios
```

Expected: Simulator opens, app loads with the tip calculator UI on a black background with purple accents.

- [ ] **Step 3: Commit any remaining changes**

```bash
git add -A
git commit -m "chore: final cleanup for Expo conversion"
```

Only commit if there are changes to commit. Skip if working tree is clean.
