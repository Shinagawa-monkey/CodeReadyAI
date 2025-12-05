import { db } from "@/drizzle/db"
import { JobInfoTable } from "@/drizzle/schema"
import { revalidateJobInfoCache } from "./dbCache"
import { eq } from "drizzle-orm"

export async function insertJobInfo(jobInfo: typeof JobInfoTable.$inferInsert) {
  const [newJobInfo] = await db.insert(JobInfoTable).values(jobInfo).returning({
    id: JobInfoTable.id,
    userId: JobInfoTable.userId,
  }) // will retun an array so we break it in to individual elemnts using []

  revalidateJobInfoCache(newJobInfo)

  return newJobInfo
}

export async function updateJobInfo(
  id: string,
  jobInfo: Partial<typeof JobInfoTable.$inferInsert> // Partial - makes all properties optional for updte
) {
  const [updatedJobInfo] = await db
    .update(JobInfoTable)
    .set(jobInfo)
    .where(eq(JobInfoTable.id, id))
    .returning({
      id: JobInfoTable.id,
      userId: JobInfoTable.userId,
    })

  revalidateJobInfoCache(updatedJobInfo)

  return updatedJobInfo
}