import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const PLAN_LIMIT_MESSAGE = "PLAN_LIMIT";
export const RATE_LIMIT_MESSAGE = "RATE_LIMIT";

export function errorToast(message: string) {
  if (message === PLAN_LIMIT_MESSAGE) {
    const toastId = toast.error("You have reached your plan's limit.", {
      action: (
        <Button size="sm" asChild onClick={() => toast.dismiss(toastId)}>
          <Link href="/app/upgrade">Upgrade</Link>
        </Button>
      ),
    })
    return
  }

  if (message === RATE_LIMIT_MESSAGE) {
    toast.error("Woah! Slow down there!", {
      description: "You've made too many requests. Please try again later.",
    })
    return
  }

  toast.error(message) // generic error
}