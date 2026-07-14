CREATE TABLE "purchase_request" (
	"id" text PRIMARY KEY NOT NULL,
	"request_number" text NOT NULL,
	"department_id" text NOT NULL,
	"requested_by_user_id" text NOT NULL,
	"title" text NOT NULL,
	"budget" numeric(12, 2) DEFAULT '0',
	"request_date" timestamp NOT NULL,
	"date_needed" timestamp,
	"status" text DEFAULT 'draft' NOT NULL,
	"draft" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "purchase_request_request_number_unique" UNIQUE("request_number")
);
--> statement-breakpoint
ALTER TABLE "purchase_request" ADD CONSTRAINT "purchase_request_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_request" ADD CONSTRAINT "purchase_request_requested_by_user_id_user_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "purchase_request_department_idx" ON "purchase_request" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "purchase_request_requested_by_idx" ON "purchase_request" USING btree ("requested_by_user_id");