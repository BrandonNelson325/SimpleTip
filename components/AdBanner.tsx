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
