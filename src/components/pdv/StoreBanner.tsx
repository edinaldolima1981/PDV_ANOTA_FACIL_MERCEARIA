import { useStore } from "@/contexts/StoreContext";

interface StoreBannerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  rounded?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<StoreBannerProps["size"]>, string> = {
  sm: "h-8 md:h-10 max-w-[120px] md:max-w-[180px]",
  md: "h-12 md:h-14 max-w-[180px] md:max-w-[220px]",
  lg: "h-20 md:h-24 max-w-[280px]",
};

const StoreBanner = ({ size = "sm", className = "", rounded = true }: StoreBannerProps) => {
  const { storeBanner, storeName } = useStore();

  if (!storeBanner) return null;

  return (
    <img
      src={storeBanner}
      alt={`Banner ${storeName}`}
      className={`${SIZE_CLASSES[size]} w-auto object-contain ${rounded ? "rounded-lg" : ""} flex-shrink-0 ${className}`}
    />
  );
};

export default StoreBanner;
