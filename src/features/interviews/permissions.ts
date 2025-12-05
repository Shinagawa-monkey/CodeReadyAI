import { db } from "@/drizzle/db"
import { InterviewTable, JobInfoTable } from "@/drizzle/schema"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { hasPermission } from "@/services/clerk/lib/hasPermission"
import { and, count, eq, isNotNull } from "drizzle-orm"

export async function canCreateInterview() {
  return await Promise.any([ // trturns the 1st succesful promise, but if all the promises fail it returns false, Promise.any will ran as soon as any of the promises return true, quicker than querying the db
    hasPermission("unlimited_interviews").then(
      bool => bool || Promise.reject()
    ),
    Promise.all([hasPermission("1_interview"), getUserInterviewCount()]).then( // checks how many plans user has and how many interviews they have
      ([has, c]) => {
        if (has && c < 1) return true
        return Promise.reject()
      }
    ),
  ]).catch(() => false) // catch only runs if all the promises fail
}

async function getUserInterviewCount() { // return the count of the all interviews for a specific user
  const { userId } = await getCurrentUser()
  if (userId == null) return 0

  return getInterviewCount(userId)
}

async function getInterviewCount(userId: string) { // return the count of the all interviews for a specific user that have a hume chat id, no need to cache because it's only called once when user tries to create an interview
  const [{ count: c }] = await db
    .select({ count: count() })
    .from(InterviewTable)
    .innerJoin(JobInfoTable, eq(InterviewTable.jobInfoId, JobInfoTable.id))
    .where(
      and(eq(JobInfoTable.userId, userId), isNotNull(InterviewTable.humeChatId)) // only count interviews that have a hume chat id because if they haven't started the interview yet they don't have a chat id and no need to charge for it
    )

  return c
}