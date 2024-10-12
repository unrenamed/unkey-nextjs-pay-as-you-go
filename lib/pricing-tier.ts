export type TierType = "trial" | "basic" | "pro" | "premium";

export type Tier = {
  displayName: string;
  limit: number;
  price: number;
  next: TierType | null;
};

export const PRICING_TIERS: Record<string, Tier> = {
  trial: { displayName: "Trial", limit: 10, price: 0.0, next: "basic" },
  basic: { displayName: "Basic", limit: 100, price: 0.1, next: "pro" },
  pro: { displayName: "Pro", limit: 1000, price: 0.08, next: "premium" },
  premium: { displayName: "Premium", limit: Infinity, price: 0.05, next: null },
};

export const calculateCostForUsage = (usage: number): number => {
  let totalPrice = 0.0;
  let remainingUsage = usage;
  let currentTier: TierType | null = "trial";

  while (remainingUsage > 0 && currentTier) {
    const { limit, price, next }: Tier = PRICING_TIERS[currentTier];
    const usageInCurrentTier = Math.min(remainingUsage, limit);
    totalPrice += usageInCurrentTier * price;
    remainingUsage -= usageInCurrentTier;
    currentTier = next;
  }

  return Math.round(totalPrice * 100) / 100; // round to two decimal places
};
