CREATE TABLE `content_image_library_asset` (
  `id` VARCHAR(36) NOT NULL, `original_filename` VARCHAR(255) NOT NULL,
  `display_name` VARCHAR(255) NOT NULL, `storage_path` VARCHAR(255) NOT NULL,
  `thumbnail_path` VARCHAR(255) NULL, `mime_type` VARCHAR(120) NOT NULL,
  `extension` VARCHAR(20) NOT NULL, `width` INTEGER NOT NULL, `height` INTEGER NOT NULL,
  `file_size` INTEGER NOT NULL, `has_alpha` BOOLEAN NOT NULL DEFAULT false,
  `checksum_sha256` VARCHAR(128) NOT NULL, `source_type` VARCHAR(40) NOT NULL DEFAULT 'upload',
  `group_name` VARCHAR(120) NULL, `tags_json` JSON NULL, `status` VARCHAR(24) NOT NULL DEFAULT 'active',
  `created_by` VARCHAR(36) NULL, `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL, `archived_at` DATETIME(3) NULL,
  PRIMARY KEY (`id`), UNIQUE INDEX `content_image_library_asset_checksum_sha256_key` (`checksum_sha256`),
  INDEX `content_image_library_asset_group_name_updated_at_idx` (`group_name`, `updated_at`),
  INDEX `content_image_library_asset_has_alpha_updated_at_idx` (`has_alpha`, `updated_at`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_image_library_variant` (
  `id` VARCHAR(36) NOT NULL, `source_asset_id` VARCHAR(36) NOT NULL, `variant_name` VARCHAR(120) NOT NULL,
  `storage_path` VARCHAR(255) NOT NULL, `thumbnail_path` VARCHAR(255) NULL, `mime_type` VARCHAR(120) NOT NULL,
  `width` INTEGER NOT NULL, `height` INTEGER NOT NULL, `file_size` INTEGER NOT NULL,
  `has_alpha` BOOLEAN NOT NULL DEFAULT false, `checksum_sha256` VARCHAR(128) NOT NULL,
  `transform_config` JSON NOT NULL, `created_by` VARCHAR(36) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `archived_at` DATETIME(3) NULL,
  PRIMARY KEY (`id`), UNIQUE INDEX `content_image_library_variant_checksum_sha256_key` (`checksum_sha256`),
  INDEX `content_image_library_variant_source_asset_id_created_at_idx` (`source_asset_id`, `created_at`),
  CONSTRAINT `content_image_library_variant_source_asset_id_fkey` FOREIGN KEY (`source_asset_id`)
    REFERENCES `content_image_library_asset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `content_art_resource_version`
  ADD COLUMN `image_library_asset_id` VARCHAR(36) NULL,
  ADD COLUMN `image_library_variant_id` VARCHAR(36) NULL,
  ADD COLUMN `image_source_mode` VARCHAR(24) NULL,
  ADD INDEX `content_art_resource_version_image_library_asset_id_idx` (`image_library_asset_id`),
  ADD INDEX `content_art_resource_version_image_library_variant_id_idx` (`image_library_variant_id`),
  ADD CONSTRAINT `content_art_resource_version_image_library_asset_id_fkey` FOREIGN KEY (`image_library_asset_id`)
    REFERENCES `content_image_library_asset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `content_art_resource_version_image_library_variant_id_fkey` FOREIGN KEY (`image_library_variant_id`)
    REFERENCES `content_image_library_variant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
