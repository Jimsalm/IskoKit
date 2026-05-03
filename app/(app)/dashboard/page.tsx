import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { appTools } from "@/features/app-shell/tools"
import { requireAuth } from "@/features/auth/server"

export default async function DashboardPage() {
  await requireAuth()

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">Dashboard</p>
        <h1 className="text-2xl font-semibold">You are signed in.</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Your IskoKit workspace is ready. The navbar will stay here for the
          logged-in area while we add files, notes, planners, and study tools.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {appTools.map((item) => (
          <Card key={item.href}>
            <CardHeader>
              <CardTitle>{item.label}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}
