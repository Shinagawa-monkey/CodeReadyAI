import { experienceLevels } from "@/drizzle/schema/jobInfo"
import z from "zod"

export const jobInfoSchema = z.object({
  name: z.string().min(1, { message: "Required" }),
  title: z.string().min(1).nullable(), // nullable deleted it from db but optional doesn't
  experienceLevel: z.enum(experienceLevels),
  description: z.string().min(1, { message: "Required" })
})