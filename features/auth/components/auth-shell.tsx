import {
  BrainIcon,
  CalendarCheckIcon,
  FileTextIcon,
  NotebookTabsIcon,
  TimerIcon,
} from "lucide-react"

import { IskoKitLogo } from "@/components/iskokit-logo"
import {
  AppMotionProvider,
  MotionSurface,
} from "@/features/app-shell/components/app-motion"

const workspaceTools = [
  {
    title: "Notes and reviewers",
    description: "Keep class notes organized and turn readings into study material.",
    icon: NotebookTabsIcon,
  },
  {
    title: "Assignment planning",
    description: "Track deadlines and keep school tasks visible.",
    icon: CalendarCheckIcon,
  },
  {
    title: "PDF tools",
    description: "Handle common document tasks without leaving your workspace.",
    icon: FileTextIcon,
  },
  {
    title: "Focus and flashcards",
    description: "Build review sessions and make time for focused study.",
    icon: BrainIcon,
  },
]

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="dark flex min-h-dvh items-center justify-center bg-background px-5 py-8 text-foreground sm:px-8">
      <AppMotionProvider>
        <MotionSurface className="grid w-full max-w-4xl overflow-hidden rounded-lg border border-border bg-card lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
        <section className="hidden border-r border-border lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3 border-b border-border px-8 py-5">
            <IskoKitLogo />
            <div className="flex flex-col leading-tight">
              <span className="text-base font-semibold">IskoKit</span>
              <span className="text-xs text-muted-foreground">
                Student workspace
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-7 px-8 py-8">
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-semibold">Study tools in one place</h2>
              <p className="max-w-md text-sm leading-6 text-muted-foreground">
                Keep your notes, deadlines, documents, and review sessions
                together in a workspace built for everyday school work.
              </p>
            </div>

            <div className="border-y border-border">
              {workspaceTools.map(({ description, icon: Icon, title }) => (
                <div
                  key={title}
                  className="grid grid-cols-[20px_1fr] gap-3 border-b border-border py-3 last:border-b-0"
                >
                  <Icon className="mt-0.5 size-4 text-primary" />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs leading-5 text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-border px-8 py-4 text-xs text-muted-foreground">
            <TimerIcon className="size-4" />
            Built for focused study sessions.
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-8 sm:px-8 lg:px-10">
          <div className="w-full max-w-sm">{children}</div>
        </section>
        </MotionSurface>
      </AppMotionProvider>
    </main>
  )
}
