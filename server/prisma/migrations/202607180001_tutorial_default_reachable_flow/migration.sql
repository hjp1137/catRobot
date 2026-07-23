UPDATE `content_tutorial_step`
SET `trigger_type` = 'page.campaign', `trigger_json` = JSON_OBJECT('event', 'page.campaign'),
    `row_version` = `row_version` + 1, `content_version` = `content_version` + 1, `updated_at` = CURRENT_TIMESTAMP(3)
WHERE `flow_id` = 'tutorial.main.firstJourney' AND `id` = 'tutorial.openCampaign' AND `deleted_at` IS NULL;

UPDATE `content_tutorial_step`
SET `trigger_type` = 'page.campaign', `trigger_json` = JSON_OBJECT('event', 'page.campaign'),
    `target_id` = 'campaign.back', `name` = '返回车库', `title` = '返回车库',
    `body` = '返回车库查看已解锁功能。', `completion_type` = 'target.clicked',
    `completion_json` = JSON_OBJECT('event', 'target.clicked'),
    `row_version` = `row_version` + 1, `content_version` = `content_version` + 1, `updated_at` = CURRENT_TIMESTAMP(3)
WHERE `flow_id` = 'tutorial.main.firstJourney' AND `id` = 'tutorial.inventory' AND `deleted_at` IS NULL;

UPDATE `content_tutorial_step`
SET `trigger_type` = 'page.home', `trigger_json` = JSON_OBJECT('event', 'page.home'),
    `body` = '打开装备舱。', `completion_type` = 'target.clicked',
    `completion_json` = JSON_OBJECT('event', 'target.clicked'),
    `row_version` = `row_version` + 1, `content_version` = `content_version` + 1, `updated_at` = CURRENT_TIMESTAMP(3)
WHERE `flow_id` = 'tutorial.main.firstJourney' AND `id` = 'tutorial.equipment' AND `deleted_at` IS NULL;

UPDATE `content_tutorial_step`
SET `trigger_type` = 'page.inventory', `trigger_json` = JSON_OBJECT('event', 'page.inventory'),
    `target_id` = 'equipment.inventory.first', `body` = '选择并穿戴首件战利品。',
    `completion_type` = 'equipment.equipped', `completion_json` = JSON_OBJECT('event', 'equipment.equipped'),
    `block_input` = false, `row_version` = `row_version` + 1,
    `content_version` = `content_version` + 1, `updated_at` = CURRENT_TIMESTAMP(3)
WHERE `flow_id` = 'tutorial.main.firstJourney' AND `id` = 'tutorial.complete' AND `deleted_at` IS NULL;

UPDATE `content_system_state`
SET `draft_revision` = `draft_revision` + 1, `draft_dirty` = true
WHERE `id` = 'singleton';
