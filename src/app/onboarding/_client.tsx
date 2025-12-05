"use client"

import { getUser } from "@/features/users/actions"
import { Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function OnboardingClient({ userId }: { userId: string }) {
  const router = useRouter()

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const user = await getUser(userId)
      if (user == null) return

      router.replace("/app")
      clearInterval(intervalId)
    }, 250)

    return () => {
      clearInterval(intervalId)
    }
  }, [userId, router]) //will query db to check if user exists, cache untill the user is updated so it will prevent it from being called too often

  return <Loader2Icon className="animate-spin size-24" />
}