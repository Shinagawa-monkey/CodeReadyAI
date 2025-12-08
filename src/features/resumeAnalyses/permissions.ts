import { db } from "@/drizzle/db"
import { ResumeAnalysisTable } from "@/drizzle/schema"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { hasPermission } from "@/services/clerk/lib/hasPermission"
import { count, eq } from "drizzle-orm"

const RESUME_ANALYSIS_LIMIT = 2

export async function canRunResumeAnalysis() {
  const { userId } = await getCurrentUser()
  if (!userId) return false

  // Check if user has unlimited resume analysis permission
  if (await hasPermission("unlimited_resume_analysis")) return true

  // Check if user has 2 resume analyses permission
  if (!(await hasPermission("2_resume_analyses"))) return false

  // Count how many resume analyses this user has done
  const [{ count: usedCount }] = await db
    .select({ count: count() })
    .from(ResumeAnalysisTable)
    .where(eq(ResumeAnalysisTable.userId, userId))

  // Allow if under limit
  return usedCount < RESUME_ANALYSIS_LIMIT
}

export async function getRemainingResumeAnalyses() {
  const { userId } = await getCurrentUser()
  if (!userId) return 0

  // If unlimited, return a large number
  if (await hasPermission("unlimited_resume_analysis")) return 999

  // If no permission, return 0
  if (!(await hasPermission("2_resume_analyses"))) return 0

  const [{ count: usedCount }] = await db
    .select({ count: count() })
    .from(ResumeAnalysisTable)
    .where(eq(ResumeAnalysisTable.userId, userId))

  return Math.max(0, RESUME_ANALYSIS_LIMIT - usedCount)
}