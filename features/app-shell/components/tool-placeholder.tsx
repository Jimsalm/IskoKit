import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { AppTool } from "@/features/app-shell/tools"
import { requireAuth } from "@/features/auth/server"

export async function ToolPlaceholder({ tool }: { tool: AppTool }) {
  await requireAuth()

  const ToolIcon = tool.icon

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          IskoKit tool
        </p>
        <h1 className="text-2xl font-semibold">{tool.label}</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {tool.description}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <ToolIcon />
          </div>
          <CardTitle>{tool.label} is ready for its feature build.</CardTitle>
          <CardDescription>
            This page is wired into the logged-in app shell, so we can build the
            feature here without changing the navigation later.
          </CardDescription>
        </CardHeader>
      </Card>
    </section>
  )
}
