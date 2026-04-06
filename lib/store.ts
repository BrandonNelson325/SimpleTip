import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  getAvailablePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  type Purchase,
  type PurchaseError,
  type EventSubscription,
} from "react-native-iap";
import { Platform } from "react-native";

const PRODUCT_ID = "com.camtip.removeads";

let purchaseUpdateSubscription: EventSubscription | null = null;
let purchaseErrorSubscription: EventSubscription | null = null;

export const initIAP = async (
  onPurchaseSuccess: () => void
): Promise<void> => {
  try {
    await initConnection();
    await fetchProducts({ skus: [PRODUCT_ID] });

    purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: Purchase) => {
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
    if (Platform.OS === "ios") {
      await requestPurchase({
        request: { apple: { sku: PRODUCT_ID } },
        type: "in-app",
      });
    } else {
      await requestPurchase({
        request: { google: { skus: [PRODUCT_ID] } },
        type: "in-app",
      });
    }
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
