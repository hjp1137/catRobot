ALTER TABLE `content_tutorial_step`
  ADD COLUMN `campaign_id` VARCHAR(80) NULL,
  ADD COLUMN `force` BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX `content_tutorial_step_campaign_id_idx`
  ON `content_tutorial_step`(`campaign_id`);
