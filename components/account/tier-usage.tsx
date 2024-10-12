import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/progress-bar";

export const TierUsage = ({
  creditsUsedCount,
  tierLimit,
  creditsUsedPercentage,
  usageResetsOn,
}: {
  creditsUsedCount: number;
  tierLimit: number;
  creditsUsedPercentage: number;
  usageResetsOn: string;
}) => (
  <Card className="flex flex-col p-6 gap-1">
    <h3 className="font-bold text-md">Tier usage</h3>
    <p className="text-sm text-foreground/40">
      Usage resets on {usageResetsOn}
    </p>
    <div className="flex flex-col gap-2 mt-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-md">Credits</h4>
        <p className="font-bold text-md text-foreground/40">
          {creditsUsedCount}/{tierLimit}
        </p>
      </div>
      <ProgressBar
        initialProgress={0}
        currentProgress={creditsUsedPercentage}
      />
    </div>
  </Card>
);
