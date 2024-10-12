import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  calculateUsageCostForUnkeyApiKey,
  getUnkeyApiKeyDetails,
} from "../actions";
import { Card } from "@/components/ui/card";
import { PRICING_TIERS, TierType } from "@/lib/pricing-tier";
import { endOfMonthTimestamp, pluralize, timeAgo } from "@/lib/utils";
import { AnalyticsCard } from "@/components/account/analytics-card";
import { Interval } from "@/lib/interval";
import Link from "next/link";
import { InfoBanner } from "@/components/ui/info-banner";
import { UserDetails } from "@/components/account/user-details";
import { NextTierInfo } from "@/components/account/next-tier-info";
import { TierUsage } from "@/components/account/tier-usage";
import { TierDetails } from "@/components/account/tier-details";

const getTierInfo = (tierType: TierType) => {
  const tier = PRICING_TIERS[tierType];
  const tierLimit = tier.limit;
  const nextTier = tier.next ? PRICING_TIERS[tier.next] : null;

  const tierLimitDisplay =
    tierLimit === Infinity
      ? "Unlimited credits"
      : pluralize(tierLimit, "credit");

  let nextTierInfo = null;

  if (nextTier) {
    const limitDisplay =
      nextTier.limit === Infinity
        ? "Unlimited credits"
        : pluralize(nextTier.limit, "credit");

    nextTierInfo = {
      limitDisplay,
      displayName: nextTier.displayName,
      price: nextTier.price,
    };
  }

  return {
    tier,
    tierLimitDisplay,
    nextTierInfo,
  };
};

const getUsageDetails = (tierLimit: number, remainingCredits: number) => {
  const creditsUsedCount = tierLimit - remainingCredits;
  return {
    creditsUsedCount,
    creditsUsedPercentage: Math.floor((creditsUsedCount / tierLimit) * 100),
  };
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { interval: string };
}) {
  const interval = (searchParams.interval as Interval) ?? "7d";
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const unkeyKeyId = user.user_metadata["unkey_key_id"]!;

  const [
    { result: costUsage, error: costUsageError },
    { result: keyDetails, error: keyDetailsError },
  ] = await Promise.all([
    calculateUsageCostForUnkeyApiKey(unkeyKeyId),
    getUnkeyApiKeyDetails(unkeyKeyId),
  ]);

  if (costUsageError) {
    console.error(costUsageError);
    return null;
  }

  if (keyDetailsError) {
    console.error(keyDetailsError);
    return null;
  }

  const { tier, tierLimitDisplay, nextTierInfo } = getTierInfo(
    keyDetails!.currentTier
  );
  const { creditsUsedCount, creditsUsedPercentage } = getUsageDetails(
    tier.limit,
    keyDetails!.remaining
  );
  const updatedAgo = keyDetails!.updatedAt
    ? timeAgo(keyDetails!.updatedAt)
    : null;
  const usageResetsOn = new Date(endOfMonthTimestamp()).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <InfoBanner>
        This page is only accessible to authenticated users. To test your
        billing dashboard updates, please make an API call by navigating to{" "}
        <Link className="text-blue-500" href="/account/call-api">
          <code>/account/call-api</code>
        </Link>
      </InfoBanner>

      <UserDetails user={user} />

      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Plan & billing</h2>
        <Card className="flex flex-col p-6 gap-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Tier details</h3>
            <div className="text-xs font-medium rounded-sm py-1 px-2 text-foreground/40 bg-accent">
              Updated {updatedAgo}
            </div>
          </div>

          <TierDetails
            tier={{
              displayName: tier.displayName,
              limitDisplay: tierLimitDisplay,
            }}
            costUsage={costUsage!}
          />

          {isFinite(tier.limit) && (
            <TierUsage
              creditsUsedCount={creditsUsedCount}
              tierLimit={tier.limit}
              creditsUsedPercentage={creditsUsedPercentage}
              usageResetsOn={usageResetsOn}
            />
          )}

          {nextTierInfo && <NextTierInfo nextTier={nextTierInfo} />}

          <InfoBanner>
            Your plan automatically adjusts based on your usage. As you approach
            or exceed your quota, you'll seamlessly move to the next tier.
          </InfoBanner>
        </Card>
      </div>

      <div className="flex flex-col gap-2 items-start w-full">
        <h2 className="font-bold text-2xl mb-4">Usage Analytics</h2>
        <AnalyticsCard user={user} interval={interval} />
      </div>
    </div>
  );
}
