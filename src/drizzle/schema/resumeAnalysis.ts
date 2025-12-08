import { pgTable, varchar, uuid } from "drizzle-orm/pg-core";
import { createdAt } from '../schemaHelpers';
import { UserTable } from './user';
import { JobInfoTable } from './jobInfo';
import { relations } from "drizzle-orm";

export const ResumeAnalysisTable = pgTable('resume_analysis', {
  id: uuid().primaryKey().defaultRandom(),
  userId: varchar().references(() => UserTable.id, { onDelete: 'cascade' }).notNull(),
  jobInfoId: varchar().references(() => JobInfoTable.id, { onDelete: 'cascade' }).notNull(),
  createdAt,
})

export const resumeAnalysisRelations = relations(ResumeAnalysisTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [ResumeAnalysisTable.userId],
    references: [UserTable.id],
  }),
  jobInfo: one(JobInfoTable, {
    fields: [ResumeAnalysisTable.jobInfoId],
    references: [JobInfoTable.id],
  }),
}))
