import type { CSSProperties } from "react"

type PatternStyle = CSSProperties & Record<`--${string}`, string>

const patternStyle: PatternStyle = {
  "--pattern-surface": "color-mix(in oklch, var(--card) 42%, transparent)",
  "--pattern-surface-muted": "color-mix(in oklch, var(--muted) 32%, transparent)",
  "--pattern-guide": "color-mix(in oklch, var(--border) 78%, transparent)",
  "--pattern-guide-strong": "color-mix(in oklch, var(--border) 96%, transparent)",
  "--pattern-node": "color-mix(in oklch, var(--primary) 58%, transparent)",
  "--pattern-node-soft": "color-mix(in oklch, var(--primary) 28%, transparent)",
  "--pattern-ink": "color-mix(in oklch, var(--foreground) 14%, transparent)",
} satisfies PatternStyle

export function AppBackgroundPattern() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={patternStyle}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--pattern-surface)_0%,transparent_48%),linear-gradient(135deg,transparent_0%,var(--pattern-surface-muted)_48%,transparent_100%)]" />

      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        <defs>
          <pattern
            id="iskokit-dot-field"
            width="72"
            height="72"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="8" cy="8" r="1" fill="var(--pattern-ink)" />
            <circle
              cx="48"
              cy="42"
              r="1.1"
              fill="var(--pattern-guide)"
            />
          </pattern>

          <linearGradient
            id="iskokit-pattern-fade"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor="white" stopOpacity="0.98" />
            <stop offset="50%" stopColor="white" stopOpacity="0.58" />
            <stop offset="100%" stopColor="white" stopOpacity="0.16" />
          </linearGradient>

          <mask id="iskokit-pattern-mask">
            <rect width="100%" height="100%" fill="url(#iskokit-pattern-fade)" />
          </mask>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="url(#iskokit-dot-field)"
          mask="url(#iskokit-pattern-mask)"
        />

        <g
          fill="none"
          stroke="var(--pattern-guide)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.25"
          mask="url(#iskokit-pattern-mask)"
        >
          <path d="M 104 216 C 188 164 276 170 356 226 S 520 296 612 236 S 806 132 922 198" />
          <path d="M 326 468 C 418 400 518 390 628 450 S 834 544 962 472 S 1184 372 1318 452" />
          <path d="M 184 664 C 278 598 382 592 474 648 S 658 744 782 686" />
        </g>

        <g mask="url(#iskokit-pattern-mask)">
          <circle
            cx="104"
            cy="216"
            r="5"
            fill="var(--pattern-node)"
            opacity="0.42"
          />
          <circle
            cx="356"
            cy="226"
            r="7"
            fill="var(--pattern-node)"
            opacity="0.3"
          />
          <circle
            cx="612"
            cy="236"
            r="5"
            fill="var(--pattern-node)"
            opacity="0.36"
          />
          <circle
            cx="922"
            cy="198"
            r="8"
            fill="var(--pattern-node)"
            opacity="0.28"
          />
          <circle
            cx="326"
            cy="468"
            r="6"
            fill="var(--pattern-node)"
            opacity="0.34"
          />
          <circle
            cx="628"
            cy="450"
            r="8"
            fill="var(--pattern-node)"
            opacity="0.26"
          />
          <circle
            cx="962"
            cy="472"
            r="5"
            fill="var(--pattern-node)"
            opacity="0.36"
          />
          <circle
            cx="1318"
            cy="452"
            r="7"
            fill="var(--pattern-node)"
            opacity="0.28"
          />
        </g>

        <g
          fill="none"
          stroke="var(--pattern-node-soft)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          mask="url(#iskokit-pattern-mask)"
        >
          <path d="M 1038 208 L 1136 110 L 1172 146 L 1074 244 L 1024 258 Z" />
          <path d="M 1138 112 L 1174 76 L 1210 112 L 1174 148" />
          <path d="M 1074 244 L 1038 208" />
          <path d="M 1024 258 L 1040 226" />

          <path d="M 1186 626 C 1218 602 1254 602 1288 626 V 724 C 1254 704 1218 704 1186 724 Z" />
          <path d="M 1186 626 C 1152 602 1116 602 1084 626 V 724 C 1116 704 1152 704 1186 724 Z" />
          <path d="M 1186 626 V 724" />
          <path d="M 1124 652 H 1162" />
          <path d="M 1124 676 H 1150" />
          <path d="M 1214 652 H 1264" />
          <path d="M 1214 676 H 1250" />

          <circle cx="250" cy="646" r="48" />
          <path d="M 230 584 H 270" />
          <path d="M 250 584 V 598" />
          <path d="M 250 646 V 616" />
          <path d="M 250 646 L 276 664" />
          <path d="M 214 614 L 202 602" />
          <path d="M 286 614 L 298 602" />
        </g>
      </svg>

      <div className="absolute inset-0 bg-[radial-gradient(var(--pattern-ink)_0.9px,transparent_0.9px)] opacity-40 [background-size:7px_7px]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-background" />
    </div>
  )
}
