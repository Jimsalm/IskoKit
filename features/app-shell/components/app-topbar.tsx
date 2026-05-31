import Link from "next/link"

import { AppMobileMenu } from "@/features/app-shell/components/app-mobile-menu"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { IskoKitLogo } from "@/components/iskokit-logo"

function getInitial(email?: string | null) {
  return email?.trim().charAt(0).toUpperCase() || "I"
}

export function AppTopbar({ userEmail }: { userEmail?: string | null }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6 md:justify-end">
      <div className="flex items-center gap-3 md:hidden">
        <AppMobileMenu />
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
          aria-label="IskoKit app"
        >
          <IskoKitLogo />
          <span className="text-base font-semibold">IskoKit</span>
        </Link>
      </div>

      <div className="flex items-center gap-2 md:ml-auto">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="grid size-8 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
            {getInitial(userEmail)}
          </span>
          <p className="max-w-48 truncate text-sm text-muted-foreground">
            {userEmail ?? "IskoKit user"}
          </p>
        </div>
        <LogoutButton />
      </div>
    </header>
  )
}
