CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`phone` varchar(32),
	`email` varchar(320),
	`segment` enum('anunciante','lojista','comprador','outro') NOT NULL DEFAULT 'anunciante',
	`categoryInterest` varchar(64),
	`message` text,
	`source` varchar(256),
	`ipAddress` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scraped_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` int NOT NULL,
	`originalUrl` varchar(512) NOT NULL,
	`originalTitle` varchar(512),
	`rawContent` text,
	`status` enum('pending','processing','published','rejected') NOT NULL DEFAULT 'pending',
	`postId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scraped_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `scraped_items_originalUrl_unique` UNIQUE(`originalUrl`)
);
--> statement-breakpoint
CREATE TABLE `scraping_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`url` varchar(512) NOT NULL,
	`categoryId` int NOT NULL,
	`type` enum('rss','html') NOT NULL DEFAULT 'rss',
	`keywords` varchar(512),
	`isActive` boolean NOT NULL DEFAULT true,
	`lastScrapedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scraping_sources_id` PRIMARY KEY(`id`),
	CONSTRAINT `scraping_sources_url_unique` UNIQUE(`url`)
);
--> statement-breakpoint
ALTER TABLE `categories` ADD `icon` varchar(16) DEFAULT '📰';--> statement-breakpoint
ALTER TABLE `categories` ADD `accentColor` varchar(16) DEFAULT '#F5C800';--> statement-breakpoint
ALTER TABLE `categories` ADD `description` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `tags` varchar(512);--> statement-breakpoint
ALTER TABLE `posts` ADD `isScraped` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `posts` ADD `sourceUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `scraped_items` ADD CONSTRAINT `scraped_items_sourceId_scraping_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `scraping_sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scraped_items` ADD CONSTRAINT `scraped_items_postId_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scraping_sources` ADD CONSTRAINT `scraping_sources_categoryId_categories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE no action ON UPDATE no action;