CREATE TABLE `content_stage_scene_layout` (
  `id` VARCHAR(36) NOT NULL, `stage_id` VARCHAR(80) NOT NULL, `canvas_width` INTEGER NOT NULL,
  `canvas_height` INTEGER NOT NULL, `scene_mode` VARCHAR(40) NOT NULL, `background_theme_id` VARCHAR(80) NULL,
  `hero_spawn_point_key` VARCHAR(80) NULL, `battle_area_json` JSON NOT NULL, `camera_json` JSON NULL,
  `completion_rule_json` JSON NULL, `failure_rule_json` JSON NULL, `enabled` BOOLEAN NOT NULL DEFAULT true,
  `content_version` INTEGER NOT NULL DEFAULT 1, `row_version` INTEGER NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `content_stage_scene_layout_stage_id_key`(`stage_id`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_stage_layer` (
  `id` VARCHAR(36) NOT NULL, `stage_id` VARCHAR(80) NOT NULL, `layer_key` VARCHAR(80) NOT NULL,
  `name` VARCHAR(120) NOT NULL, `layer_type` VARCHAR(40) NOT NULL, `art_key` VARCHAR(160) NULL,
  `background_theme_id` VARCHAR(80) NULL, `sort_order` INTEGER NOT NULL DEFAULT 0,
  `x` DOUBLE NOT NULL DEFAULT 0, `y` DOUBLE NOT NULL DEFAULT 0, `width` DOUBLE NULL, `height` DOUBLE NULL,
  `scale` DOUBLE NOT NULL DEFAULT 1, `opacity` DOUBLE NOT NULL DEFAULT 1, `tiled` BOOLEAN NOT NULL DEFAULT false,
  `scrolls_with_camera` BOOLEAN NOT NULL DEFAULT true, `parallax` DOUBLE NOT NULL DEFAULT 1,
  `enabled` BOOLEAN NOT NULL DEFAULT true, `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL, UNIQUE INDEX `content_stage_layer_stage_id_layer_key_key`(`stage_id`, `layer_key`),
  INDEX `content_stage_layer_art_key_idx`(`art_key`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_stage_spawn_point` (
  `id` VARCHAR(36) NOT NULL, `stage_id` VARCHAR(80) NOT NULL, `spawn_point_key` VARCHAR(80) NOT NULL,
  `name` VARCHAR(120) NOT NULL, `spawn_type` VARCHAR(40) NOT NULL, `x` DOUBLE NOT NULL, `y` DOUBLE NOT NULL,
  `facing` VARCHAR(20) NOT NULL, `battle_area_id` VARCHAR(80) NULL, `enabled` BOOLEAN NOT NULL DEFAULT true,
  `note` VARCHAR(255) NULL, `sort_order` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `content_stage_spawn_point_stage_id_spawn_point_key_key`(`stage_id`, `spawn_point_key`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_stage_orchestration_wave` (
  `id` VARCHAR(36) NOT NULL, `stage_id` VARCHAR(80) NOT NULL, `wave_key` VARCHAR(80) NOT NULL,
  `name` VARCHAR(120) NOT NULL, `wave_order` INTEGER NOT NULL, `start_trigger` VARCHAR(40) NOT NULL,
  `start_delay_ms` INTEGER NOT NULL DEFAULT 0, `max_alive` INTEGER NOT NULL DEFAULT 8,
  `completion_rule` VARCHAR(40) NOT NULL, `completion_delay_ms` INTEGER NOT NULL DEFAULT 0,
  `next_wave` VARCHAR(80) NULL, `enabled` BOOLEAN NOT NULL DEFAULT true, `sort_order` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `content_stage_orchestration_wave_stage_id_wave_key_key`(`stage_id`, `wave_key`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_stage_wave_entry` (
  `id` VARCHAR(36) NOT NULL, `wave_id` VARCHAR(36) NOT NULL, `entry_key` VARCHAR(80) NOT NULL,
  `enemy_template_id` VARCHAR(80) NOT NULL, `spawn_point_key` VARCHAR(80) NOT NULL, `quantity` INTEGER NOT NULL,
  `spawn_interval_ms` INTEGER NOT NULL DEFAULT 0, `initial_delay_ms` INTEGER NOT NULL DEFAULT 0,
  `elite` BOOLEAN NOT NULL DEFAULT false, `level_multiplier` DOUBLE NOT NULL DEFAULT 1,
  `hp_multiplier` DOUBLE NOT NULL DEFAULT 1, `attack_multiplier` DOUBLE NOT NULL DEFAULT 1,
  `animation_overrides_json` JSON NULL, `enabled` BOOLEAN NOT NULL DEFAULT true, `sort_order` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `content_stage_wave_entry_wave_id_entry_key_key`(`wave_id`, `entry_key`),
  INDEX `content_stage_wave_entry_enemy_template_id_idx`(`enemy_template_id`),
  INDEX `content_stage_wave_entry_spawn_point_key_idx`(`spawn_point_key`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
