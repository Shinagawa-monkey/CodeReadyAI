import { BackLink } from "@/components/BackLink";
import { JobInfoTable } from "@/drizzle/schema";
import { cn } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import { db } from "@/drizzle/db";
import { getJobInfoIdTag } from "../dbCache";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";


export function JobInfoBackLink({ jobInfoId, className }: { jobInfoId: string, className?: string }) {
  return (
    <BackLink href={`/app/job-infos/${jobInfoId}`} className={cn("mb-4", className)}>
      <Suspense fallback="Job Description">
        <JobName jobInfoId={jobInfoId} />
      </Suspense>
    </BackLink>
  )
}

async function JobName({ jobInfoId }: { jobInfoId: string }) {
  const jobInfo = await getJobInfo(jobInfoId)
  return jobInfo?.name ?? "Job Description" // if nome will be rendering 404 page but it's a safe fallback
}

async function getJobInfo(id: string) {
  "use cache"
  cacheTag(getJobInfoIdTag(id))

  return db.query.JobInfoTable.findFirst({
    where: eq(JobInfoTable.id, id),
  })
}