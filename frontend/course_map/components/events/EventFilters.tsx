"use client";

import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "academic", label: "Academic" },
  { value: "athletics", label: "Athletics" },
  { value: "social", label: "Social" },
  { value: "workshops", label: "Workshops" },
] as const;

type FilterValue = (typeof FILTER_OPTIONS)[number]["value"];

interface EventFiltersProps {
  active: FilterValue;
  onChange: (value: FilterValue) => void;
}

export function EventFilters({ active, onChange }: EventFiltersProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      role="group"
      aria-label="Filter events by category"
    >
      {FILTER_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          aria-pressed={active === value}
          className={cn(
            "flex items-center gap-1 px-4 py-2 rounded-full text-label-md whitespace-nowrap transition-colors shrink-0 active:scale-95",
            active === value
              ? "bg-secondary text-on-secondary"
              : "bg-surface-container-high text-on-surface-variant hover:bg-outline-variant",
          )}
        >
          {value === "all" && (
            <Filter className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          {label}
        </button>
      ))}
    </div>
  );
}
