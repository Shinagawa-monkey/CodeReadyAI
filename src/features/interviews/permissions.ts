import { db } from "@/drizzle/db"
import { InterviewTable, JobInfoTable } from "@/drizzle/schema"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { hasPermission } from "@/services/clerk/lib/hasPermission"
import { and, count, eq, isNotNull } from "drizzle-orm"

const INTERVIEWS_LIMIT = 1

export async function canCreateInterview() {
  const { userId } = await getCurrentUser()
  if (!userId) return false

  // Check if user has unlimited interviews permission
  if (await hasPermission("unlimited_interviews")) return true

  // Check if user has 1 interview permission
  if (!(await hasPermission("1_interview"))) return false

  // Count how many interviews this user has started (with humeChatId)
  const [{ count: usedCount }] = await db
    .select({ count: count() })
    .from(InterviewTable)
    .innerJoin(JobInfoTable, eq(InterviewTable.jobInfoId, JobInfoTable.id))
    .where(
      and(eq(JobInfoTable.userId, userId), isNotNull(InterviewTable.humeChatId))
    )

  // Allow if under limit
  return usedCount < INTERVIEWS_LIMIT
}

export async function getRemainingInterviews() {
  const { userId } = await getCurrentUser()
  if (!userId) return 0

  // If unlimited, return a large number
  if (await hasPermission("unlimited_interviews")) return 999

  // If no permission, return 0
  if (!(await hasPermission("1_interview"))) return 0

  const [{ count: usedCount }] = await db
    .select({ count: count() })
    .from(InterviewTable)
    .innerJoin(JobInfoTable, eq(InterviewTable.jobInfoId, JobInfoTable.id))
    .where(
      and(eq(JobInfoTable.userId, userId), isNotNull(InterviewTable.humeChatId))
    )

  return Math.max(0, INTERVIEWS_LIMIT - usedCount)
}