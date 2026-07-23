import type { ComponentProps } from "react"

import { Badge } from "@/components/ui/badge"

const departmentVariantMap = {
  HR: "HR",
  Finance: "Finance",
  SalesMarketing: "Sales & Marketing",
  Operations: "Operations",
} as const

export type DepartmentName = keyof typeof departmentVariantMap

export function DepartmentBadge({
  department,
  className,
  ...props
}: Omit<ComponentProps<typeof Badge>, "variant"> & { department: DepartmentName }) {
  return (
    <Badge variant={departmentVariantMap[department]} className={className} {...props}>
      {department}
    </Badge>
  )
}
