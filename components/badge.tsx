import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

const tagColors: Record<string, string> = {
  python: 'bg-yellow-200 text-yellow-800',
  javascript: 'bg-blue-200 text-blue-800',
  tuple: 'bg-green-200 text-green-800',
  palindrome: 'bg-pink-200 text-pink-800',
  divisibility: 'bg-purple-200 text-purple-800',
  printing: 'bg-orange-200 text-orange-800',
  default: 'bg-gray-100 text-gray-700',
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  tagType?: string
}

function Badge({ className, variant, tagType, ...props }: BadgeProps) {
  const colorClass = tagType ? tagColors[tagType.toLowerCase()] || tagColors.default : tagColors.default
  return <div className={cn(badgeVariants({ variant }), colorClass, className)} {...props} />
}

export { Badge, badgeVariants } from "./ui/badge"

