"use client"

import { ensureUserExists } from "@/features/users/actions"
import { Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function OnboardingClient({ userId }: { userId: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function createUser() {
      try {
        await ensureUserExists(userId)
        if (mounted) {
          router.replace("/app")
        }
      } catch (err) {
        console.error("[OnboardingClient] Failed to create user:", err)
        if (mounted) {
          setError("Failed to create your account. Please try signing in again.")
        }
      }
    }

    createUser()

    return () => {
      mounted = false
    }
  }, [userId, router])

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return <Loader2Icon className="animate-spin size-24" />
}