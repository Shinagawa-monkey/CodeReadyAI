import { JobInfoBackLink } from "@/features/jobInfos/components/jobInfoBackLink"
import { Suspense } from "react"
import { Loader2Icon, PlusIcon, ArrowRightIcon } from "lucide-react"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { db } from "@/drizzle/db"
import { and, desc, eq, isNotNull } from "drizzle-orm"
import { InterviewTable } from "@/drizzle/schema"
import { getInterviewJobInfoTag } from "@/features/interviews/dataCache"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { formatDateTime } from "@/lib/formatters"
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache"


export default async function InterviewsPage({ params }: { params: Promise<{ jobInfoId: string }> }) {
  const { jobInfoId } = await params
  return (
    <div className="container py-4 gap-4 h-screen-header flex flex-col items-start">
      <JobInfoBackLink jobInfoId={jobInfoId} />

      <Suspense fallback={<Loader2Icon className="animate-spin size-24 m-auto" />}>
        <SuspendedPage jobInfoId={jobInfoId} />
      </Suspense>
    </div>
  )
}

async function SuspendedPage({ jobInfoId }: { jobInfoId: string }) {
  // await new Promise(resolve => setTimeout(resolve, 2000)) // simulate a slow database query for testing
  const { userId, redirectToSignIn } = await getCurrentUser()
  if (userId == null) return redirectToSignIn()

  const interviews = await getInterviews(jobInfoId, userId)
  if (interviews.length === 0) {
    return redirect(`/app/job-infos/${jobInfoId}/interviews/new`)
  }
  return (
    <div className="space-y-6 w-full">
      <div className="flex gap-2 justify-between">
        <h1 className="text-3xl md:text-4xl lg:text-5xl">
          Interviews
        </h1>
        <Button asChild>
          <Link href={`/app/job-infos/${jobInfoId}/interviews/new`}>
            <PlusIcon />
            New Interview
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
        <Link className="transition-opacity" href={`/app/job-infos/${jobInfoId}/interviews/new`}>
          <Card className="h-full flex items-center justify-center border-dashed border-3 bg-transparent hover:border-primary/50 transition-colors shadow-none">
            <div className="text-lg flex items-center gap-2">
              <PlusIcon className="size-6" />
              New Interview
            </div>
          </Card>
        </Link>
        {interviews.map(interview => (
          <Link className="hover:scale-[1.02] transition-[transform_opacity]" href={`/app/job-infos/${jobInfoId}/interviews/${interview.id}`} key={interview.id}>
            <Card className="h-full">
              <div className="flex items-center justify-between h-full">
                <CardHeader className="gap-1 grow">
                  <CardTitle className="text-lg">
                    {formatDateTime(interview.createdAt)}
                  </CardTitle>
                  <CardDescription>{interview.duration}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ArrowRightIcon className="size-6" />
                </CardContent>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

async function getInterviews(jobInfoId: string, userId: string) {
  "use cache"
  cacheTag(getInterviewJobInfoTag(jobInfoId))
  cacheTag(getJobInfoIdTag(jobInfoId)) // if user changes job info id - rerun the query

  const data = await db.query.InterviewTable.findMany({
    where: and(eq(InterviewTable.jobInfoId, jobInfoId), isNotNull(InterviewTable.humeChatId)), // when I create new chat using hume library I set newchatId to the chat user just created, when user has no chat yet app creates a new interview with chat completely blank so I if user created an interview and hasn't started it yet  my app doesn't query for it
    with: { jobInfo: { columns: { userId: true } } },
    orderBy: desc(InterviewTable.updatedAt),
  })

  return data.filter(interview => interview.jobInfo.userId === userId)
}