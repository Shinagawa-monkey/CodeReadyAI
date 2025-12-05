import { Suspense } from "react"
import { Loader2Icon } from "lucide-react"
import { redirect } from "next/navigation"
import { JobInfoBackLink } from "@/features/jobInfos/components/jobInfoBackLink"
import { canRunResumeAnalysis } from "@/features/resumeAnalyses/permissions"
import { ResumePageClient } from "./_client"

export default async function ResumePage({ params }: { params: Promise<{ jobInfoId: string }> }) {
  const { jobInfoId } = await params

  return (
    <div className="container py-4 space-y-4 h-screen-header flex flex-col items-start">
      <JobInfoBackLink jobInfoId={jobInfoId} />
      <Suspense fallback={
        <Loader2Icon className="animate-spin size-24 m-auto" />
      }>
        <SuspendedComponent jobInfoId={jobInfoId} />
      </Suspense>
    </div>
  )
}

async function SuspendedComponent({ jobInfoId }: { jobInfoId: string }) {
  if (!(await canRunResumeAnalysis())) return redirect("/app/upgrade")

  // await new Promise(resolve => setTimeout(resolve, 10000)) // simulate loading
  return <ResumePageClient jobInfoId={jobInfoId} />
}