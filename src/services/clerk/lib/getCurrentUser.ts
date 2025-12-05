import { db } from "@/drizzle/db"
import { UserTable } from "@/drizzle/schema"
import { getUserIdTag } from "@/features/users/dbCache"
import { auth } from "@clerk/nextjs/server"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { eq } from "drizzle-orm"

export async function getCurrentUser({ allData = false } = {}) {
    const { userId, redirectToSignIn } = await auth()
    
    return { 
        userId, 
        redirectToSignIn,
        user: allData && userId != null ? await getUser(userId) : undefined // only will happen when we need all the user data
    }
}

async function getUser(id: string) {
    'use cache'
    cacheTag(getUserIdTag(id))

    return db.query.UserTable.findFirst({
        where: eq(UserTable.id, id)
    })
}