"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  BookOpenIcon,
  CalendarIcon,
  ChevronDownIcon,
  FileImageIcon,
  FileTextIcon,
  HomeIcon,
  InfoIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { appToolGroups } from "@/features/app-shell/tools"
import { cn } from "@/lib/utils"

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function SidebarLink({
  href,
  icon: Icon,
  isActive,
  label,
}: {
  href: string
  icon: LucideIcon
  isActive?: boolean
  label: string
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        isActive &&
          "bg-primary/15 text-primary shadow-sm ring-1 ring-primary/15 hover:bg-primary/15 hover:text-primary",
      )}
    >
      <Icon className="size-4" />
      <span>{label}</span>
    </Link>
  )
}

function ComingSoonItem() {
  return (
    <div className="group relative flex h-10 cursor-not-allowed items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground">
      <FileImageIcon className="size-4" />
      <span>Image Tools</span>
      <span className="pointer-events-none absolute left-full top-1/2 ml-3 hidden -translate-y-1/2 rounded-md border bg-popover px-3 py-2 text-xs font-medium text-popover-foreground shadow-md group-hover:block">
        Coming soon
      </span>
    </div>
  )
}

function SidebarSection({
  children,
  defaultOpen = true,
  icon: Icon,
  label,
}: {
  children: ReactNode
  defaultOpen?: boolean
  icon: LucideIcon
  label: string
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        aria-expanded={isOpen}
        className="flex h-10 items-center justify-between rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="flex items-center gap-3">
          <Icon className="size-4 text-muted-foreground" />
          {label}
        </span>
        <ChevronDownIcon
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            !isOpen && "-rotate-90",
          )}
        />
      </button>
      {isOpen ? <div className="flex flex-col gap-1">{children}</div> : null}
    </div>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const studyGroup = appToolGroups.find((group) => group.label === "Study")
  const planningGroup = appToolGroups.find(
    (group) => group.label === "Planning",
  )
  const pdfToolsActive = isRouteActive(pathname, "/pdf-tools")

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r bg-background/95 md:flex md:flex-col">
      <div className="flex h-20 items-center gap-3 px-5">
        <span className="grid size-10 place-items-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-md">
          <InfoIcon />
        </span>
        <span className="text-lg font-semibold">IskoKit</span>
      </div>

      <nav className="flex flex-1 flex-col gap-7 px-5 py-5" aria-label="App">
        <SidebarLink
          href="/dashboard"
          icon={HomeIcon}
          label="Dashboard"
          isActive={isRouteActive(pathname, "/dashboard")}
        />

        {studyGroup ? (
          <SidebarSection
            icon={BookOpenIcon}
            label="Study"
            defaultOpen={studyGroup.items.some((item) =>
              isRouteActive(pathname, item.href),
            )}
          >
            {studyGroup.items.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={isRouteActive(pathname, item.href)}
              />
            ))}
          </SidebarSection>
        ) : null}

        {planningGroup ? (
          <SidebarSection
            icon={CalendarIcon}
            label="Planning"
            defaultOpen={planningGroup.items.some((item) =>
              isRouteActive(pathname, item.href),
            )}
          >
            {planningGroup.items.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={isRouteActive(pathname, item.href)}
              />
            ))}
          </SidebarSection>
        ) : null}

        <SidebarSection
          icon={ShieldCheckIcon}
          label="Tools"
          defaultOpen={pdfToolsActive}
        >
          <SidebarLink
            href="/pdf-tools"
            icon={FileTextIcon}
            label="PDF Tools"
            isActive={pdfToolsActive}
          />
          <ComingSoonItem />
        </SidebarSection>
      </nav>
    </aside>
  )
}
