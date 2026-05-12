export function AppBackgroundPattern() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Base soft glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_30%)]" />

      {/* Main grid pattern */}
      <svg
        className="absolute inset-0 h-full w-full text-border/70 dark:text-white/10"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        <defs>
          <pattern
            id="iskokit-study-grid"
            width="56"
            height="56"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 56 0 L 0 0 0 56"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.45"
            />
            <circle
              cx="10"
              cy="10"
              r="1"
              className="fill-primary"
              opacity="0.18"
            />
          </pattern>

          <linearGradient
            id="iskokit-pattern-fade"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor="white" stopOpacity="0.9" />
            <stop offset="45%" stopColor="white" stopOpacity="0.38" />
            <stop offset="100%" stopColor="white" stopOpacity="0.08" />
          </linearGradient>

          <mask id="iskokit-pattern-mask">
            <rect width="100%" height="100%" fill="url(#iskokit-pattern-fade)" />
          </mask>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="url(#iskokit-study-grid)"
          mask="url(#iskokit-pattern-mask)"
        />

        {/* Decorative study/document outlines */}
        <g
          className="stroke-primary dark:stroke-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          opacity="0.08"
          mask="url(#iskokit-pattern-mask)"
        >
          <path d="M 1120 126 h 82 a 10 10 0 0 1 10 10 v 108 a 10 10 0 0 1 -10 10 h -82 a 10 10 0 0 1 -10 -10 v -108 a 10 10 0 0 1 10 -10 Z" />
          <path d="M 1146 166 h 50" />
          <path d="M 1146 188 h 70" />
          <path d="M 1146 210 h 58" />

          <path d="M 1210 666 h 104 a 12 12 0 0 1 12 12 v 70 a 12 12 0 0 1 -12 12 h -104 a 12 12 0 0 1 -12 -12 v -70 a 12 12 0 0 1 12 -12 Z" />
          <path d="M 1234 704 h 68" />
          <path d="M 1234 734 h 86" />
          <path d="M 1234 764 h 52" />
        </g>
      </svg>

      {/* Subtle noise overlay */}
      <div className="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:4px_4px] text-black dark:text-white" />

      {/* Bottom fade so content stays clean */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-background" />
    </div>
  )
}