import { db } from "@/drizzle/db"
import { JobInfoTable, QuestionTable } from "@/drizzle/schema"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { hasPermission } from "@/services/clerk/lib/hasPermission"
import { count, eq } from "drizzle-orm"

const QUESTIONS_LIMIT = 5

export async function canCreateQuestion() {
  const { userId } = await getCurrentUser()
  if (!userId) return false

  // Check if user has unlimited questions permission
  if (await hasPermission("unlimited_questions")) return true

  // Check if user has 5 questions permission
  if (!(await hasPermission("5_questions"))) return false

  // Count how many questions this user has created
  const [{ count: usedCount }] = await db
    .select({ count: count() })
    .from(QuestionTable)
    .innerJoin(JobInfoTable, eq(QuestionTable.jobInfoId, JobInfoTable.id))
    .where(eq(JobInfoTable.userId, userId))

  // Allow if under limit
  return usedCount < QUESTIONS_LIMIT
}

export async function getRemainingQuestions() {
  const { userId } = await getCurrentUser()
  if (!userId) return 0

  // If unlimited, return a large number
  if (await hasPermission("unlimited_questions")) return 999

  // If no permission, return 0
  if (!(await hasPermission("5_questions"))) return 0

  const [{ count: usedCount }] = await db
    .select({ count: count() })
    .from(QuestionTable)
    .innerJoin(JobInfoTable, eq(QuestionTable.jobInfoId, JobInfoTable.id))
    .where(eq(JobInfoTable.userId, userId))

  return Math.max(0, QUESTIONS_LIMIT - usedCount)
}