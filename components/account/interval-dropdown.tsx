"use client";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { INTERVALS_DISPLAY_VALUES } from "@/lib/interval";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function IntervalDropdown() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedInterval = useMemo(() => {
    return (
      INTERVALS_DISPLAY_VALUES.find(
        (s) => s.value === searchParams.get("interval")
      ) ?? INTERVALS_DISPLAY_VALUES[1]
    );
  }, [searchParams]);

  const changeInterval = (key: string) => {
    const params = new URLSearchParams(searchParams);
    if (key !== "7d") {
      params.set("interval", key);
    } else {
      params.delete("interval");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="xs:w-48 border" variant="ghost" size={"sm"}>
          {selectedInterval.displayValue}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-content p-2" align="start">
        <DropdownMenuRadioGroup
          value={selectedInterval.value}
          onValueChange={changeInterval}
        >
          {INTERVALS_DISPLAY_VALUES.map(({ value, displayValue }) => (
            <DropdownMenuRadioItem
              key={value}
              value={value}
              className="flex gap-2"
            >
              <span>{displayValue}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
