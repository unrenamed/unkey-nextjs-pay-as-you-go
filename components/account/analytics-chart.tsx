"use client";

import BarChart from "@/components/bar-chart";
import { Interval } from "@/lib/interval";
import ParentSize from "@visx/responsive/lib/components/ParentSize";

export function AnalyticsChart({
  chartData,
  interval,
  unit,
}: {
  chartData: {
    date: string;
    value: number;
  }[];
  interval: Interval;
  unit: string;
}) {
  return (
    <ParentSize>
      {({ width, height }) => (
        <BarChart
          unit={unit}
          width={width}
          height={height}
          interval={interval}
          data={(chartData ?? []).map((d) => ({
            date: new Date(d.date),
            value: d.value,
          }))}
        />
      )}
    </ParentSize>
  );
}
