import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        // Track
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-black/5 dark:border-white/10 outline-none transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "aria-invalid:border-red-500",
        
        // Premium Sizes & Shadows
        "data-[size=default]:w-12 data-[size=default]:h-7",
        "data-[size=sm]:w-9 data-[size=sm]:h-5",
        
        // Deep inset shadows for the paper-cut neomorphic feel
        "shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),inset_0_-2px_4px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),inset_0_-1px_2px_rgba(255,255,255,0.05)]",
        
        // States
        "data-checked:bg-emerald-500 data-unchecked:bg-slate-200 dark:data-unchecked:bg-slate-800",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Thumb Shape & Basic Style
          "pointer-events-none block rounded-full bg-white dark:bg-slate-50 ring-0",
          "border border-black/5 dark:border-white/10",
          
          // Premium Elastic Animation
          "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          
          // Drop shadows to make it pop like a 3D physical object
          "shadow-[0_2px_4px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1)]",
          
          // Sizes & Transforms
          // Default: Track is 48px, Thumb is 24px, Margin is 2px. Translate = 48-24-4 = 20px (translate-x-5)
          "group-data-[size=default]/switch:size-6 group-data-[size=default]/switch:m-0.5",
          "group-data-[size=default]/switch:data-checked:translate-x-5 group-data-[size=default]/switch:data-unchecked:translate-x-0",
          
          // Small: Track is 36px, Thumb is 16px, Margin is 2px. Translate = 36-16-4 = 16px (translate-x-4)
          "group-data-[size=sm]/switch:size-4 group-data-[size=sm]/switch:m-0.5",
          "group-data-[size=sm]/switch:data-checked:translate-x-4 group-data-[size=sm]/switch:data-unchecked:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
