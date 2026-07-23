ALTER TABLE `content_art_resource`
  ADD COLUMN `expected_width` INTEGER NULL,
  ADD COLUMN `expected_height` INTEGER NULL,
  ADD COLUMN `dimension_policy` ENUM('exact', 'recommended', 'free') NOT NULL DEFAULT 'recommended',
  ADD COLUMN `required_alpha` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `current_draft_version_id` VARCHAR(36) NULL,
  ADD COLUMN `published_version_id` VARCHAR(36) NULL,
  ADD COLUMN `row_version` INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN `deleted_at` DATETIME(3) NULL;

UPDATE `content_art_resource`
SET
  `expected_width` = `width`,
  `expected_height` = `height`,
  `required_alpha` = `transparent`
WHERE `expected_width` IS NULL AND `expected_height` IS NULL;

CREATE TABLE `content_art_resource_version` (
  `id` VARCHAR(36) NOT NULL,
  `art_key` VARCHAR(160) NOT NULL,
  `version_no` INTEGER NOT NULL,
  `original_filename` VARCHAR(255) NOT NULL,
  `stored_filename` VARCHAR(255) NOT NULL,
  `storage_path` VARCHAR(255) NOT NULL,
  `thumbnail_path` VARCHAR(255) NULL,
  `mime_type` VARCHAR(120) NOT NULL,
  `file_extension` VARCHAR(20) NOT NULL,
  `size_bytes` INTEGER NOT NULL,
  `actual_width` INTEGER NOT NULL,
  `actual_height` INTEGER NOT NULL,
  `has_alpha` BOOLEAN NOT NULL DEFAULT false,
  `checksum` VARCHAR(128) NOT NULL,
  `validation_status` ENUM('valid', 'warning', 'invalid', 'published', 'archived') NOT NULL DEFAULT 'valid',
  `validation_errors_json` JSON NULL,
  `validation_warnings_json` JSON NULL,
  `created_by` VARCHAR(36) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `published_at` DATETIME(3) NULL,
  `archived_at` DATETIME(3) NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `content_art_resource_version_art_key_version_no_key`
ON `content_art_resource_version`(`art_key`, `version_no`);

CREATE INDEX `content_art_resource_version_art_key_idx`
ON `content_art_resource_version`(`art_key`);

CREATE INDEX `content_art_resource_version_checksum_idx`
ON `content_art_resource_version`(`checksum`);

INSERT INTO `content_art_resource_version` (
  `id`, `art_key`, `version_no`, `original_filename`, `stored_filename`,
  `storage_path`, `mime_type`, `file_extension`, `size_bytes`, `actual_width`,
  `actual_height`, `has_alpha`, `checksum`, `validation_status`, `published_at`
)
SELECT
  LOWER(LEFT(MD5(CONCAT('init:', `art_key`)), 32)),
  `art_key`, 1, SUBSTRING_INDEX(`physical_path`, '/', -1), SUBSTRING_INDEX(`physical_path`, '/', -1),
  `physical_path`, 'image/png', '.png', 0, COALESCE(`width`, 0), COALESCE(`height`, 0),
  `transparent`, COALESCE(`checksum`, LOWER(LEFT(MD5(CONCAT('legacy:', `art_key`, ':', COALESCE(`physical_path`, ''))), 64))),
  'published', CURRENT_TIMESTAMP(3)
FROM `content_art_resource`
WHERE `physical_path` IS NOT NULL AND `resource_status` = 'physical';

UPDATE `content_art_resource`
SET
  `current_draft_version_id` = LOWER(LEFT(MD5(CONCAT('init:', `art_key`)), 32)),
  `published_version_id` = LOWER(LEFT(MD5(CONCAT('init:', `art_key`)), 32))
WHERE `physical_path` IS NOT NULL AND `resource_status` = 'physical';

ALTER TABLE `content_art_resource_version`
  ADD CONSTRAINT `content_art_resource_version_art_key_fkey`
  FOREIGN KEY (`art_key`) REFERENCES `content_art_resource`(`art_key`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `content_art_resource`
  ADD CONSTRAINT `content_art_resource_current_draft_version_id_fkey`
  FOREIGN KEY (`current_draft_version_id`) REFERENCES `content_art_resource_version`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `content_art_resource_published_version_id_fkey`
  FOREIGN KEY (`published_version_id`) REFERENCES `content_art_resource_version`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
