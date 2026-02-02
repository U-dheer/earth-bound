CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"main_account_number" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"description" text NOT NULL,
	"phone_number" text NOT NULL,
	"email" text NOT NULL,
	"account_number" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "csr_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"location" jsonb,
	"is_approved" boolean DEFAULT false NOT NULL,
	"organizer_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"amount" serial NOT NULL,
	"user_id" uuid NOT NULL,
	"csr_id" uuid NOT NULL,
	"donated_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"offer_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text NOT NULL,
	"offer_code" text NOT NULL,
	"offer_title" text NOT NULL,
	"discount_percentage" integer NOT NULL,
	"valid_up_to" timestamp with time zone NOT NULL,
	"redeem_amount_for_get_the_offer" integer NOT NULL,
	"bussiness_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"email" text NOT NULL,
	"accountNumber" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_offers" (
	"user_id" uuid NOT NULL,
	"offer_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"redeem_points" serial NOT NULL,
	"account_number" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "csr_events" ADD CONSTRAINT "csr_events_organizer_id_organizers_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."organizers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_csr_id_csr_events_id_fk" FOREIGN KEY ("csr_id") REFERENCES "public"."csr_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_bussiness_id_businesses_id_fk" FOREIGN KEY ("bussiness_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_offers" ADD CONSTRAINT "user_offers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_offers" ADD CONSTRAINT "user_offers_offer_id_offers_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("offer_id") ON DELETE cascade ON UPDATE no action;