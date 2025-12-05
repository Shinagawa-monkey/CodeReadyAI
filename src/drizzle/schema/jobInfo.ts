import { pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";
import { id, createdAt, updatedAt } from '../schemaHelpers';
import { UserTable } from './user';
import { relations } from "drizzle-orm";
import { InterviewTable } from './interview';
import { QuestionTable } from './question';

export const experienceLevels = ['junior', 'mid-level', 'senior'] as const;
export type ExperienceLevel = (typeof experienceLevels)[number];
export const experienceLevelEnum = pgEnum('job_infos_experience_level', experienceLevels);

export const JobInfoTable = pgTable('job_info', {
    id,
    title: varchar(), // sometimes job title might have no value so can be null
    name: varchar().notNull(), // name of the job in UI that user sees
    experienceLevel: experienceLevelEnum().notNull(),
    description: varchar().notNull(),
    userId: varchar().references(() => UserTable.id, { onDelete: 'cascade' })
        .notNull(), // if we delete a user delete all jobs associated with that user, notNull - every job must have a user associated with it
    createdAt,
    updatedAt
})

export const jobInfoRelations = relations(JobInfoTable, ({ one, many }) => ({
    user: one(UserTable, {
        fields: [JobInfoTable.userId],
        references: [UserTable.id],
    }),
    interviews: many(InterviewTable),
    questions: many(QuestionTable),
}))