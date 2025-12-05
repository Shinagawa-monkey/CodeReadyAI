import { JobInfoForm } from "@/features/jobInfos/components/JobInfoForm";
import { Card, CardContent } from "@/components/ui/card";
import { JobInfoBackLink } from "@/features/jobInfos/components/jobInfoBackLink";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { notFound } from "next/navigation";
import { JobInfoTable } from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export default async function JobInfoNewPage({ params }: { params: Promise<{ jobInfoId: string }> }) {
  const { jobInfoId } = await params
  return (
    <div className="container my-4 max-w-5xl space-y-4">
      <JobInfoBackLink jobInfoId={jobInfoId} />
      <h1 className="text-3xl md:text-4xl">
        Edit Job Description
      </h1>
      <Card>
        <CardContent>
          <Suspense fallback={<Loader2 className="animate-spin size-24 mx-auto" />}>
            <SuspendedForm jobInfoId={jobInfoId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

async function SuspendedForm({ jobInfoId }: { jobInfoId: string }) {
  const { userId, redirectToSignIn } = await getCurrentUser()
  if (userId == null) return redirectToSignIn()

  const jobInfo = await getJobInfo(jobInfoId, userId)
  if (jobInfo == null) return notFound()

  return <JobInfoForm jobInfo={jobInfo} />
}

async function getJobInfo(id: string, userId: string) {
  "use cache"
  cacheTag(getJobInfoIdTag(id))

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  })
}