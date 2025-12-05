import { questionDifficulties } from "@/drizzle/schema"
import z from "zod"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { canCreateQuestion } from "@/features/questions/permissions"
import { PLAN_LIMIT_MESSAGE } from "@/lib/errorToast"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache"
import { db } from "@/drizzle/db"
import { and, eq, asc } from "drizzle-orm"
import { JobInfoTable, QuestionTable } from "@/drizzle/schema"
import { getQuestionJobInfoTag } from "@/features/questions/dbCache"
import { insertQuestion } from "@/features/questions/db"
import { generateAiQuestion } from "@/services/ai/questions"
import { createUIMessageStream, createUIMessageStreamResponse, generateId } from "ai"


const schema = z.object({ prompt: z.enum(questionDifficulties), jobInfoId: z.string().min(1) })

export async function POST(req: Request) {
  const body = await req.json()
  const result = schema.safeParse(body)

  if (!result.success) {
    return new Response("Error generating your question", { status: 400 })
  }

  const { prompt: difficulty, jobInfoId } = result.data
  const { userId } = await getCurrentUser()

  if (userId == null) {
    return new Response("You are not logged in", { status: 401 })
  }

  if (!(await canCreateQuestion())) {
    return new Response(PLAN_LIMIT_MESSAGE, { status: 403 })
  }

  const jobInfo = await getJobInfo(jobInfoId, userId)
  if (jobInfo == null) {
    return new Response("You do not have permission to do this", {
      status: 403,
    })
  }

  const previousQuestions = await getQuestions(jobInfoId)

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const res = generateAiQuestion({
        previousQuestions,
        jobInfo,
        difficulty,
        onFinish: async question => {
          const { id } = await insertQuestion({
            text: question,
            jobInfoId,
            difficulty,
          })

          writer.write({
            type: "text-delta",
            id: generateId(),
            delta: `<!--QUESTION_ID:${id}-->`,
          })
        },
      })
      writer.merge(res.toUIMessageStream())
    },
  })

  return createUIMessageStreamResponse({ stream })
}

async function getQuestions(jobInfoId: string) {
  "use cache"
  cacheTag(getQuestionJobInfoTag(jobInfoId))

  return db.query.QuestionTable.findMany({
    where: eq(QuestionTable.jobInfoId, jobInfoId),
    orderBy: asc(QuestionTable.createdAt),
  })
}

async function getJobInfo(id: string, userId: string) {
  "use cache"
  cacheTag(getJobInfoIdTag(id))

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  })
}