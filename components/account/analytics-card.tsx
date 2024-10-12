import { INTERVAL_START_DATE } from "@/lib/interval";
import { Card } from "../ui/card";
import { AnalyticsChart } from "./analytics-chart";
import { IntervalDropdown } from "./interval-dropdown";
import { Interval } from "@/lib/interval";
import { User } from "@supabase/supabase-js";
import { getUnkeyApiKeyVerifications } from "@/app/actions";

export async function AnalyticsCard({
  user,
  interval,
}: {
  user: User;
  interval: Interval;
}) {
  const { result, error } = await getUnkeyApiKeyVerifications(
    user.user_metadata["unkey_key_id"]!,
    INTERVAL_START_DATE[interval]
  );

  if (error) {
    console.error(error);
    return null;
  }

  let chartData: { date: string; value: number }[] = [];

  if (result) {
    chartData = result.verifications.map(({ time, success }) => ({
      date: new Date(time).toLocaleDateString(),
      value: success,
    }));
  }

  const totalClicks = chartData.reduce((sum, v) => sum + v.value, 0);

  return (
    <Card className="flex flex-col p-6 gap-6 h-[600px]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-3xl">{totalClicks}</h3>
          <p className="text-xs font-medium uppercase text-foreground/40">
            Total API Clicks
          </p>
        </div>
        <IntervalDropdown />
      </div>
      <AnalyticsChart chartData={chartData} interval="7d" unit="credit" />
    </Card>
  );
}
