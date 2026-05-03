"use client"

import Link from "next/link"
import {
  ChevronDownIcon,
  LayoutDashboardIcon,
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

export function AppNavMenus() {
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
                <Link href="/dashboard">
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

                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>
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
          variant="secondary"
          size="sm"
          className="rounded-full"
        >
          <Link href="/dashboard">
            <LayoutDashboardIcon data-icon="inline-start" />
            Dashboard
          </Link>
        </Button>

        {appToolGroups.map((group) => (
          <DropdownMenu key={group.label}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full">
                {group.label}
                <ChevronDownIcon data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                {group.items.map((item) => {
                  const ItemIcon = item.icon

                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>
                        <ItemIcon />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </nav>
    </>
  )
}
