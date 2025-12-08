import { db } from "@/drizzle/db"
import { UserTable } from "@/drizzle/schema"
import { getCurrentUser } from "./getCurrentUser"
import { eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { getUserIdTag } from "@/features/users/dbCache"

export type Permission =
  | "unlimited_resume_analysis"
  | "unlimited_interviews"
  | "unlimited_questions"
  | "1_interview"
  | "5_questions"
  | "2_resume_analyses"

// Get user features from database with caching
async function getUserFeatures(userId: string) {
  "use cache"
  cacheTag(getUserIdTag(userId))

  const user = await db.query.UserTable.findFirst({
    where: eq(UserTable.id, userId),
    columns: { features: true }
  })

  return user?.features || {}
}

export async function hasPermission(permission: Permission) {
  const { userId } = await getCurrentUser()
  if (!userId) return false

  // Get features from database
  const features = await getUserFeatures(userId)
  return features[permission] === true
}