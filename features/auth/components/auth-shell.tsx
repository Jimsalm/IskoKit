"use client"

import { useEffect, useState } from "react"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BrainIcon,
  CalculatorIcon,
  CalendarCheckIcon,
  CircleCheckIcon,
  FileTextIcon,
  FolderOpenIcon,
  NotebookTabsIcon,
  SparklesIcon,
  TimerIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"

const showcaseSlides = [
  {
    title: "Keep every school file in reach",
    description:
      "Store class files, clean up PDFs, and keep readings organized before they pile up.",
    problem: "Too many school files",
    solution: "File storage and PDF tools",
    icon: FolderOpenIcon,
  },
  {
    title: "Plan deadlines before they sneak up",
    description:
      "Track assignments, study blocks, and due dates in one planner built for school rhythm.",
    problem: "Hard to track deadlines",
    solution: "Assignment planner",
    icon: CalendarCheckIcon,
  },
  {
    title: "Know where your grades stand",
    description:
      "Calculate GPA and course targets without rebuilding the same spreadsheet every term.",
    problem: "Hard to calculate grades",
    solution: "GPA calculator",
    icon: CalculatorIcon,
  },
  {
    title: "Turn long readings into study notes",
    description:
      "Summarize dense PDFs and readings into focused takeaways you can review faster.",
    problem: "Long readings take too much time",
    solution: "AI summarizer",
    icon: SparklesIcon,
  },
  {
    title: "Study with better focus",
    description:
      "Use timed focus sessions to keep momentum without losing track of breaks.",
    problem: "Poor study focus",
    solution: "Pomodoro timer",
    icon: TimerIcon,
  },
  {
    title: "Put scattered notes in order",
    description:
      "Collect notes by subject, file, and study task so review sessions start faster.",
    problem: "Notes are scattered",
    solution: "Organized note storage",
    icon: NotebookTabsIcon,
  },
  {
    title: "Make flashcards without the busywork",
    description:
      "Generate practice cards from your study material and spend more time reviewing.",
    problem: "Manual flashcards take time",
    solution: "AI flashcard generator",
    icon: BrainIcon,
  },
]

export function AuthShell({ children }: { children: React.ReactNode }) {
  const [activeSlide, setActiveSlide] = useState(0)
  const slide = showcaseSlides[activeSlide]
  const SlideIcon = slide.icon

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % showcaseSlides.length)
    }, 6000)

    return () => window.clearInterval(timer)
  }, [])

  function showPreviousSlide() {
    setActiveSlide(
      (current) =>
        (current - 1 + showcaseSlides.length) % showcaseSlides.length,
    )
  }

  function showNextSlide() {
    setActiveSlide((current) => (current + 1) % showcaseSlides.length)
  }

  return (
    <main className="dark grid min-h-dvh bg-background text-foreground lg:h-dvh lg:overflow-hidden lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
      <section className="relative hidden min-h-dvh overflow-hidden border-r border-border bg-card px-14 py-12 xl:px-20 xl:py-16 lg:flex lg:h-dvh lg:min-h-0">
        <div className="flex w-full flex-col justify-between gap-14">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-lg">
              I
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold">IskoKit</span>
              <span className="text-sm text-muted-foreground">
                Student workspace
              </span>
            </div>
          </div>

          <div className="flex max-w-xl flex-col gap-8">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-background/60 p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-primary" />
                  <span className="size-2 rounded-full bg-accent" />
                  <span className="size-2 rounded-full bg-secondary" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  Study dashboard
                </span>
              </div>

              <div className="grid gap-4 py-5">
                <div className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <FileTextIcon className="text-muted-foreground" />
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">
                        Biology reading
                      </span>
                      <span className="text-xs text-muted-foreground">
                        PDF summarized
                      </span>
                    </div>
                  </div>
                  <CircleCheckIcon className="text-primary" />
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-4 rounded-2xl border border-border bg-card p-4">
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-medium text-muted-foreground">
                      Assignment planner
                    </span>
                    <div className="h-2 rounded-full bg-secondary" />
                    <div className="h-2 w-4/5 rounded-full bg-secondary" />
                    <div className="h-2 w-3/5 rounded-full bg-secondary" />
                  </div>
                  <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                    <SparklesIcon />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <SlideIcon />
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="max-w-md text-4xl leading-tight font-semibold">
                  {slide.title}
                </h2>
                <p className="max-w-md text-base leading-7 text-muted-foreground">
                  {slide.description}
                </p>
                <div className="grid max-w-md gap-2 rounded-2xl border border-border bg-background/60 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-medium text-muted-foreground">
                      Problem
                    </span>
                    <span className="text-sm font-medium text-right">
                      {slide.problem}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-medium text-muted-foreground">
                      IskoKit solution
                    </span>
                    <span className="text-sm font-medium text-primary text-right">
                      {slide.solution}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {showcaseSlides.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  aria-label={`Show ${item.title}`}
                  aria-current={activeSlide === index}
                  className="size-2 rounded-full bg-muted-foreground/40 transition-all aria-current:w-8 aria-current:bg-primary"
                  onClick={() => setActiveSlide(index)}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full"
                aria-label="Show previous slide"
                onClick={showPreviousSlide}
              >
                <ArrowLeftIcon />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full"
                aria-label="Show next slide"
                onClick={showNextSlide}
              >
                <ArrowRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-dvh items-center justify-center overflow-y-auto px-5 py-10 sm:px-8 lg:h-dvh lg:min-h-0 lg:px-12">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  )
}
