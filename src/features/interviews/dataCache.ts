import { getGlobalTag, getIdTag, getJobInfoTag } from "@/lib/dataCache"
import { revalidateTag } from "next/cache"

export function getInterviewGlobalTag() {
  return getGlobalTag("interviews")
}

export function getInterviewJobInfoTag(jobInfoId: string) {
  return getJobInfoTag("interviews", jobInfoId)
}

export function getInterviewIdTag(id: string) {
  return getIdTag("interviews", id)
}

export function revalidateInterviewCache({ id, jobInfoId }: { id: string, jobInfoId: string }) {
  revalidateTag(getInterviewGlobalTag(), {}) // revalidate the global interview tag for all users
  revalidateTag(getInterviewJobInfoTag(jobInfoId), {}) // revalidate the job interview tag for the specific job info
  revalidateTag(getInterviewIdTag(id), {}) // revalidate the interview tag for the specific interview
}