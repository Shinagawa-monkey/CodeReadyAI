import { InterviewTable } from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import { revalidateInterviewCache } from "./dataCache";
import { eq } from "drizzle-orm";

export async function insertInterview(interview: typeof InterviewTable.$inferInsert) {
  const [newInterview] = await db.insert(InterviewTable).values(interview).returning({
    id: InterviewTable.id,
    jobInfoId: InterviewTable.jobInfoId
  })

  revalidateInterviewCache(newInterview)

  return newInterview
}

export async function updateInterview(id: string, interview: Partial<typeof InterviewTable.$inferInsert>) {
  const [updatedInterview] = await db.update(InterviewTable).set(interview).where(eq(InterviewTable.id, id)).returning({ id: InterviewTable.id, jobInfoId: InterviewTable.jobInfoId })

  revalidateInterviewCache(updatedInterview)

  return updatedInterview
}