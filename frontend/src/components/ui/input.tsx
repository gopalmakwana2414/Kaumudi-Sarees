import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-gray-200 bg-transparent px-3.5 py-2 text-base transition-all duration-200 ease-out outline-none placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:ring-4 aria-invalid:ring-red-500/10 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
