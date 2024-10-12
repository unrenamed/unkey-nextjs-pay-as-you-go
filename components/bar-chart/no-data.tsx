import { BarChart3Icon } from "lucide-react";

export const NoChartData = () => {
  return (
    <div className="w-full h-full flex flex-col gap-4 place-content-center justify-center items-center">
      <BarChart3Icon size={32} strokeWidth={1.5} />
      <p className="flex items-center justify-center flex-wrap text-lg font-light">
        No data available
      </p>
    </div>
  );
};
