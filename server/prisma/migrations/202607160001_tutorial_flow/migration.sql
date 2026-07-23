CREATE TABLE `content_tutorial_flow` (
  `id` VARCHAR(120) NOT NULL, `name` VARCHAR(160) NOT NULL, `description` TEXT NULL,
  `campaign_id` VARCHAR(80) NULL, `start_step_id` VARCHAR(120) NULL, `end_step_id` VARCHAR(120) NULL,
  `start_condition_json` JSON NOT NULL, `audience_json` JSON NOT NULL, `player_condition_json` JSON NOT NULL,
  `skip_unlock_features_json` JSON NOT NULL, `skippable` BOOLEAN NOT NULL DEFAULT true,
  `allow_replay` BOOLEAN NOT NULL DEFAULT false, `priority` INTEGER NOT NULL DEFAULT 0, `enabled` BOOLEAN NOT NULL DEFAULT true,
  `schema_version` INTEGER NOT NULL DEFAULT 1, `content_version` INTEGER NOT NULL DEFAULT 1,
  `row_version` INTEGER NOT NULL DEFAULT 1, `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL, `deleted_at` DATETIME(3) NULL,
  INDEX `content_tutorial_flow_campaign_id_idx`(`campaign_id`),
  INDEX `content_tutorial_flow_enabled_updated_at_idx`(`enabled`, `updated_at`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_tutorial_step` (
  `id` VARCHAR(120) NOT NULL, `flow_id` VARCHAR(120) NOT NULL, `sort_order` INTEGER NOT NULL, `name` VARCHAR(160) NOT NULL,
  `trigger_type` VARCHAR(60) NOT NULL, `trigger_json` JSON NOT NULL, `display_type` VARCHAR(40) NOT NULL,
  `target_type` VARCHAR(40) NOT NULL, `target_id` VARCHAR(160) NOT NULL, `title` VARCHAR(160) NOT NULL,
  `body` TEXT NOT NULL, `character_name` VARCHAR(80) NULL, `avatar_art_key` VARCHAR(160) NULL,
  `mask_json` JSON NOT NULL, `arrow_json` JSON NOT NULL, `block_input` BOOLEAN NOT NULL DEFAULT false,
  `completion_type` VARCHAR(60) NOT NULL, `completion_json` JSON NOT NULL, `timeout_ms` INTEGER NULL,
  `fallback_action` VARCHAR(60) NULL, `next_step_id` VARCHAR(120) NULL, `skip_step_id` VARCHAR(120) NULL,
  `stage_id` VARCHAR(80) NULL, `feature_id` VARCHAR(120) NULL, `terminal` BOOLEAN NOT NULL DEFAULT false,
  `enabled` BOOLEAN NOT NULL DEFAULT true, `content_version` INTEGER NOT NULL DEFAULT 1, `row_version` INTEGER NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,
  UNIQUE INDEX `content_tutorial_step_flow_id_sort_order_key`(`flow_id`, `sort_order`),
  INDEX `content_tutorial_step_flow_id_enabled_idx`(`flow_id`, `enabled`),
  INDEX `content_tutorial_step_next_step_id_idx`(`next_step_id`), INDEX `content_tutorial_step_skip_step_id_idx`(`skip_step_id`),
  INDEX `content_tutorial_step_stage_id_idx`(`stage_id`), INDEX `content_tutorial_step_avatar_art_key_idx`(`avatar_art_key`),
  INDEX `content_tutorial_step_target_type_target_id_idx`(`target_type`, `target_id`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_tutorial_step_transition` (
  `id` VARCHAR(120) NOT NULL, `flow_id` VARCHAR(120) NOT NULL,
  `from_step_id` VARCHAR(120) NOT NULL, `to_step_id` VARCHAR(120) NOT NULL,
  `condition_type` VARCHAR(60) NOT NULL, `condition_json` JSON NOT NULL,
  `sort_order` INTEGER NOT NULL DEFAULT 0, `enabled` BOOLEAN NOT NULL DEFAULT true,
  `row_version` INTEGER NOT NULL DEFAULT 1, `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL, `deleted_at` DATETIME(3) NULL,
  UNIQUE INDEX `content_tutorial_transition_unique`(`flow_id`, `from_step_id`, `to_step_id`, `condition_type`),
  INDEX `content_tutorial_transition_from_step_idx`(`from_step_id`),
  INDEX `content_tutorial_transition_to_step_idx`(`to_step_id`),
  INDEX `content_tutorial_transition_flow_enabled_order_idx`(`flow_id`, `enabled`, `sort_order`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_feature_unlock_rule` (
  `id` VARCHAR(120) NOT NULL, `flow_id` VARCHAR(120) NOT NULL, `step_id` VARCHAR(120) NULL,
  `feature_id` VARCHAR(120) NOT NULL, `unlock_trigger` VARCHAR(60) NOT NULL,
  `condition_json` JSON NOT NULL, `unlock_on_skip` BOOLEAN NOT NULL DEFAULT false,
  `sort_order` INTEGER NOT NULL DEFAULT 0, `enabled` BOOLEAN NOT NULL DEFAULT true,
  `row_version` INTEGER NOT NULL DEFAULT 1, `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL, `deleted_at` DATETIME(3) NULL,
  UNIQUE INDEX `content_feature_unlock_rule_unique`(`flow_id`, `feature_id`, `unlock_trigger`),
  INDEX `content_feature_unlock_rule_step_id_idx`(`step_id`),
  INDEX `content_feature_unlock_rule_feature_id_idx`(`feature_id`),
  INDEX `content_feature_unlock_rule_flow_enabled_order_idx`(`flow_id`, `enabled`, `sort_order`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
