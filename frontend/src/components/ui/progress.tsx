"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "./utils";

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  showLabel?: boolean;
  color?: 'indigo' | 'teal' | 'blue' | 'purple' | string;
}

function Progress({
  className,
  value,
  showLabel,
  color,
  ...props
}: ProgressProps) {
  const colorClasses = {
    indigo: 'bg-indigo-500',
    teal: 'bg-teal-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };

  const indicatorColor = color && color in colorClasses 
    ? colorClasses[color as keyof typeof colorClasses]
    : 'bg-primary';

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn("h-full w-full flex-1 transition-all", indicatorColor)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };