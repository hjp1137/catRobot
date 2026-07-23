-- CreateTable
CREATE TABLE `content_admin_user` (
    `id` VARCHAR(36) NOT NULL,
    `username` VARCHAR(80) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'editor', 'viewer') NOT NULL DEFAULT 'viewer',
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `content_admin_user_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_enemy_template` (
    `id` VARCHAR(80) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `category` VARCHAR(40) NOT NULL,
    `behavior_type` VARCHAR(40) NOT NULL,
    `visual_json` JSON NOT NULL,
    `stats_json` JSON NOT NULL,
    `combat_json` JSON NOT NULL,
    `rewards_json` JSON NULL,
    `tags_json` JSON NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `content_version` INTEGER NOT NULL DEFAULT 1,
    `row_version` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_background_theme` (
    `id` VARCHAR(80) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `art_json` JSON NOT NULL,
    `colors_json` JSON NULL,
    `rendering_json` JSON NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `content_version` INTEGER NOT NULL DEFAULT 1,
    `row_version` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_hero_visual` (
    `id` VARCHAR(80) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `visual_json` JSON NOT NULL,
    `skills_json` JSON NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `content_version` INTEGER NOT NULL DEFAULT 1,
    `row_version` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_stage` (
    `id` VARCHAR(80) NOT NULL,
    `legacy_stage_id` VARCHAR(80) NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `mode` ENUM('fixed_battle', 'explore') NOT NULL,
    `hero_visual_template_id` VARCHAR(80) NOT NULL,
    `background_theme_id` VARCHAR(80) NOT NULL,
    `world_width` INTEGER NULL,
    `world_height` INTEGER NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `content_version` INTEGER NOT NULL DEFAULT 1,
    `row_version` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_stage_wave` (
    `id` VARCHAR(36) NOT NULL,
    `stage_id` VARCHAR(80) NOT NULL,
    `wave_no` INTEGER NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `content_stage_wave_stage_id_wave_no_key`(`stage_id`, `wave_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_stage_wave_enemy_group` (
    `id` VARCHAR(36) NOT NULL,
    `stage_wave_id` VARCHAR(36) NOT NULL,
    `enemy_template_id` VARCHAR(80) NOT NULL,
    `enemy_count` INTEGER NOT NULL,
    `spawn_area_id` VARCHAR(80) NULL,
    `spawn_interval` DOUBLE NULL,
    `level_multiplier` DOUBLE NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_explore_spawn_group` (
    `id` VARCHAR(36) NOT NULL,
    `stage_id` VARCHAR(80) NOT NULL,
    `group_key` VARCHAR(80) NOT NULL,
    `enemy_template_id` VARCHAR(80) NOT NULL,
    `spawn_x` DOUBLE NOT NULL,
    `spawn_y` DOUBLE NOT NULL,
    `spawn_radius` DOUBLE NOT NULL,
    `initial_count` INTEGER NOT NULL,
    `max_alive` INTEGER NOT NULL,
    `respawn_interval` INTEGER NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_stage_objective` (
    `id` VARCHAR(36) NOT NULL,
    `stage_id` VARCHAR(80) NOT NULL,
    `objective_type` VARCHAR(40) NOT NULL,
    `required_count` INTEGER NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `config_json` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_art_resource` (
    `art_key` VARCHAR(160) NOT NULL,
    `resource_type` VARCHAR(60) NOT NULL,
    `pack_name` VARCHAR(120) NULL,
    `physical_path` VARCHAR(255) NULL,
    `fallback_art_key` VARCHAR(160) NULL,
    `resource_status` ENUM('physical', 'virtual', 'fallback', 'missing') NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `transparent` BOOLEAN NOT NULL DEFAULT true,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `checksum` VARCHAR(128) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`art_key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_release` (
    `id` VARCHAR(36) NOT NULL,
    `release_version` VARCHAR(40) NOT NULL,
    `status` ENUM('validating', 'publishing', 'published', 'failed', 'restored') NOT NULL,
    `validation_error_count` INTEGER NOT NULL DEFAULT 0,
    `validation_warning_count` INTEGER NOT NULL DEFAULT 0,
    `content_summary_json` JSON NOT NULL,
    `snapshot_checksum` VARCHAR(128) NULL,
    `snapshot_path` VARCHAR(255) NULL,
    `created_by` VARCHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `published_at` DATETIME(3) NULL,
    `failure_reason` TEXT NULL,

    UNIQUE INDEX `content_release_release_version_key`(`release_version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_release_snapshot` (
    `id` VARCHAR(36) NOT NULL,
    `release_id` VARCHAR(36) NOT NULL,
    `schema_version` INTEGER NOT NULL,
    `snapshot_json` JSON NOT NULL,
    `checksum` VARCHAR(128) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_system_state` (
    `id` VARCHAR(40) NOT NULL DEFAULT 'singleton',
    `draft_revision` INTEGER NOT NULL DEFAULT 0,
    `published_revision` INTEGER NOT NULL DEFAULT 0,
    `current_release_id` VARCHAR(36) NULL,
    `draft_dirty` BOOLEAN NOT NULL DEFAULT false,
    `last_validation_at` DATETIME(3) NULL,
    `last_validation_result_json` JSON NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_change_log` (
    `id` VARCHAR(36) NOT NULL,
    `entity_type` VARCHAR(80) NOT NULL,
    `entity_id` VARCHAR(120) NOT NULL,
    `action_type` VARCHAR(40) NOT NULL,
    `before_json` JSON NULL,
    `after_json` JSON NULL,
    `operator_id` VARCHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

