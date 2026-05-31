import Image from "next/image"

import { cn } from "@/lib/utils"

export function IskoKitLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/iskokit-logo.png"
      alt=""
      width={1254}
      height={1254}
      className={cn("size-9 shrink-0 rounded-md object-cover", className)}
    />
  )
}
