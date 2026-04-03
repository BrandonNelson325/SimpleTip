# SimpleTip: Camera OCR & Ad Placeholders

## Overview

Add two major features to SimpleTip: (1) a camera-based bill scanner that uses on-device OCR to extract the total from a receipt, and (2) ad placeholders (banner + interstitial) sized for AdMob, ready to wire up later. The existing keypad input stays identical — the camera is an alternative input mode toggled by the user.

## Architecture

- **Camera:** `expo-camera` for preview/capture, `@react-native-ml-kit/text-recognition` for on-device OCR
- **Input mode:** Toggle state in `app/index.tsx` switches between keypad and camera in the same screen area
- **Ads:** Placeholder components that match AdMob sizing — no SDK wired up yet
- **OCR parsing:** Pure utility function that extracts dollar amounts from recognized text

## Layout Changes

### Current layout (top to bottom)
1. Header ("Simple Tip") — purple, standard height
2. ScrollView (bill display, presets, slider, results card)
3. Keypad
4. Bottom spacer (h-16)

### New layout (top to bottom)
1. Header ("Simple Tip") — **made shorter/tighter**
2. **Input mode toggle** — compact row (Keypad | Camera), right below header
3. ScrollView (bill display, presets, slider, results card)
4. **Keypad OR Camera view** — same space, swapped by toggle
5. **Banner ad placeholder** — fixed at bottom, 320x50 (AdMob standard banner)

### Interstitial ad
- Full-screen modal overlay
- Triggers 7 seconds after the first non-zero bill calculation in the session
- Shows once per session (ref-tracked flag)
- Auto-dismisses after 5 seconds or on user tap, whichever is first

## Components

### `components/InputModeToggle.tsx` (new)

Compact toggle row with two options: "Keypad" and "Camera".

Props:
- `mode: "keypad" | "camera"`
- `onModeChange: (mode: "keypad" | "camera") => void`

Styled as a segmented control: active tab is `bg-purple-600 text-white`, inactive is `bg-gray-800 text-purple-400`. Compact height — no more than 40px total.

### `components/CameraScanner.tsx` (new)

Camera preview with a scan button. Fills the same vertical space as the keypad.

Props:
- `onAmountDetected: (amount: string) => void`

Behavior:
1. Shows live camera preview (back camera)
2. User points at receipt, taps "Scan" button overlaid at bottom of camera view
3. Captures a photo
4. Runs ML Kit text recognition on the captured image
5. Passes recognized text to `extractBillAmount()` utility
6. If amount found: calls `onAmountDetected(amount)` — this feeds into `setBillAmount` in the parent
7. If no amount found: shows brief error text ("Couldn't find a total - try again") for 3 seconds, then clears

States:
- `idle` — camera preview with "Scan" button
- `processing` — brief loading indicator while OCR runs
- `error` — "Couldn't find a total" message, auto-clears after 3 seconds

Handles camera permissions internally — if not granted, shows a "Camera access needed" message with a button to open settings.

### `components/AdBanner.tsx` (new)

Fixed banner ad placeholder at the bottom of the screen.

Props: none

Renders a 320x50 dark gray bar with centered "Ad" text. Replaces the current `h-16` spacer. When AdMob is wired up later, the placeholder content gets swapped for `<BannerAd />` from `react-native-google-mobile-ads`.

### `components/InterstitialAdPlaceholder.tsx` (new)

Full-screen modal overlay that simulates an interstitial ad.

Props:
- `visible: boolean`
- `onDismiss: () => void`

Renders:
- Semi-transparent black overlay covering the full screen
- Centered card (dark gray, rounded) with "Ad" text and a countdown
- "Close" button that appears immediately (or after the countdown, matching AdMob behavior — we'll use immediately for the placeholder)
- Auto-dismisses after 5 seconds via internal timer

### `utils/extractBillAmount.ts` (new)

Pure function: `extractBillAmount(ocrText: string): string | null`

Extraction logic:
1. Search for dollar amounts matching patterns like `$XX.XX`, `$X,XXX.XX`
2. Also search for bare numbers near keywords: "total", "amount due", "balance due", "grand total", "amount", "due"
3. Collect all candidate dollar amounts
4. Return the largest one as a string (digits and decimal only, no `$` — matches `billAmount` state format)
5. Return `null` if no amounts found

This is a pure function with no dependencies — easy to unit test.

### Existing components — no changes

- `components/Keypad.tsx` — stays identical
- `components/TipPresets.tsx` — stays identical

## State Changes in `app/index.tsx`

New state:
```typescript
const [inputMode, setInputMode] = useState<"keypad" | "camera">("keypad");
const [showInterstitial, setShowInterstitial] = useState(false);
const interstitialShownRef = useRef(false);
```

Interstitial timer logic:
- `useEffect` watches `billAmount`
- When `billAmount` first becomes non-zero AND `interstitialShownRef.current` is false:
  - Start a 7-second `setTimeout`
  - When it fires: set `showInterstitial = true`, set `interstitialShownRef.current = true`
- Cleanup: clear timeout on unmount or if billAmount goes back to empty before timer fires

Camera amount handler:
```typescript
const handleAmountDetected = useCallback((amount: string) => {
  setBillAmount(amount);
  setInputMode("keypad"); // Switch back to keypad after scanning
}, []);
```

After a successful scan, the toggle switches back to keypad mode so the user sees their bill amount and can adjust if needed.

## Header Changes

The `Stack.Screen` header options in `app/index.tsx` stay as-is (title "Simple Tip", purple background). The header height reduction is achieved by keeping default Expo Router header styling but ensuring no extra padding or large title mode.

The `InputModeToggle` sits immediately below the header, inside the main `View` but above the `ScrollView`.

## New Dependencies

- `expo-camera` — camera preview and photo capture
- `@react-native-ml-kit/text-recognition` — on-device text recognition (Google ML Kit)

Both work in Expo dev builds (not Expo Go). The user is already running `expo run:ios`.

## Ad Sizing Reference (for future AdMob wiring)

- Banner: 320x50 (`BannerAdSize.BANNER`)
- Interstitial: full-screen (`InterstitialAd` from `react-native-google-mobile-ads`)
- These placeholders are shaped to match so the layout doesn't shift when real ads are integrated

## Out of Scope

- Actual AdMob SDK integration (placeholders only)
- Multi-receipt scanning / itemized bill parsing
- Manual photo selection from gallery
- Android-specific camera handling (will work via expo-camera cross-platform, but testing is iOS only for now)
