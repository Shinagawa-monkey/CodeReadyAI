import { getGlobalTag, getIdTag } from "@/lib/dataCache"
import { revalidateTag } from "next/cache"

export function getUserGlobalTag() {
  return getGlobalTag("users")
}

export function getUserIdTag(id: string) {
  return getIdTag("users", id)
}

export function revalidateUserCache(id: string) {
  revalidateTag(getUserGlobalTag(), {}) // revalidate the global tag for all users
  revalidateTag(getUserIdTag(id), {}) // revalidate the user tag for the specific user
}