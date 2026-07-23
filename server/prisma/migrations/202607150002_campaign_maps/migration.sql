CREATE TABLE `content_campaign` (
  `id` VARCHAR(80) NOT NULL, `name` VARCHAR(120) NOT NULL, `subtitle` VARCHAR(160) NULL,
  `description` TEXT NULL, `cover_art_key` VARCHAR(160) NULL, `default_chapter_id` VARCHAR(80) NULL,
  `sort_order` INTEGER NOT NULL DEFAULT 0, `enabled` BOOLEAN NOT NULL DEFAULT true,
  `schema_version` INTEGER NOT NULL DEFAULT 1, `content_version` INTEGER NOT NULL DEFAULT 1,
  `row_version` INTEGER NOT NULL DEFAULT 1, `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL, `deleted_at` DATETIME(3) NULL,
  INDEX `content_campaign_enabled_sort_order_idx`(`enabled`, `sort_order`),
  INDEX `content_campaign_cover_art_key_idx`(`cover_art_key`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_campaign_chapter` (
  `id` VARCHAR(80) NOT NULL, `campaign_id` VARCHAR(80) NOT NULL, `chapter_no` INTEGER NOT NULL,
  `name` VARCHAR(120) NOT NULL, `subtitle` VARCHAR(160) NULL, `description` TEXT NULL,
  `background_art_key` VARCHAR(160) NOT NULL, `canvas_width` INTEGER NOT NULL DEFAULT 1000,
  `canvas_height` INTEGER NOT NULL DEFAULT 600, `viewport_x` DOUBLE NOT NULL DEFAULT 0,
  `viewport_y` DOUBLE NOT NULL DEFAULT 0, `enabled` BOOLEAN NOT NULL DEFAULT true,
  `completion_text` VARCHAR(255) NULL, `completion_reward_ref` VARCHAR(160) NULL,
  `row_version` INTEGER NOT NULL DEFAULT 1, `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL, `deleted_at` DATETIME(3) NULL,
  UNIQUE INDEX `content_campaign_chapter_campaign_id_chapter_no_key`(`campaign_id`, `chapter_no`),
  INDEX `content_campaign_chapter_campaign_id_enabled_idx`(`campaign_id`, `enabled`),
  INDEX `content_campaign_chapter_background_art_key_idx`(`background_art_key`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_campaign_stage_node` (
  `id` VARCHAR(80) NOT NULL, `chapter_id` VARCHAR(80) NOT NULL, `stage_id` VARCHAR(80) NOT NULL,
  `name` VARCHAR(120) NOT NULL, `x` DOUBLE NOT NULL, `y` DOUBLE NOT NULL, `node_type` VARCHAR(32) NOT NULL,
  `icon_art_key` VARCHAR(160) NULL, `is_start` BOOLEAN NOT NULL DEFAULT false,
  `is_end` BOOLEAN NOT NULL DEFAULT false, `sort_order` INTEGER NOT NULL DEFAULT 0,
  `recommended_power` INTEGER NOT NULL DEFAULT 0, `description` TEXT NULL,
  `enabled` BOOLEAN NOT NULL DEFAULT true, `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `content_campaign_stage_node_chapter_id_stage_id_key`(`chapter_id`, `stage_id`),
  INDEX `content_campaign_stage_node_chapter_id_enabled_sort_order_idx`(`chapter_id`, `enabled`, `sort_order`),
  INDEX `content_campaign_stage_node_stage_id_idx`(`stage_id`),
  INDEX `content_campaign_stage_node_icon_art_key_idx`(`icon_art_key`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_campaign_node_connection` (
  `id` VARCHAR(80) NOT NULL, `chapter_id` VARCHAR(80) NOT NULL, `from_node_id` VARCHAR(80) NOT NULL,
  `to_node_id` VARCHAR(80) NOT NULL, `path_type` VARCHAR(32) NOT NULL DEFAULT 'normal',
  `one_way` BOOLEAN NOT NULL DEFAULT true, `sort_order` INTEGER NOT NULL DEFAULT 0,
  `enabled` BOOLEAN NOT NULL DEFAULT true, `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `content_campaign_node_connection_chapter_from_to_key`(`chapter_id`, `from_node_id`, `to_node_id`),
  INDEX `content_campaign_node_connection_chapter_enabled_sort_idx`(`chapter_id`, `enabled`, `sort_order`),
  INDEX `content_campaign_node_connection_from_node_id_idx`(`from_node_id`),
  INDEX `content_campaign_node_connection_to_node_id_idx`(`to_node_id`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
