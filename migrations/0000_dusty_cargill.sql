CREATE TABLE `points` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer,
	`entry_date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`departure_date` text,
	`image_info` text,
	`observation` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`login` text,
	`password` text,
	`role` text,
	`status` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
