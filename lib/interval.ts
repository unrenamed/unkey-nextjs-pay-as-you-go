export type Interval = (typeof INTERVALS)[number];

export const INTERVALS = ["24h", "7d", "30d"] as const;

export const INTERVALS_DISPLAY_VALUES = [
  {
    value: "24h",
    displayValue: "Last 24 hours",
  },
  {
    value: "7d",
    displayValue: "Last 7 days",
  },
  {
    value: "30d",
    displayValue: "Last 30 days",
  },
];

export const INTERVAL_START_DATE = {
  "24h": new Date(Date.now() - 24 * 60 * 60 * 1000).getTime(),
  "7d": new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime(),
  "30d": new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime(),
};
