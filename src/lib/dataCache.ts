type CacheTag = "users" | "jobInfos" | "interviews" | "questions";

export function getGlobalTag(tag: CacheTag) {
  return `global:${tag}` as const; // global tag is used to cache the data for all users
}

export function getUserTag(tag: CacheTag, userId: string) {
  return `user:${userId}:${tag}` as const; // user tag is used to cache the data for a specific user

}

export function getJobInfoTag(tag: CacheTag, jobInfoId: string) {
  return `jobInfo:${jobInfoId}:${tag}` as const; // job info tag is used to cache the data for a specific job info

}

export function getIdTag(tag: CacheTag, id: string) {
  return `id:${id}:${tag}` as const; // id tag is used to cache the data for a specific id
}