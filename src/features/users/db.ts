import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateUserCache } from "./dbCache";

// Default features for all new users
const DEFAULT_FEATURES = {
  "1_interview": true,
  "2_resume_analyses": true,
  "5_questions": true,
}

export async function upsertUser(user: typeof UserTable.$inferInsert) {
  // Ensure features are set with defaults if not provided
  const userWithFeatures = {
    ...user,
    features: user.features || DEFAULT_FEATURES
  }

  await db.insert(UserTable).values(userWithFeatures).onConflictDoUpdate({
    target: [UserTable.id], // if no data found marching user id - we insert new user, if user id found - we update the user
    set: userWithFeatures,
  });

  revalidateUserCache(user.id);
}

export async function deleteUser(id: string) {
  await db.delete(UserTable).where(eq(UserTable.id, id));

  revalidateUserCache(id);
}