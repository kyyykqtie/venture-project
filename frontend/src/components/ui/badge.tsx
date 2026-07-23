import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        success:
          "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-100 dark:border-emerald-800 [a]:hover:bg-emerald-100/90",
        warning:
          "bg-amber-100 text-amber-950 border-amber-200 dark:bg-amber-950/70 dark:text-amber-100 dark:border-amber-800 [a]:hover:bg-amber-100/90",
        info:
          "bg-sky-100 text-sky-950 border-sky-200 dark:bg-sky-950/70 dark:text-sky-100 dark:border-sky-800 [a]:hover:bg-sky-100/90",
        muted:
          "bg-muted text-muted-foreground border-border [a]:hover:bg-muted/90",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",


        // ROLES OF THE SYSTEM

        // ADMIN ROLES
        superadmin:
          "bg-rose-100 text-rose-950 border-rose-200 dark:bg-rose-950/70 dark:text-rose-100 dark:border-rose-800 [a]:hover:bg-rose-100/90",
        admin:
          "bg-indigo-100 text-indigo-950 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-100 dark:border-indigo-800 [a]:hover:bg-indigo-100/90",
        manager:
          "bg-slate-100 text-slate-950 border-slate-200 dark:bg-slate-950/70 dark:text-slate-100 dark:border-slate-800 [a]:hover:bg-slate-100/90",
        staff:
          "bg-zinc-100 text-zinc-950 border-zinc-200 dark:bg-zinc-950/70 dark:text-zinc-100 dark:border-zinc-800 [a]:hover:bg-zinc-100/90",

        // EMPLOYEE ROLES

        HR:
          "bg-pink-100 text-pink-900 border-pink-200 dark:bg-pink-950/60 dark:text-pink-100 dark:border-pink-800 [a]:hover:bg-pink-100/90",

        Finance:
          "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-100 dark:border-emerald-800 [a]:hover:bg-emerald-100/90",

        SalesMarketing:
          "bg-orange-100 text-orange-900 border-orange-200 dark:bg-orange-950/60 dark:text-orange-100 dark:border-orange-800 [a]:hover:bg-orange-100/90",

        Operations:
          "bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950/60 dark:text-blue-100 dark:border-blue-800 [a]:hover:bg-blue-100/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
