import Link from "next/link"
import { BellIcon } from "lucide-react"

import { LogoutButton } from "@/features/auth/components/logout-button"
import { AppNavMenus } from "@/features/app-shell/components/app-nav-menus"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function AppNavbar({ userEmail }: { userEmail?: string | null }) {
  return (
    <header className="sticky top-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-3"
            aria-label="IskoKit app"
          >
            <span className="grid size-9 place-items-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-md">
              I
            </span>
            <span className="text-base font-semibold">IskoKit</span>
          </Link>

          <AppNavMenus />
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden rounded-full sm:inline-flex"
            disabled
            aria-label="Notifications"
          >
            <BellIcon />
          </Button>
          {userEmail ? (
            <>
              <div className="hidden max-w-48 flex-col items-end leading-tight lg:flex">
                <span className="text-xs font-medium text-muted-foreground">
                  Signed in as
                </span>
                <span className="truncate text-sm font-medium">
                  {userEmail}
                </span>
              </div>
              <Separator
                orientation="vertical"
                className="hidden h-5 data-vertical:h-5 sm:block"
              />
            </>
          ) : null}
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
