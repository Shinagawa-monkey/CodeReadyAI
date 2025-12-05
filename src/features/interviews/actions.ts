"use server"

import { db } from "@/drizzle/db"
import { and, eq } from "drizzle-orm"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { getJobInfoIdTag } from "../jobInfos/dbCache"
import { insertInterview, updateInterview as updateInterviewDb } from "./db"
import { InterviewTable, JobInfoTable } from "@/drizzle/schema"
import { getInterviewIdTag } from "./dataCache"
import { canCreateInterview } from "./permissions"
import { PLAN_LIMIT_MESSAGE, RATE_LIMIT_MESSAGE } from "@/lib/errorToast"
import arcjet, { tokenBucket, request } from "@arcjet/next"
import { env } from "@/data/env/server"
import { generateAiInterviewFeedback } from "@/services/ai/interviews"


const aj = arcjet({
  characteristics: ["userId"],
  key: env.ARCJET_KEY,
  rules: [
    tokenBucket({ // everyday user can make 4 interviews up to 12, but never more once the bucket of 12 runs out
      capacity: 12,
      refillRate: 4,
      interval: "1d",
      mode: "LIVE"
    })
  ]
}) // not the best practice to run arcjet on every request - used in middleware for every request and here for interview creation, but not a lot of interviews will be created so it's ok

export async function createInterview({ jobInfoId }: { jobInfoId: string }): Promise<{ error: true; message: string } | { error: false; id: string }> {
  const { userId } = await getCurrentUser()
  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    }
  }

  // Permissions
  if (!(await canCreateInterview())) {
    return {
      error: true,
      message: PLAN_LIMIT_MESSAGE,
    }
  }

  // Rate limit
  const decision = await aj.protect(await request(), { userId, requested: 1 }) // when user tries to create new interview it takes 1 tokes, userId is same name I specified in characteristics

  if (decision.isDenied()) {
    return {
      error: true,
      message: RATE_LIMIT_MESSAGE,
    }
  }

  // Job Info
  const jobInfo = await getJobInfo(jobInfoId, userId)
  if (jobInfo == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    }
  }

  // Create interview in the db
  const interview = await insertInterview({ jobInfoId, duration: "00:00:00" })

  return { error: false, id: interview.id }
}

export async function updateInterview(id: string, data: { humeChatId?: string, duration?: string }) {
  const { userId } = await getCurrentUser()
  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    }
  }

  const interview = await getInterview(id, userId)
  if (interview == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    }
  }

  await updateInterviewDb(id, data)

  return { error: false }
}

export async function generateInterviewFeedback(interviewId: string) {
  const { userId, user } = await getCurrentUser({ allData: true })
  if (userId == null || user == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    }
  }

  const interview = await getInterview(interviewId, userId)
  if (interview == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    }
  }

  if (interview.humeChatId == null) {
    return {
      error: true,
      message: "Interview has not been completed yet",
    }
  }

  const feedback = await generateAiInterviewFeedback({ humeChatId: interview.humeChatId, jobInfo: interview.jobInfo, userName: user.name })

  if (feedback == null) {
    return {
      error: true,
      message: "Failed to generate feedback",
    }
  }

  await updateInterviewDb(interviewId, { feedback })

  return { error: false }
}

async function getJobInfo(id: string, userId: string) {
  "use cache"
  cacheTag(getJobInfoIdTag(id))

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  })
}

async function getInterview(id: string, userId: string) {
  "use cache"
  cacheTag(getInterviewIdTag(id))

  const interview = await db.query.InterviewTable.findFirst({
    where: eq(InterviewTable.id, id),
    with: { jobInfo: { columns: { id: true, userId: true, description: true, title: true, experienceLevel: true } } },
  })

  if (interview == null) return null

  cacheTag(getJobInfoIdTag(interview.jobInfo.id))

  if (interview.jobInfo.userId !== userId) return null

  return interview
}