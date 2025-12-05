"use server"

import z from "zod"
import { jobInfoSchema } from "./schemas"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { insertJobInfo, updateJobInfo as updateJobInfoDb } from "./db"
import { redirect } from "next/navigation"
import { db } from "@/drizzle/db"
import { and, eq } from "drizzle-orm"
import { JobInfoTable } from "@/drizzle/schema"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { getJobInfoIdTag } from "./dbCache"

export async function createJobInfo(unsafeData: z.infer<typeof jobInfoSchema>) {
  const { userId } = await getCurrentUser()
  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    }
  }

  const { success, data } = jobInfoSchema.safeParse(unsafeData) // a Zod method used to validate data safely against a schema without throwing an error
  if (!success) {
    return {
      error: true,
      message: "Invalid job data",
    }
  }

  const jobInfo = await insertJobInfo({ ...data, userId })

  redirect(`/app/job-infos/${jobInfo.id}`)
}

export async function updateJobInfo( //only update job infos we have access to
  id: string,
  unsafeData: z.infer<typeof jobInfoSchema>
) {
  const { userId } = await getCurrentUser()
  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    }
  }

  const { success, data } = jobInfoSchema.safeParse(unsafeData)
  if (!success) {
    return {
      error: true,
      message: "Invalid job data",
    }
  }

  const existingJobInfo = await getJobInfo(id, userId)
  if (existingJobInfo == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    }
  }

  const jobInfo = await updateJobInfoDb(id, data)

  redirect(`/app/job-infos/${jobInfo.id}`)
}

async function getJobInfo(id: string, userId: string) {
  "use cache"
  cacheTag(getJobInfoIdTag(id))

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  })
}