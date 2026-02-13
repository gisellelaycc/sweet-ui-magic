import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-visible rounded-full bg-foreground/[0.06]">
      <SliderPrimitive.Range
        className="absolute h-full rounded-full"
        style={{
          background: 'rgba(40, 180, 160, 0.25)',
          boxShadow: '0 0 12px rgba(40, 180, 160, 0.3), 0 0 24px rgba(40, 180, 160, 0.12)',
        }}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className="block h-4 w-4 rounded-full border border-foreground/20 bg-foreground/80 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      style={{
        boxShadow: '0 0 10px rgba(40, 180, 160, 0.4), 0 0 20px rgba(40, 180, 160, 0.15)',
      }}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
