import { LogOutIcon } from "lucide-react"

import { logoutAction } from "@/features/auth/actions"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="outline">
        <LogOutIcon data-icon="inline-start" />
        Sign out
      </Button>
    </form>
  )
}
