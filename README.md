# IskoKit

IskoKit is a student workspace for organizing schoolwork, studying more effectively,
and handling common document tasks in one place. It combines study notes, planning
tools, focused review sessions, AI-assisted learning, and browser-side PDF utilities
inside a single Next.js application.

[Open the live app](https://jim-iskokit.vercel.app)

## Features

### Study

- **Notes**: Create, edit, search, filter, pin, tag, and delete notes.
- **AI Summarizer**: Turn pasted text, TXT files, DOCX files, and readable PDFs into
  structured study notes with OpenAI.
- **Flashcards**: Create subject-based decks, add cards manually, generate cards with
  AI, and review due cards using a simple spaced-repetition flow.

### Planning

- **Assignment Planner**: Track deadlines by subject, priority, type, and completion
  status with overdue and upcoming groups.
- **GWA Calculator**: Calculate and save semester weighted averages with subject
  breakdowns.
- **Pomodoro Timer**: Run focus and break timers, preserve active timers while
  navigating, and track completed focus sessions.

### PDF Tools

- Merge PDF files.
- Split PDFs by page ranges.
- Convert JPG and PNG images to PDF.
- Convert PDF pages to PNG images.
- Apply basic browser-side PDF compression.
- Add text overlays to PDFs.
- Highlight and annotate PDFs.
- Draw or upload a signature and place it on a PDF.
- Open external iLovePDF tools for Word-to-PDF and PDF-to-Word conversion.

PDF processing stays in the browser where practical. IskoKit stores recent activity
metadata, not uploaded or generated document files.

## Tech Stack

- [Next.js](https://nextjs.org/) App Router
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/) Auth and Postgres
- [TanStack Query](https://tanstack.com/query/latest)
- [OpenAI API](https://platform.openai.com/docs/)
- [pdf-lib](https://pdf-lib.js.org/) and [PDF.js](https://mozilla.github.io/pdf.js/)
- [Motion for React](https://motion.dev/docs/react)
- [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- A Supabase project
- An OpenAI API key for AI Summarizer and AI Flashcards

### Installation

```bash
git clone https://github.com/Jimsalm/IskoKit.git
cd IskoKit
npm install
```

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

OPENAI_API_KEY=
OPENAI_SUMMARY_MODEL=
OPENAI_FLASHCARD_MODEL=
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase Setup

Run the SQL files in `supabase/migrations` in filename order. They create the
application tables, validation constraints, indexes, Row Level Security policies,
and helper functions used by the features.

For local authentication, configure these values in Supabase:

```text
Site URL: http://localhost:3000
Redirect URL: http://localhost:3000/auth/confirm
```

Add the deployed URL and its `/auth/confirm` callback when configuring production.

## Available Scripts

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run start    # Run the production build
npm run lint     # Run ESLint
npx tsc --noEmit # Run TypeScript checks
```

## Project Structure

```text
app/                 Next.js routes, layouts, and server endpoints
components/ui/       Shared shadcn/ui components
features/            Feature-based UI, hooks, schemas, and data access
lib/                 Shared helpers and Supabase clients
supabase/migrations/ Database schema and Row Level Security policies
```

## Data And Privacy

- Supabase Row Level Security keeps each user's records private.
- OpenAI API keys stay server-side and are never exposed to the browser.
- AI requests send only the source material needed to generate the requested result.
- PDF tool outputs are processed locally and downloaded directly by the user.
- File activity history contains metadata only.

## Current Limitations

- AI features require an OpenAI API key and available API quota.
- Scanned or image-only PDFs are not supported by the AI Summarizer.
- Browser-side PDF compression is basic optimization, not advanced compression.
- PDF editing and annotation focus on lightweight overlays rather than full document
  editing.
- Word-to-PDF and PDF-to-Word open external iLovePDF tools for better conversion
  quality.

## License

This project is available under the [MIT License](LICENSE.md).

## Author

Developed by [Jimiel Salmon](https://jimielsalmon.is-a.dev/).
