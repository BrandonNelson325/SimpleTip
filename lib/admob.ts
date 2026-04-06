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
    banner: "ca-app-pub-4471669474742212/7326308943",
    interstitial: "ca-app-pub-4471669474742212/4606774707",
  },
  android: {
    banner: "ca-app-pub-3940256099942544/9214589741",
    interstitial: "ca-app-pub-3940256099942544/1033173712",
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
