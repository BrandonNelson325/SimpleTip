import { EmitterSubscription } from "react-native";
import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  getAvailablePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  type Purchase,
  type PurchaseError,
} from "react-native-iap";

const PRODUCT_ID = "com.camtip.removeads";

let purchaseUpdateSubscription: EmitterSubscription | null = null;
let purchaseErrorSubscription: EmitterSubscription | null = null;

export const initIAP = async (
  onPurchaseSuccess: () => void
): Promise<void> => {
  try {
    await initConnection();
    await getProducts({ skus: [PRODUCT_ID] });

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
