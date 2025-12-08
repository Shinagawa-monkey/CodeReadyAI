import { db } from "@/drizzle/db"
import { InterviewTable, JobInfoTable } from "@/drizzle/schema"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { and, count, eq, isNotNull } from "drizzle-orm"

const INTERVIEWS_LIMIT = 1

export async function canCreateInterview() {
  const { userId } = await getCurrentUser()
  if (!userId) return false

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

  const [{ count: usedCount }] = await db
    .select({ count: count() })
    .from(InterviewTable)
    .innerJoin(JobInfoTable, eq(InterviewTable.jobInfoId, JobInfoTable.id))
    .where(
      and(eq(JobInfoTable.userId, userId), isNotNull(InterviewTable.humeChatId))
    )

  return Math.max(0, INTERVIEWS_LIMIT - usedCount)
}