import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const tagColors: Record<string, string> = {
  python: 'bg-yellow-200 text-yellow-800',
  javascript: 'bg-blue-200 text-blue-800',
  tuple: 'bg-green-200 text-green-800',
  palindrome: 'bg-pink-200 text-pink-800',
  divisibility: 'bg-purple-200 text-purple-800',
  printing: 'bg-orange-200 text-orange-800',
  default: 'bg-gray-100 text-gray-700',
}

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  tagType?: string
}

export function Badge({ className, tagType, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full bg-[#ffb347] text-black font-extrabold px-3 py-1 text-xs shadow-[0_2px_0_#222] border-2 border-black font-comic",
        className,
      )}
      {...props}
    />
  )
}
