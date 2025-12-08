"use server"

import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { getUserIdTag } from "./dbCache"
import { db } from "@/drizzle/db"
import { UserTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { clerkClient } from "@clerk/nextjs/server"
import { upsertUser } from "./db"

export async function getUser(id: string) {
  "use cache"
  cacheTag(getUserIdTag(id))

  return db.query.UserTable.findFirst({
    where: eq(UserTable.id, id),
  })
}

export async function ensureUserExists(userId: string) {
  // Check if user already exists
  const existingUser = await db.query.UserTable.findFirst({
    where: eq(UserTable.id, userId),
  })

  if (existingUser) return existingUser

  // User doesn't exist, create from Clerk data
  try {
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)

    const email = clerkUser.emailAddresses.find(
      e => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress

    if (!email) {
      throw new Error("No primary email found")
    }

    const user = {
      id: clerkUser.id,
      email,
      name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || email,
      imageURL: clerkUser.imageUrl,
      createdAt: new Date(clerkUser.createdAt),
      updatedAt: new Date(clerkUser.updatedAt),
    }

    await upsertUser(user)
    return user
  } catch (error) {
    console.error("[ensureUserExists] Error creating user:", error)
    throw error
  }
}