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
