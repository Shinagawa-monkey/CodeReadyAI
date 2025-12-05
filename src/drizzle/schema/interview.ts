import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { id, createdAt, updatedAt } from '../schemaHelpers';
import { JobInfoTable } from './jobInfo';
import { relations } from "drizzle-orm";

export const InterviewTable = pgTable('interviews', {
    id,
    jobInfoId: uuid().references(() => JobInfoTable.id, { onDelete: 'cascade' })
        .notNull(),
    duration: varchar().notNull(), //lib I use for the duration needs to be a string
    humeChatId: varchar(), //can be null because will be reported later after we start the chat session
    feedback: varchar(), //feedback from the interview only if user asks for it so can be null
    createdAt,
    updatedAt
}) // for AI to know what to ask without repeating the same question

export const interviewRelations = relations(InterviewTable, ({ one }) => ({
    jobInfo: one(JobInfoTable, {
        fields: [InterviewTable.jobInfoId],
        references: [JobInfoTable.id],
    })
}))