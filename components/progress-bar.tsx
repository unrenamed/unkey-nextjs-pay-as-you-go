"use client";

import React from "react";
import * as Progress from "@radix-ui/react-progress";

export const ProgressBar = ({
  initialProgress = 0,
  currentProgress = 0,
}: {
  initialProgress?: number;
  currentProgress: number;
}) => {
  const [progress, setProgress] = React.useState(initialProgress);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(currentProgress), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Progress.Root
      className="relative h-[10px] overflow-hidden rounded-full bg-black/10 dark:bg-white/10"
      style={{
        // Fix overflow clipping in Safari
        // https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0
        transform: "translateZ(0)",
      }}
      value={progress}
    >
      <Progress.Indicator
        className="ease-[cubic-bezier(0.65, 0, 0.35, 1)] size-full bg-blue-600 dark:bg-blue-500 transition-transform duration-700"
        style={{ transform: `translateX(-${100 - progress}%)` }}
      />
    </Progress.Root>
  );
};
