import Link from "next/link"
import { BellIcon } from "lucide-react"

import { AppMobileMenu } from "@/features/app-shell/components/app-mobile-menu"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

function getInitial(email?: string | null) {
  return email?.trim().charAt(0).toUpperCase() || "I"
}

export function AppTopbar({ userEmail }: { userEmail?: string | null }) {
  return (
    <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6 md:justify-end">
      <div className="flex items-center gap-3 md:hidden">
        <AppMobileMenu />
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
          aria-label="IskoKit app"
        >
          <span className="grid size-9 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            I
          </span>
          <span className="text-base font-semibold">IskoKit</span>
        </Link>
      </div>

      <div className="flex items-center gap-3 md:ml-auto">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          disabled
          aria-label="Notifications"
        >
          <BellIcon />
        </Button>
        <Separator
          orientation="vertical"
          className="hidden h-8 data-vertical:h-8 sm:block"
        />
        <div className="hidden items-center gap-3 rounded-md border bg-muted/30 px-3 py-2 sm:flex">
          <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {getInitial(userEmail)}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="text-sm font-medium">Signed in</p>
            <p className="max-w-44 truncate text-xs text-muted-foreground">
              {userEmail ?? "IskoKit user"}
            </p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </header>
  )
}
