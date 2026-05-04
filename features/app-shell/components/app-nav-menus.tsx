"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDownIcon,
  LayoutDashboardIcon,
} from "lucide-react"

import { appToolGroups } from "@/features/app-shell/tools"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppNavMenus() {
  const pathname = usePathname()
  const isDashboardActive = isRouteActive(pathname, "/dashboard")

  return (
    <>
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="rounded-full">
              Menu
              <ChevronDownIcon data-icon="inline-end" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel>App</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard"
                  aria-current={isDashboardActive ? "page" : undefined}
                  className={cn(
                    isDashboardActive && "bg-accent text-accent-foreground",
                  )}
                >
                  <LayoutDashboardIcon />
                  Dashboard
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {appToolGroups.map((group) => (
              <DropdownMenuGroup key={group.label}>
                <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                {group.items.map((item) => {
                  const ItemIcon = item.icon
                  const isActive = isRouteActive(pathname, item.href)

                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          isActive && "bg-accent text-accent-foreground",
                        )}
                      >
                        <ItemIcon />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuGroup>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav
        className="hidden items-center gap-1 md:flex"
        aria-label="Main navigation"
      >
        <Button
          asChild
          variant={isDashboardActive ? "secondary" : "ghost"}
          size="sm"
          className="rounded-full"
        >
          <Link
            href="/dashboard"
            aria-current={isDashboardActive ? "page" : undefined}
          >
            <LayoutDashboardIcon data-icon="inline-start" />
            Dashboard
          </Link>
        </Button>

        {appToolGroups.map((group) => {
          const isGroupActive = group.items.some((item) =>
            isRouteActive(pathname, item.href),
          )

          return (
            <DropdownMenu key={group.label}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isGroupActive ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-full"
                >
                  {group.label}
                  <ChevronDownIcon data-icon="inline-end" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                  {group.items.map((item) => {
                    const ItemIcon = item.icon
                    const isActive = isRouteActive(pathname, item.href)

                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link
                          href={item.href}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            isActive && "bg-accent text-accent-foreground",
                          )}
                        >
                          <ItemIcon />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        })}
      </nav>
    </>
  )
}
