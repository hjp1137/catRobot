-- Task30: active Campaign stages are free-map drafts. Published snapshots remain untouched.
UPDATE content_stage
SET mode = 'explore', world_width = 1800, world_height = 2800,
    content_version = content_version + 1
WHERE id = 'stage_battle_1_1' AND deleted_at IS NULL;

UPDATE content_stage_scene_layout
SET scene_mode = 'exploration', canvas_width = 1800, canvas_height = 2800,
    battle_area_json = JSON_OBJECT('x', 0, 'y', 0, 'width', 1800, 'height', 2800),
    camera_json = JSON_OBJECT('mode', 'follow', 'clampToWorld', true),
    content_version = content_version + 1, row_version = row_version + 1
WHERE stage_id = 'stage_battle_1_1';

INSERT INTO content_explore_spawn_group
  (id, stage_id, group_key, enemy_template_id, spawn_x, spawn_y, spawn_radius, initial_count, max_alive, respawn_interval, sort_order, created_at, updated_at)
SELECT UUID(), 'stage_battle_1_1', 'forge_a01', 'enemy_scrap_mouse_01', 420, 620, 160, 2, 3, 5000, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM content_explore_spawn_group WHERE stage_id = 'stage_battle_1_1' AND group_key = 'forge_a01');
