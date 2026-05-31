"use client"

import type { ComponentProps, ReactNode } from "react"
import { usePathname } from "next/navigation"
import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  MotionConfig,
  type HTMLMotionProps,
} from "motion/react"

export const appMotionEase = [0.22, 1, 0.36, 1] as const

export const appMotionTransition = {
  duration: 0.16,
  ease: appMotionEase,
}

export const appLayoutTransition = {
  duration: 0.2,
  ease: appMotionEase,
}

type MotionDivProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: ReactNode
}

export function AppMotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user" transition={appMotionTransition}>
        {children}
      </MotionConfig>
    </LazyMotion>
  )
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={appMotionTransition}
      >
        {children}
      </m.div>
    </AnimatePresence>
  )
}

export function MotionPresence({
  children,
  initial = false,
  mode = "popLayout",
}: {
  children: ReactNode
  initial?: boolean
  mode?: ComponentProps<typeof AnimatePresence>["mode"]
}) {
  return (
    <AnimatePresence initial={initial} mode={mode}>
      {children}
    </AnimatePresence>
  )
}

export function MotionList({
  children,
  transition = appLayoutTransition,
  ...props
}: MotionDivProps) {
  return (
    <m.div layout transition={transition} {...props}>
      <AnimatePresence initial={false} mode="popLayout">
        {children}
      </AnimatePresence>
    </m.div>
  )
}

export function MotionListItem({
  children,
  transition = appLayoutTransition,
  ...props
}: MotionDivProps) {
  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -2 }}
      transition={transition}
      {...props}
    >
      {children}
    </m.div>
  )
}

export function MotionSurface({
  children,
  transition = appMotionTransition,
  ...props
}: MotionDivProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={transition}
      {...props}
    >
      {children}
    </m.div>
  )
}
