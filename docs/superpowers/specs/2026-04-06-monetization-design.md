# CamTip Monetization Design

## Overview

Add AdMob ads (banner + interstitial) and a $0.99 non-consumable in-app purchase to remove ads permanently. iOS first, Android later.

## Ad Implementation

### Library

`react-native-google-mobile-ads` — same library and pattern used in locknrollv2.

### Ad Types

- **Banner ad:** Persistent at the bottom of the main screen. Replaces the current placeholder `AdBanner` component.
- **Interstitial ad:** Preloaded at app start. Shown once per session, triggered 7 seconds after the user enters a non-zero bill amount (preserving existing timer logic).
- **App-open ad:** Not included. Sessions are short; an app-open ad would feel aggressive.

### Architecture

`lib/admob.ts` — centralized module exporting:
- `initializeAds()` — initialize the Mobile Ads SDK
- `loadInterstitialAd()` — preload an interstitial
- `showInterstitialAd()` — show the preloaded interstitial (no-op if `isAdFree`)

Ad unit IDs are platform-specific constants. Uses `TestIds` from the library when `__DEV__` is true.

### app.json Config

Add `react-native-google-mobile-ads` plugin with iOS app ID (Android app ID added later). Also add `ios.config.googleMobileAdsAppId`.

## In-App Purchase (Remove Ads)

### Library

`react-native-iap` — handles store connection, purchasing, restoring, and transaction acknowledgment.

### Product

- **Product ID:** `com.camtip.removeads`
- **Type:** Non-consumable
- **Price:** $0.99
- **Platform:** iOS (App Store Connect) — already created

### Architecture

**`lib/store.ts`** — IAP logic:
- `initIAP()` — connect to the store, set up purchase listeners
- `purchaseRemoveAds()` — trigger purchase of `com.camtip.removeads`
- `restorePurchases()` — restore previous purchases (required by Apple)
- `endIAP()` — disconnect from the store on cleanup
- Listens for purchase updates and errors, finishes transactions, updates ad-free state

**`lib/adState.tsx`** — React context for ad-free state:
- `AdStateProvider` — wraps the app, provides `isAdFree`, `purchaseRemoveAds()`, `restorePurchases()`, `loading`
- On mount: reads `@camtip/ad_free` from AsyncStorage for instant UI (avoids flash), then validates with `react-native-iap` available purchases
- On successful purchase/restore: sets AsyncStorage `@camtip/ad_free` to `"true"` and updates context

### Ad Visibility When Ad-Free

When `isAdFree` is `true`:
- Banner ad component returns `null`
- Interstitial ad is never loaded or shown
- No ad SDK calls are made (saves battery/data)

### UI

- **"Remove Ads" button:** Small, subtle placement near the banner ad area. Triggers the purchase flow.
- **"Restore Purchases" button:** Adjacent to Remove Ads button. Required by Apple review guidelines.

## File Changes

### New Files

| File | Purpose |
|------|---------|
| `lib/admob.ts` | AdMob initialization, loading, showing |
| `lib/store.ts` | IAP connection, purchase, restore |
| `lib/adState.tsx` | React context/provider for `isAdFree` + AsyncStorage |

### Modified Files

| File | Change |
|------|--------|
| `app.json` | Add `react-native-google-mobile-ads` plugin config |
| `app/_layout.tsx` | Wrap app in `AdStateProvider`, initialize ads + IAP on mount |
| `app/index.tsx` | Conditional ad rendering based on `isAdFree`, add Remove Ads / Restore buttons, remove interstitial placeholder logic |
| `components/AdBanner.tsx` | Replace placeholder with real `BannerAd` component, conditionally render based on `isAdFree` |

### Deleted Files

| File | Reason |
|------|--------|
| `components/InterstitialAdPlaceholder.tsx` | Replaced by real interstitial in `lib/admob.ts` |

### New Dependencies

| Package | Purpose |
|---------|---------|
| `react-native-google-mobile-ads` | AdMob banner + interstitial ads |
| `react-native-iap` | In-app purchase for remove ads |
| `@react-native-async-storage/async-storage` | Persist ad-free state locally |
