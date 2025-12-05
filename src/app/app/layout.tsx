import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { redirect } from "next/navigation"
import { ReactNode } from "react"
import { Navbar } from "./_Navbar"

export default async function AppLayout({ children }: { children: ReactNode }) {
    const { userId, user } = await getCurrentUser({ allData: true }) // userId comes from clerk, user form drizzle db

    if (userId == null) return redirect("/")
    if (user == null) return redirect("/onboarding") // only if user is found in clerk and db we'll see this page
    
    return (
        <>
          <Navbar user={user} />
          {children}
        </>
    )
}