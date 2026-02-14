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
    <SliderPrimitive.Track className="relative h-[1.5px] w-full grow overflow-visible rounded-full bg-foreground/25">
      {/* No visible Range — axis is always complete */}
      <SliderPrimitive.Range className="absolute h-full rounded-full bg-transparent" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className="block h-3.5 w-3.5 rounded-full border border-white/20 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50"
      style={{
        background: 'radial-gradient(circle, rgba(173, 255, 255, 0.7) 0%, rgba(10, 255, 255, 0.4) 40%, transparent 70%)',
        boxShadow: '0 0 8px rgba(10, 255, 255, 0.4), 0 0 18px rgba(173, 255, 255, 0.2), 0 0 30px rgba(10, 255, 255, 0.08)',
      }}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
