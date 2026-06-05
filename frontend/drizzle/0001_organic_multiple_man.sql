CREATE TABLE `qr_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`short_code` text NOT NULL,
	`dest_url` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `qr_codes_short_code_unique` ON `qr_codes` (`short_code`);--> statement-breakpoint
CREATE INDEX `qr_codes_user_id_idx` ON `qr_codes` (`user_id`);--> statement-breakpoint
CREATE INDEX `qr_codes_short_code_idx` ON `qr_codes` (`short_code`);--> statement-breakpoint
CREATE TABLE `scans` (
	`id` text PRIMARY KEY NOT NULL,
	`qr_code_id` text NOT NULL,
	`scanned_at` integer NOT NULL,
	`country` text,
	`city` text,
	`device` text,
	`os` text,
	`browser` text,
	FOREIGN KEY (`qr_code_id`) REFERENCES `qr_codes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `scans_qr_code_id_idx` ON `scans` (`qr_code_id`);--> statement-breakpoint
CREATE INDEX `scans_scanned_at_idx` ON `scans` (`scanned_at`);