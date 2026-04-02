# SimpleTip: NativeScript to Expo Conversion

## Overview

Convert the existing NativeScript TypeScript tip calculator app to a React Native / Expo SDK 52 project with Expo Router and NativeWind. The goal is to align with the user's existing Expo-based apps, enable EAS builds, and set up routing for future feature expansion.

## Architecture

- **Framework:** Expo SDK 52, managed workflow
- **Routing:** Expo Router (file-based routing in `app/` directory)
- **Styling:** NativeWind v4 (Tailwind CSS for React Native)
- **Language:** TypeScript
- **State management:** React `useState` hooks (no external library needed)
- **Build system:** EAS with local build support for emulators

## Project Structure

```
SimpleTip/
  app/
    _layout.tsx          # Root layout with Expo Router, SafeAreaProvider, dark theme
    index.tsx            # Tip calculator screen (main screen)
  components/
    Keypad.tsx           # Custom 4x3 numeric keypad
    TipPresets.tsx       # 16%, 18%, 20% quick-select buttons
  assets/               # App icons, splash screen (future)
  app.json              # Expo config
  eas.json              # EAS build profiles
  tailwind.config.js    # NativeWind/Tailwind config
  tsconfig.json         # TypeScript config
  package.json          # Dependencies
  global.css            # Tailwind directives for NativeWind
```

## Screen: Tip Calculator (`app/index.tsx`)

### Layout (top to bottom)

1. **Header area** — "Simple Tip" title with Clear button on the right
2. **Bill amount display** — Large styled label showing `$X.XX`, centered in a dark card
3. **Tip preset buttons** — Row of three buttons: 16%, 18%, 20%
   - Active button: `bg-purple-600 text-white`
   - Inactive button: `bg-gray-800 text-purple-400 border-2 border-purple-600`
4. **Tip slider** — Range 0-30%, with percentage label below
5. **Results card** — Two columns showing Tip Amount and Total, in a `bg-gray-800` rounded card
6. **Custom numeric keypad** — 4x3 grid (1-9, dot, 0, backspace)
7. **Bottom spacer** — Reserved for future ad space (empty 64px bar)

### State

```typescript
const [billAmount, setBillAmount] = useState('');        // raw digits string, no $
const [tipPercentage, setTipPercentage] = useState(18);  // integer 0-30
```

Derived values (computed each render, no separate state needed):
- `bill = parseFloat(billAmount) || 0`
- `tipAmount = bill * (tipPercentage / 100)`
- `totalAmount = bill + tipAmount`
- `displayBill = billAmount ? `$${billAmount}` : '$0.00'`

### Keypad Logic (ported from existing `TipCalculatorModel`)

- No multiple decimal points
- Max 2 decimal places
- Max 8 characters
- No leading zeros (except before decimal)
- Backspace removes last character
- Clear resets bill to empty and tip to 18%

## Components

### `components/Keypad.tsx`

Props:
- `onKeyPress: (key: string) => void`
- `onBackspace: () => void`

Renders a 4x3 grid of `TouchableOpacity` or `Pressable` buttons:
```
[ 1 ] [ 2 ] [ 3 ]
[ 4 ] [ 5 ] [ 6 ]
[ 7 ] [ 8 ] [ 9 ]
[ . ] [ 0 ] [ ⌫ ]
```

Styled: `bg-gray-800 text-white border border-gray-700 rounded-xl`, large text.

### `components/TipPresets.tsx`

Props:
- `selected: number` — currently selected tip percentage
- `onSelect: (percent: number) => void`

Renders three buttons (16%, 18%, 20%) in a row. Active state toggles purple fill vs outline.

## Theme

- Background: black (`bg-black`)
- Cards: `bg-gray-800`
- Accent: `purple-600` / `purple-400`
- Text: white primary, `gray-400` secondary
- Dark status bar

## Dependencies

### Production
- `expo` (~52.x)
- `expo-router`
- `expo-linking`
- `expo-constants`
- `expo-status-bar`
- `react-native-safe-area-context`
- `react-native-screens`
- `nativewind`
- `react-native-reanimated`
- `@react-native-community/slider`

### Dev
- `tailwindcss`
- `typescript`
- `@types/react`

## EAS Configuration

### `eas.json`

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

### `app.json`

- `name`: "SimpleTip"
- `slug`: "simple-tip"
- `scheme`: "simpletip" (for deep linking / Expo Router)
- `version`: "1.0.0"
- `orientation`: "portrait"
- `userInterfaceStyle`: "dark"
- Bundle identifiers: `com.simpletip.app` (iOS and Android)
- Expo Router plugin and NativeWind babel preset configured

## Running Locally

1. `npm install`
2. `npx expo start` — launches dev server, can open in Expo Go or dev client
3. Press `i` for iOS simulator or `a` for Android emulator
4. For EAS dev build: `eas build --profile development --platform ios --local`

## Migration Notes

- All NativeScript files (XML views, NativeScript config, platforms/, hooks/) will be removed
- The tip calculation logic ports directly — it's plain TypeScript math
- The custom keypad is reimplemented as React Native `Pressable` components
- NativeScript's `Observable` pattern is replaced by React `useState`
- The `.bolt/` and `.stackblitzrc` files (StackBlitz artifacts) will be removed

## Out of Scope

- Additional screens (future work, but router is in place)
- Ads integration (space reserved, not implemented)
- App icons and splash screen assets (can be added later)
- Push notifications, analytics, or other services
