CREATE TABLE `content_stage_progression_config` (
  `id` VARCHAR(36) NOT NULL, `stage_id` VARCHAR(80) NOT NULL, `recommended_power` INTEGER NOT NULL DEFAULT 0,
  `victory_text` VARCHAR(255) NULL, `failure_text` VARCHAR(255) NULL, `row_version` INTEGER NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `content_stage_progression_config_stage_id_key`(`stage_id`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_stage_progression_objective` (
  `id` VARCHAR(36) NOT NULL, `stage_id` VARCHAR(80) NOT NULL, `objective_key` VARCHAR(80) NOT NULL,
  `name` VARCHAR(120) NOT NULL, `objective_type` VARCHAR(40) NOT NULL, `required` BOOLEAN NOT NULL DEFAULT false,
  `params_json` JSON NULL, `display_text` VARCHAR(255) NOT NULL, `progress_display` VARCHAR(40) NOT NULL,
  `star_eligible` BOOLEAN NOT NULL DEFAULT false, `enabled` BOOLEAN NOT NULL DEFAULT true, `sort_order` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `content_stage_progression_objective_stage_id_objective_key_key`(`stage_id`, `objective_key`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_reward_definition` (
  `id` VARCHAR(36) NOT NULL, `reward_type` VARCHAR(32) NOT NULL, `reward_ref_id` VARCHAR(80) NOT NULL,
  `name` VARCHAR(120) NOT NULL, `icon_art_key` VARCHAR(160) NULL, `enabled` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `content_reward_definition_reward_type_reward_ref_id_key`(`reward_type`, `reward_ref_id`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_stage_reward_pool` (
  `id` VARCHAR(36) NOT NULL, `stage_id` VARCHAR(80) NOT NULL, `pool_key` VARCHAR(80) NOT NULL, `name` VARCHAR(120) NOT NULL,
  `group_type` VARCHAR(40) NOT NULL, `objective_key` VARCHAR(80) NULL, `selection_mode` VARCHAR(40) NOT NULL,
  `enabled` BOOLEAN NOT NULL DEFAULT true, `sort_order` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `content_stage_reward_pool_stage_id_pool_key_key`(`stage_id`, `pool_key`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_stage_reward_entry` (
  `id` VARCHAR(36) NOT NULL, `pool_id` VARCHAR(36) NOT NULL, `entry_key` VARCHAR(80) NOT NULL,
  `reward_type` VARCHAR(32) NOT NULL, `reward_ref_id` VARCHAR(80) NOT NULL, `min_quantity` INTEGER NOT NULL,
  `max_quantity` INTEGER NOT NULL, `probability` DOUBLE NOT NULL DEFAULT 1, `guaranteed` BOOLEAN NOT NULL DEFAULT false,
  `enabled` BOOLEAN NOT NULL DEFAULT true, `sort_order` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `content_stage_reward_entry_pool_id_entry_key_key`(`pool_id`, `entry_key`),
  INDEX `content_stage_reward_entry_reward_type_reward_ref_id_idx`(`reward_type`, `reward_ref_id`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_stage_unlock_rule` (
  `id` VARCHAR(36) NOT NULL, `stage_id` VARCHAR(80) NOT NULL, `rule_key` VARCHAR(80) NOT NULL, `rule_type` VARCHAR(40) NOT NULL,
  `prerequisite_stage_id` VARCHAR(80) NULL, `required_stars` INTEGER NOT NULL DEFAULT 0, `next_stage_id` VARCHAR(80) NULL,
  `enabled` BOOLEAN NOT NULL DEFAULT true, `sort_order` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `content_stage_unlock_rule_stage_id_rule_key_key`(`stage_id`, `rule_key`),
  INDEX `content_stage_unlock_rule_prerequisite_stage_id_idx`(`prerequisite_stage_id`),
  INDEX `content_stage_unlock_rule_next_stage_id_idx`(`next_stage_id`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
