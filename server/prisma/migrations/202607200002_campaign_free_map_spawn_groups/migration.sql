-- Complete the first chapter free-map draft with distributed enemy spawn groups.
INSERT INTO content_explore_spawn_group
  (id, stage_id, group_key, enemy_template_id, spawn_x, spawn_y, spawn_radius, initial_count, max_alive, respawn_interval, sort_order, created_at, updated_at)
SELECT UUID(), 'stage_battle_1_1', 'forge_c03', 'enemy_scrap_mouse_01', 720, 1220, 170, 2, 3, 5600, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM content_explore_spawn_group WHERE stage_id = 'stage_battle_1_1' AND group_key = 'forge_c03');

INSERT INTO content_explore_spawn_group
  (id, stage_id, group_key, enemy_template_id, spawn_x, spawn_y, spawn_radius, initial_count, max_alive, respawn_interval, sort_order, created_at, updated_at)
SELECT UUID(), 'stage_battle_1_1', 'forge_d04', 'enemy_scrap_mouse_01', 1260, 1760, 180, 2, 4, 6500, 2, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM content_explore_spawn_group WHERE stage_id = 'stage_battle_1_1' AND group_key = 'forge_d04');

INSERT INTO content_explore_spawn_group
  (id, stage_id, group_key, enemy_template_id, spawn_x, spawn_y, spawn_radius, initial_count, max_alive, respawn_interval, sort_order, created_at, updated_at)
SELECT UUID(), 'stage_battle_1_1', 'forge_e05', 'enemy_scrap_guard_elite_01', 860, 2380, 160, 1, 2, 8000, 3, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM content_explore_spawn_group WHERE stage_id = 'stage_battle_1_1' AND group_key = 'forge_e05');
