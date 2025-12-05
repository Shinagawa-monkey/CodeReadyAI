import { pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from '../schemaHelpers';
import { JobInfoTable } from "./jobInfo";
import { relations } from "drizzle-orm";

export const UserTable = pgTable('users', {
    id: varchar().primaryKey(), // for clerk has to be a string
    email: varchar().notNull().unique(),
    name: varchar().notNull(),
    imageURL: varchar().notNull(),
    createdAt,
    updatedAt
    // emailVerified: timestamp('email_verified').notNull().defaultNow(),
    // password: text('password').notNull(),
    // role: text('role').notNull().default('user'),
})

export const userRelations = relations(UserTable, ({ many }) => ({
    jobInfos: many(JobInfoTable), // one user can have many job infos, with many pass the name of the table to many
}))