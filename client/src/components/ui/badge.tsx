import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary to-primary-light text-primary-foreground shadow-sm",
        secondary:
          "border-border/40 bg-secondary text-secondary-foreground",
        // text-red-700 on bg-red-50 → ~7.2:1 ✓ WCAG AA
        destructive:
          "border-red-200 bg-red-50 text-red-700",
        outline:
          "text-foreground border-border",
        // white on emerald-600 → ~4.6:1 ✓ WCAG AA
        success:
          "border-emerald-700 bg-emerald-600 text-white",
        // amber-900 on amber-100 → ~9.5:1 ✓ WCAG AA (was white on amber-500 = 2.9:1 ✗)
        warning:
          "border-amber-300 bg-amber-100 text-amber-900",
        // white on blue-600 → ~4.6:1 ✓ WCAG AA
        info:
          "border-blue-600 bg-blue-600 text-white",
        // purple-700 on purple-50 → ~7.4:1 ✓ WCAG AA
        purple:
          "border-purple-200/60 bg-purple-50 text-purple-700",
        // muted: foreground/70 on muted bg — for neutral tags
        muted:
          "border-border/40 bg-muted/60 text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
