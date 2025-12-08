import { db } from "@/drizzle/db"
import { ResumeAnalysisTable } from "@/drizzle/schema"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { count, eq } from "drizzle-orm"

const RESUME_ANALYSIS_LIMIT = 2

export async function canRunResumeAnalysis() {
  const { userId } = await getCurrentUser()
  if (!userId) return false

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

  const [{ count: usedCount }] = await db
    .select({ count: count() })
    .from(ResumeAnalysisTable)
    .where(eq(ResumeAnalysisTable.userId, userId))

  return Math.max(0, RESUME_ANALYSIS_LIMIT - usedCount)
}