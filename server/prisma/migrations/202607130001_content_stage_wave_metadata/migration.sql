ALTER TABLE `content_stage_wave`
  ADD COLUMN `wave_key` VARCHAR(80) NULL,
  ADD COLUMN `name` VARCHAR(120) NULL,
  ADD COLUMN `message` VARCHAR(255) NULL,
  ADD COLUMN `spawn_delay` DOUBLE NULL;

UPDATE `content_stage_wave`
SET `wave_key` = '1-1-w1',
    `name` = '训练鼠群',
    `message` = '第 1 波机械鼠出现！',
    `spawn_delay` = 0
WHERE `stage_id` = 'stage_battle_1_1' AND `wave_no` = 1;

UPDATE `content_stage_wave`
SET `wave_key` = '1-1-w2',
    `name` = '左右夹击',
    `message` = '第 2 波左右夹击！',
    `spawn_delay` = 1
WHERE `stage_id` = 'stage_battle_1_1' AND `wave_no` = 2;

UPDATE `content_stage_wave`
SET `wave_key` = '1-1-w3',
    `name` = '强化收尾',
    `message` = '最后一波强化鼠加入！',
    `spawn_delay` = 1.2
WHERE `stage_id` = 'stage_battle_1_1' AND `wave_no` = 3;
