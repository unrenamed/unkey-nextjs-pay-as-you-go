import { Tooltip } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

export const TierDetails = ({
  tier,
  costUsage,
}: {
  tier: {
    displayName: string;
    limitDisplay: string;
  };
  costUsage: number;
}) => (
  <div className="flex gap-10">
    <div className="flex flex-col">
      <span className="text-foreground/40 font-medium">Tier</span>
      <span className="text-lg font-semibold">{tier.displayName}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-foreground/40 font-medium">Limit</span>
      <span className="text-lg font-semibold">{tier.limitDisplay}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-foreground/40 font-medium flex items-center gap-1">
        Cost
        <Tooltip
          side="right"
          content="Showing cached data for faster loading. Final usage cost will be accurate by the end of the month when billed."
        >
          <InfoIcon size={12} strokeWidth={2} className="stroke-yellow-500" />
        </Tooltip>
      </span>
      <span className="text-lg font-semibold">{costUsage}$/month</span>
    </div>
  </div>
);
