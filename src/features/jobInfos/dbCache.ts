import { getGlobalTag, getIdTag, getUserTag } from "@/lib/dataCache"
import { revalidateTag } from "next/cache"

export function getJobInfoGlobalTag() {
  return getGlobalTag("jobInfos")
}

export function getJobInfoUserTag(userId: string) {
  return getUserTag("jobInfos", userId)
}

export function getJobInfoIdTag(id: string) {
  return getIdTag("jobInfos", id)
}

export function revalidateJobInfoCache({ id, userId }: { id: string, userId: string }) {
  revalidateTag(getJobInfoGlobalTag(), {}) // revalidate the global job info tag for all users
  revalidateTag(getJobInfoUserTag(userId), {}) // revalidate the job info tag for the specific user if userId is provided
  revalidateTag(getJobInfoIdTag(id), {}) // revalidate the job info tag for the specific user
}