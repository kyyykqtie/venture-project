import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const AlertDialog = Dialog
const AlertDialogTrigger = DialogTrigger

function AlertDialogContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogContent>) {
  return <DialogContent className={cn("sm:max-w-md", className)} {...props} />
}

function AlertDialogHeader({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <DialogHeader className={cn("space-y-2", className)} {...props} />
}

function AlertDialogFooter({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <DialogFooter className={cn("sm:justify-end", className)} {...props} />
}

function AlertDialogTitle(props: React.ComponentPropsWithoutRef<typeof DialogTitle>) {
  return <DialogTitle {...props} />
}

function AlertDialogDescription(props: React.ComponentPropsWithoutRef<typeof DialogDescription>) {
  return <DialogDescription {...props} />
}

const AlertDialogAction = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Button>>(
  ({ className, ...props }, ref) => <Button ref={ref} className={className} {...props} />,
)
AlertDialogAction.displayName = "AlertDialogAction"

const AlertDialogCancel = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Button>>(
  ({ className, variant = "outline", ...props }, ref) => <Button ref={ref} variant={variant} className={className} {...props} />,
)
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
}
