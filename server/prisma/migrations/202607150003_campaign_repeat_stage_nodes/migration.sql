DROP INDEX `content_campaign_stage_node_chapter_id_stage_id_key`
  ON `content_campaign_stage_node`;

CREATE INDEX `content_campaign_stage_node_chapter_id_stage_id_idx`
  ON `content_campaign_stage_node`(`chapter_id`, `stage_id`);
