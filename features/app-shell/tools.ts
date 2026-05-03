import type { LucideIcon } from "lucide-react"
import {
  BrainIcon,
  CalculatorIcon,
  CalendarCheckIcon,
  FileTextIcon,
  NotebookTabsIcon,
  SparklesIcon,
  TimerIcon,
} from "lucide-react"

export type AppTool = {
  href: string
  label: string
  description: string
  icon: LucideIcon
}

export const appToolGroups = [
  {
    label: "Study",
    items: [
      {
        href: "/notes",
        label: "Notes",
        description: "Organize study notes by subject, file, and task.",
        icon: NotebookTabsIcon,
      },
      {
        href: "/ai-summarizer",
        label: "AI Summarizer",
        description: "Turn long readings and PDFs into focused study notes.",
        icon: SparklesIcon,
      },
      {
        href: "/flashcards",
        label: "AI Flashcards",
        description: "Generate flashcards from readings and notes.",
        icon: BrainIcon,
      },
    ],
  },
  {
    label: "Planning",
    items: [
      {
        href: "/assignment-planner",
        label: "Assignment Planner",
        description: "Track assignments, deadlines, and study blocks.",
        icon: CalendarCheckIcon,
      },
      {
        href: "/gpa-calculator",
        label: "GPA Calculator",
        description: "Calculate grades, GPA, and course targets.",
        icon: CalculatorIcon,
      },
      {
        href: "/pomodoro",
        label: "Pomodoro Timer",
        description: "Run focus sessions and break timers.",
        icon: TimerIcon,
      },
    ],
  },
  {
    label: "Tools",
    items: [
      {
        href: "/pdf-tools",
        label: "PDF Tools",
        description: "Store, organize, and prepare PDFs for studying.",
        icon: FileTextIcon,
      },
    ],
  },
] satisfies Array<{
  label: string
  items: AppTool[]
}>

export const appTools = appToolGroups.flatMap((group) => group.items)

export function getAppTool(href: string) {
  const tool = appTools.find((item) => item.href === href)

  if (!tool) {
    throw new Error(`Unknown app tool: ${href}`)
  }

  return tool
}
