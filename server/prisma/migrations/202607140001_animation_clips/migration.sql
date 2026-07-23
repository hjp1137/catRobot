CREATE TABLE `content_animation_clip` (
  `id` VARCHAR(36) NOT NULL,
  `clip_key` VARCHAR(120) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `target_type` VARCHAR(40) NOT NULL,
  `state` VARCHAR(40) NOT NULL,
  `default_fps` DOUBLE NULL,
  `default_frame_duration_ms` INTEGER NULL,
  `loop` BOOLEAN NOT NULL DEFAULT true,
  `play_mode` VARCHAR(40) NOT NULL DEFAULT 'loop',
  `end_behavior` VARCHAR(40) NOT NULL DEFAULT 'hold-last-frame',
  `enabled` BOOLEAN NOT NULL DEFAULT true,
  `content_version` INTEGER NOT NULL DEFAULT 1,
  `row_version` INTEGER NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `content_animation_clip_clip_key_key` (`clip_key`),
  INDEX `content_animation_clip_target_type_state_idx` (`target_type`, `state`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_animation_frame` (
  `id` VARCHAR(36) NOT NULL,
  `clip_id` VARCHAR(36) NOT NULL,
  `sort_order` INTEGER NOT NULL,
  `art_key` VARCHAR(160) NOT NULL,
  `duration_ms` INTEGER NULL,
  `offset_x` DOUBLE NULL,
  `offset_y` DOUBLE NULL,
  `scale` DOUBLE NULL,
  `flip_x` BOOLEAN NOT NULL DEFAULT false,
  `note` VARCHAR(255) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `content_animation_frame_clip_id_sort_order_key` (`clip_id`, `sort_order`),
  INDEX `content_animation_frame_art_key_idx` (`art_key`),
  CONSTRAINT `content_animation_frame_clip_id_fkey`
    FOREIGN KEY (`clip_id`) REFERENCES `content_animation_clip`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
