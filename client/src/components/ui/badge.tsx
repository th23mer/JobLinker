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
        destructive:
          "border-red-200 bg-red-50 text-red-700",
        outline:
          "text-foreground border-border",
        success:
          "border-emerald-200/60 bg-emerald-50 text-emerald-700",
        warning:
          "border-amber-200/60 bg-amber-50 text-amber-700",
        info:
          "border-blue-200/60 bg-blue-50 text-blue-700",
        purple:
          "border-purple-200/60 bg-purple-50 text-purple-700",
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
