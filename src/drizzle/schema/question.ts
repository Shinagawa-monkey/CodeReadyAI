import { pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { id, createdAt, updatedAt } from '../schemaHelpers';
import { JobInfoTable } from './jobInfo';
import { relations } from "drizzle-orm";

export const questionDifficulties = ['easy', 'medium', 'hard'] as const;
export type QuestionDifficulty = (typeof questionDifficulties)[number];
export const questionDifficultyEnum = pgEnum('questions_question_difficulty', questionDifficulties); //table name followed by enum name

export const QuestionTable = pgTable('questions', {
    id,
    jobInfoId: uuid().references(() => JobInfoTable.id, { onDelete: 'cascade' })
        .notNull(),
    text: varchar().notNull(), // what is the question
    difficulty: questionDifficultyEnum().notNull(),
    createdAt,
    updatedAt
}) // for AI to know what to ask without repeating the same question

export const questionsRelations = relations(QuestionTable, ({ one }) => ({
    jobInfo: one(JobInfoTable, {
        fields: [QuestionTable.jobInfoId],
        references: [JobInfoTable.id],
    }),
}))