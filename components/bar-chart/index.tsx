"use client";

import { GridRows } from "@visx/grid";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { scaleBand, scaleLinear } from "@visx/scale";
import { useCallback, useMemo } from "react";
import { max } from "@visx/vendor/d3-array";
import { Interval } from "@/lib/interval";
import { motion } from "framer-motion";
import { pluralizeJSX } from "@/lib/utils";
import { Group } from "@visx/group";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { NoChartData } from "./no-data";
import { useTheme } from "next-themes";
import colors from "tailwindcss/colors";
import { useMediaQuery } from "@/hooks";
import { CircleIcon } from "lucide-react";

type BarData = { date: Date; value: number };

type TooltipData = {
  value: number;
  start: Date;
};

type Props = {
  data: BarData[];
  unit: string;
  width: number;
  height: number;
  interval?: Interval;
  margin?: { top: number; right: number; bottom: number; left: number };
};

// accessors
const getDate = (d: BarData) => d.date;
const getValue = (d: BarData) => d.value;

// constants
const LEFT_AXIS_MIN_NUM_OF_TICKS = 5;

// utils
const getMaxValueForLeftAxisDomainRange = (data: BarData[]) => {
  const maxV = max(data, getValue) ?? 0;

  // Ensure a constant number of ticks is always displayed when all data values are below a certain threshold.
  // For instance, this will display 5 ticks on the left axis, even if all data values are zero.
  if (maxV < LEFT_AXIS_MIN_NUM_OF_TICKS) {
    return LEFT_AXIS_MIN_NUM_OF_TICKS;
  }

  // Make sure the highest tick value is consistently rounded up to the next multiple of a fixed constant.
  // E.g. if the maximum value is 15, the top tick will be 15; if the maximum value is 17, the top tick will be 20.
  // This ensures that all bars are fully accommodated within the chart in terms of height.
  return (
    Math.ceil(maxV / LEFT_AXIS_MIN_NUM_OF_TICKS) * LEFT_AXIS_MIN_NUM_OF_TICKS
  );
};

// defaults
const defaultMargin = { top: 40, right: 30, bottom: 50, left: 40 };

// styles
const tooltipStyles = {
  ...defaultStyles,
  padding: "12px",
  minWidth: 140,
  maxWidth: 360,
  borderRadius: "4px",
  boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 5px",
  opacity: 0.95,
};

// variables
let tooltipTimeout: number;

export default function BarChart({
  data,
  interval,
  unit,
  height,
  width,
  margin = defaultMargin,
}: Props) {
  const isMobile = useMediaQuery("only screen and (max-width : 640px)");
  const { resolvedTheme } = useTheme();

  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useTooltip<TooltipData>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    // TooltipInPortal is rendered in a separate child of <body /> and positioned
    // with page coordinates which should be updated on scroll. consider using
    // Tooltip or TooltipWithBounds if you don't need to render inside a Portal
    scroll: true,
    debounce: 100,
  });

  // bounds
  const xMax = Math.max(width - margin.left - margin.right, 0);
  const yMax = Math.max(height - margin.top - margin.bottom, 0);

  // colors
  const axisStrokeColor =
    resolvedTheme === "dark" ? colors.neutral[400] : colors.gray[600];
  const axisFillColor =
    resolvedTheme === "dark" ? colors.neutral[300] : colors.gray[600];
  const gridFillColor =
    resolvedTheme === "dark" ? colors.neutral[600] : colors.gray[300];
  const rectBgColor =
    resolvedTheme === "dark" ? colors.neutral[900] : colors.gray[100];
  const tooltipBgColor =
    resolvedTheme === "dark" ? colors.neutral[800] : colors.gray[50];

  const formatDate = useCallback(
    (e: Date) => {
      return e.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    [interval]
  );

  const dateScale = useMemo(
    () =>
      scaleBand<Date>({
        domain: data.map(getDate),
        padding: 0.4,
      }),
    [data]
  );
  const valueScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, getMaxValueForLeftAxisDomainRange(data)],
        nice: true,
      }),
    [data]
  );

  dateScale.rangeRound([0, xMax]);
  valueScale.range([yMax, 0]);

  if (data.length === 0) {
    return <NoChartData />;
  }

  if (width < 200) {
    return null;
  }

  return (
    <div>
      <svg ref={containerRef} width={width} height={height}>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={rectBgColor}
          rx={5}
        />
        <Group left={margin.left} top={margin.top}>
          <GridRows
            numTicks={4}
            scale={valueScale}
            width={xMax}
            height={yMax}
            strokeDasharray={"5,5"}
            stroke={gridFillColor}
          />
          <AxisBottom
            numTicks={4}
            top={yMax}
            scale={dateScale}
            hideAxisLine
            tickFormat={formatDate}
            stroke={axisStrokeColor}
            tickStroke={axisStrokeColor}
            tickLabelProps={{
              fill: axisFillColor,
              fontSize: isMobile ? 9 : 12,
              textAnchor: "middle",
              angle: isMobile ? -45 : 0,
              verticalAnchor: isMobile ? "start" : "end",
            }}
          />
          <AxisLeft
            numTicks={4}
            hideAxisLine
            hideTicks
            stroke={axisStrokeColor}
            tickStroke={axisStrokeColor}
            scale={valueScale}
            tickLabelProps={{
              fill: axisFillColor,
              fontSize: isMobile ? 9 : 12,
            }}
          />
          {data.map(({ date, value }, idx) => {
            const barWidth = dateScale.bandwidth();
            const barHeight = yMax - (valueScale(value) ?? 0);
            const barX = dateScale(date) ?? 0;
            const barY = yMax - barHeight;

            return (
              <motion.rect
                key={`bar-${value}-${date.toISOString()}`}
                transition={{ ease: "easeOut", duration: 0.7 }}
                className="!origin-bottom fill-blue-600 dark:fill-blue-500"
                initial={{ transform: "scaleY(0)" }}
                animate={{ transform: "scaleY(1)" }}
                x={barX}
                y={barY}
                rx={2}
                width={barWidth}
                height={barHeight}
                onMouseLeave={() => {
                  tooltipTimeout = window.setTimeout(() => {
                    hideTooltip();
                  }, 300);
                }}
                onMouseMove={(event) => {
                  if (tooltipTimeout) clearTimeout(tooltipTimeout);
                  // TooltipInPortal expects coordinates to be relative to containerRef
                  // localPoint returns coordinates relative to the nearest SVG, which
                  // is what containerRef is set to.
                  const eventSvgCoords = localPoint(event);

                  // center horizontally the tooltip by its bar
                  const left = barX + barWidth / 2 - 40;
                  // raise the tooltip above the mouse cursor
                  const top = eventSvgCoords ? eventSvgCoords.y : undefined;

                  showTooltip({
                    tooltipData: {
                      value,
                      start: date,
                    },
                    tooltipTop: top,
                    tooltipLeft: left,
                  });
                }}
              />
            );
          })}
        </Group>
      </svg>
      {tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={{ ...tooltipStyles, backgroundColor: tooltipBgColor }}
        >
          <div className="flex flex-col gap-2">
            <p className="text-xs text-primary/45">
              {formatDate(tooltipData.start)}
            </p>
            {pluralizeJSX(
              (count, noun) => (
                <div className="flex justify-between items-center text-primary/90 text-xs">
                  <div className="flex items-center gap-1">
                    <CircleIcon
                      size={8}
                      className="fill-blue-600 stroke-blue-600 dark:fill-blue-500 dark:stroke-blue-500"
                    />
                    {noun}
                  </div>
                  <span>{count}</span>
                </div>
              ),
              tooltipData.value,
              unit
            )}
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}
