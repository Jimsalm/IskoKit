"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileImageIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  MenuIcon,
} from "lucide-react"

import { appToolGroups } from "@/features/app-shell/tools"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppMobileMenu() {
  const pathname = usePathname()
  const isDashboardActive = isRouteActive(pathname, "/dashboard")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation"
        >
          <MenuIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
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

        {appToolGroups
          .filter((group) => group.label !== "Tools")
          .map((group) => (
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

        <DropdownMenuGroup>
          <DropdownMenuLabel>Tools</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link
              href="/pdf-tools"
              aria-current={
                isRouteActive(pathname, "/pdf-tools") ? "page" : undefined
              }
              className={cn(
                isRouteActive(pathname, "/pdf-tools") &&
                  "bg-accent text-accent-foreground",
              )}
            >
              <FileTextIcon />
              PDF Tools
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <FileImageIcon />
            Image Tools
            <span className="ml-auto text-xs">Coming soon</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
