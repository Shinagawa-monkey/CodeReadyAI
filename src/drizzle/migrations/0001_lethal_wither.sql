CREATE TABLE "resume_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" varchar NOT NULL,
	"jobInfoId" varchar NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resume_analysis" ADD CONSTRAINT "resume_analysis_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_analysis" ADD CONSTRAINT "resume_analysis_jobInfoId_job_info_id_fk" FOREIGN KEY ("jobInfoId") REFERENCES "public"."job_info"("id") ON DELETE cascade ON UPDATE no action;