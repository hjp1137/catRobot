import type { StageOrchestrationSnapshot } from '../models/StageOrchestration';

export const STAGE_ORCHESTRATION_SNAPSHOT: StageOrchestrationSnapshot = {
  "checksum": "0f9f23aaa63cd5106d61e61abcfbbda91c2ff9b399ed06272a4bb7431290a5e7",
  "generatedAt": "2026-07-30T16:15:51.783Z",
  "releaseId": "cms7ptkve0000c2fw8uau019n",
  "releaseVersion": "R000027",
  "schemaVersion": 1,
  "stages": [
    {
      "completionRule": {
        "type": "all-waves-cleared"
      },
      "failureRule": {
        "type": "hero-dead"
      },
      "layers": [
        {
          "artKey": "map.trainingGround.overhead",
          "enabled": true,
          "height": 2800,
          "id": "stage-map",
          "name": "俯视工业战术地图",
          "opacity": 1,
          "order": 0,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "ground",
          "width": 1800,
          "x": 0,
          "y": 0
        },
        {
          "enabled": true,
          "height": 820,
          "id": "press-blocker",
          "name": "中央压装台",
          "opacity": 0,
          "order": 1,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 600,
          "x": 600,
          "y": 280
        },
        {
          "enabled": true,
          "height": 840,
          "id": "cargo-blocker",
          "name": "左侧货箱区",
          "opacity": 0,
          "order": 2,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 450,
          "x": 70,
          "y": 1040
        },
        {
          "enabled": true,
          "height": 740,
          "id": "generator-blocker",
          "name": "右侧发电机",
          "opacity": 0,
          "order": 3,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 480,
          "x": 1190,
          "y": 1160
        },
        {
          "enabled": true,
          "height": 250,
          "id": "barrier-blocker",
          "name": "下方检修栏",
          "opacity": 0,
          "order": 4,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 760,
          "x": 500,
          "y": 2200
        }
      ],
      "layout": {
        "backgroundThemeId": "background_training_ground_v1",
        "battleArea": {
          "height": 2800,
          "width": 1800,
          "x": 0,
          "y": 0
        },
        "camera": {
          "clampToWorld": true,
          "exploreHud": {
            "layout": "tactical",
            "panelOpacity": 0.82,
            "showSkillLabels": true,
            "showWaveNotice": false,
            "skillButtonBottom": 24,
            "skillButtonGap": 14,
            "skillButtonRight": 18,
            "skillButtonShape": "hex",
            "skillButtonSize": 68,
            "theme": "industrial"
          },
          "mode": "follow"
        },
        "canvasHeight": 2800,
        "canvasWidth": 1800,
        "enabled": true,
        "exploreHud": {
          "layout": "tactical",
          "panelOpacity": 0.82,
          "showSkillLabels": true,
          "showWaveNotice": false,
          "skillButtonBottom": 24,
          "skillButtonGap": 14,
          "skillButtonRight": 18,
          "skillButtonShape": "hex",
          "skillButtonSize": 68,
          "theme": "industrial"
        },
        "heroSpawnPointId": "hero_start",
        "sceneMode": "exploration",
        "stageId": "stage_battle_1_1",
        "version": 1
      },
      "schemaVersion": 1,
      "spawnPoints": [
        {
          "enabled": true,
          "facing": "right",
          "id": "hero_start",
          "name": "主角出生点",
          "type": "hero",
          "x": 900,
          "y": 1540
        },
        {
          "enabled": true,
          "facing": "right",
          "id": "enemy_left",
          "name": "左侧入口",
          "type": "enemy",
          "x": 280,
          "y": 420
        },
        {
          "enabled": true,
          "facing": "left",
          "id": "enemy_right",
          "name": "右侧入口",
          "type": "enemy",
          "x": 1540,
          "y": 520
        },
        {
          "enabled": true,
          "facing": "down",
          "id": "enemy_top",
          "name": "上方入口",
          "type": "enemy",
          "x": 900,
          "y": 180
        }
      ],
      "stageId": "stage_battle_1_1",
      "waves": [
        {
          "completionDelayMs": 600,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.3,
              "count": 4,
              "elite": false,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_mouse_01",
              "hpMultiplier": 1.1,
              "id": "entry_1",
              "initialDelayMs": 0,
              "levelMultiplier": 1.2,
              "spawnIntervalMs": 650,
              "spawnPointId": "enemy_right"
            }
          ],
          "id": "wave_1",
          "maxAlive": 4,
          "name": "第一波-26.1验收",
          "nextWave": "next",
          "order": 1,
          "startDelayMs": 0,
          "startTrigger": {
            "type": "stage-start"
          }
        },
        {
          "completionDelayMs": 600,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.1,
              "count": 4,
              "elite": false,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_mouse_01",
              "hpMultiplier": 1.1,
              "id": "entry_2",
              "initialDelayMs": 0,
              "levelMultiplier": 1.1,
              "spawnIntervalMs": 450,
              "spawnPointId": "enemy_right"
            }
          ],
          "id": "wave_2",
          "maxAlive": 5,
          "name": "第2波 双侧夹击",
          "nextWave": "next",
          "order": 2,
          "startDelayMs": 800,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        },
        {
          "completionDelayMs": 600,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.25,
              "count": 1,
              "elite": true,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_guard_elite_01",
              "hpMultiplier": 1.25,
              "id": "entry_3",
              "initialDelayMs": 0,
              "levelMultiplier": 1.25,
              "spawnIntervalMs": 0,
              "spawnPointId": "enemy_top"
            }
          ],
          "id": "wave_3",
          "maxAlive": 4,
          "name": "第3波 精英收束",
          "nextWave": "next",
          "order": 3,
          "startDelayMs": 900,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        }
      ]
    },
    {
      "completionRule": {
        "type": "all-waves-cleared"
      },
      "failureRule": {
        "type": "hero-dead"
      },
      "layers": [
        {
          "artKey": "map.trainingGround.overhead",
          "enabled": true,
          "height": 2800,
          "id": "stage-map",
          "name": "俯视工业战术地图",
          "opacity": 1,
          "order": 0,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "ground",
          "width": 1800,
          "x": 0,
          "y": 0
        },
        {
          "enabled": true,
          "height": 820,
          "id": "press-blocker",
          "name": "中央压装台",
          "opacity": 0,
          "order": 1,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 600,
          "x": 600,
          "y": 280
        },
        {
          "enabled": true,
          "height": 840,
          "id": "cargo-blocker",
          "name": "左侧货箱区",
          "opacity": 0,
          "order": 2,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 450,
          "x": 70,
          "y": 1040
        },
        {
          "enabled": true,
          "height": 740,
          "id": "generator-blocker",
          "name": "右侧发电机",
          "opacity": 0,
          "order": 3,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 480,
          "x": 1190,
          "y": 1160
        },
        {
          "enabled": true,
          "height": 250,
          "id": "barrier-blocker",
          "name": "下方检修栏",
          "opacity": 0,
          "order": 4,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 760,
          "x": 500,
          "y": 2200
        }
      ],
      "layout": {
        "backgroundThemeId": "background_training_ground_v1",
        "battleArea": {
          "height": 2800,
          "width": 1800,
          "x": 0,
          "y": 0
        },
        "camera": {
          "clampToWorld": true,
          "exploreHud": {
            "layout": "tactical",
            "panelOpacity": 0.82,
            "showSkillLabels": true,
            "showWaveNotice": false,
            "skillButtonBottom": 24,
            "skillButtonGap": 14,
            "skillButtonRight": 18,
            "skillButtonShape": "hex",
            "skillButtonSize": 68,
            "theme": "industrial"
          },
          "mode": "follow"
        },
        "canvasHeight": 2800,
        "canvasWidth": 1800,
        "enabled": true,
        "exploreHud": {
          "layout": "tactical",
          "panelOpacity": 0.82,
          "showSkillLabels": true,
          "showWaveNotice": false,
          "skillButtonBottom": 24,
          "skillButtonGap": 14,
          "skillButtonRight": 18,
          "skillButtonShape": "hex",
          "skillButtonSize": 68,
          "theme": "industrial"
        },
        "heroSpawnPointId": "hero_start",
        "sceneMode": "exploration",
        "stageId": "stage_ch1_02",
        "version": 1
      },
      "schemaVersion": 1,
      "spawnPoints": [
        {
          "enabled": true,
          "facing": "up",
          "id": "hero_start",
          "name": "主角出生点",
          "type": "hero",
          "x": 900,
          "y": 2380
        },
        {
          "enabled": true,
          "facing": "right",
          "id": "enemy_left",
          "name": "西侧入口",
          "type": "enemy",
          "x": 300,
          "y": 760
        },
        {
          "enabled": true,
          "facing": "left",
          "id": "enemy_right",
          "name": "东侧入口",
          "type": "enemy",
          "x": 1500,
          "y": 980
        },
        {
          "enabled": true,
          "facing": "down",
          "id": "enemy_top",
          "name": "北侧入口",
          "type": "enemy",
          "x": 900,
          "y": 380
        }
      ],
      "stageId": "stage_ch1_02",
      "waves": [
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.1,
              "count": 4,
              "elite": false,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_mouse_01",
              "hpMultiplier": 1.1,
              "id": "entry_1",
              "initialDelayMs": 0,
              "levelMultiplier": 1.1,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_left"
            }
          ],
          "id": "wave_1",
          "maxAlive": 5,
          "name": "第1波 鼠群推进",
          "nextWave": "next",
          "order": 1,
          "startDelayMs": 0,
          "startTrigger": {
            "type": "stage-start"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.18,
              "count": 5,
              "elite": false,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_mouse_01",
              "hpMultiplier": 1.18,
              "id": "entry_2",
              "initialDelayMs": 0,
              "levelMultiplier": 1.18,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_right"
            }
          ],
          "id": "wave_2",
          "maxAlive": 5,
          "name": "第2波 鼠群推进",
          "nextWave": "next",
          "order": 2,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.26,
              "count": 6,
              "elite": false,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_bug_01",
              "hpMultiplier": 1.26,
              "id": "entry_3",
              "initialDelayMs": 0,
              "levelMultiplier": 1.26,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_top"
            }
          ],
          "id": "wave_3",
          "maxAlive": 5,
          "name": "第3波 甲虫夹击",
          "nextWave": "stage-clear",
          "order": 3,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        }
      ]
    },
    {
      "completionRule": {
        "type": "all-waves-cleared"
      },
      "failureRule": {
        "type": "hero-dead"
      },
      "layers": [
        {
          "artKey": "map.trainingGround.overhead",
          "enabled": true,
          "height": 2800,
          "id": "stage-map",
          "name": "俯视工业战术地图",
          "opacity": 1,
          "order": 0,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "ground",
          "width": 1800,
          "x": 0,
          "y": 0
        },
        {
          "enabled": true,
          "height": 820,
          "id": "press-blocker",
          "name": "中央压装台",
          "opacity": 0,
          "order": 1,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 600,
          "x": 600,
          "y": 280
        },
        {
          "enabled": true,
          "height": 840,
          "id": "cargo-blocker",
          "name": "左侧货箱区",
          "opacity": 0,
          "order": 2,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 450,
          "x": 70,
          "y": 1040
        },
        {
          "enabled": true,
          "height": 740,
          "id": "generator-blocker",
          "name": "右侧发电机",
          "opacity": 0,
          "order": 3,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 480,
          "x": 1190,
          "y": 1160
        },
        {
          "enabled": true,
          "height": 250,
          "id": "barrier-blocker",
          "name": "下方检修栏",
          "opacity": 0,
          "order": 4,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 760,
          "x": 500,
          "y": 2200
        }
      ],
      "layout": {
        "backgroundThemeId": "background_training_ground_v1",
        "battleArea": {
          "height": 2800,
          "width": 1800,
          "x": 0,
          "y": 0
        },
        "camera": {
          "clampToWorld": true,
          "exploreHud": {
            "layout": "tactical",
            "panelOpacity": 0.82,
            "showSkillLabels": true,
            "showWaveNotice": false,
            "skillButtonBottom": 24,
            "skillButtonGap": 14,
            "skillButtonRight": 18,
            "skillButtonShape": "hex",
            "skillButtonSize": 68,
            "theme": "industrial"
          },
          "mode": "follow"
        },
        "canvasHeight": 2800,
        "canvasWidth": 1800,
        "enabled": true,
        "exploreHud": {
          "layout": "tactical",
          "panelOpacity": 0.82,
          "showSkillLabels": true,
          "showWaveNotice": false,
          "skillButtonBottom": 24,
          "skillButtonGap": 14,
          "skillButtonRight": 18,
          "skillButtonShape": "hex",
          "skillButtonSize": 68,
          "theme": "industrial"
        },
        "heroSpawnPointId": "hero_start",
        "sceneMode": "exploration",
        "stageId": "stage_ch1_03",
        "version": 1
      },
      "schemaVersion": 1,
      "spawnPoints": [
        {
          "enabled": true,
          "facing": "up",
          "id": "hero_start",
          "name": "主角出生点",
          "type": "hero",
          "x": 900,
          "y": 2380
        },
        {
          "enabled": true,
          "facing": "right",
          "id": "enemy_left",
          "name": "西侧入口",
          "type": "enemy",
          "x": 300,
          "y": 760
        },
        {
          "enabled": true,
          "facing": "left",
          "id": "enemy_right",
          "name": "东侧入口",
          "type": "enemy",
          "x": 1500,
          "y": 980
        },
        {
          "enabled": true,
          "facing": "down",
          "id": "enemy_top",
          "name": "北侧入口",
          "type": "enemy",
          "x": 900,
          "y": 380
        }
      ],
      "stageId": "stage_ch1_03",
      "waves": [
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.2,
              "count": 4,
              "elite": false,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_mouse_01",
              "hpMultiplier": 1.2,
              "id": "entry_1",
              "initialDelayMs": 0,
              "levelMultiplier": 1.2,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_left"
            }
          ],
          "id": "wave_1",
          "maxAlive": 6,
          "name": "第1波 鼠群推进",
          "nextWave": "next",
          "order": 1,
          "startDelayMs": 0,
          "startTrigger": {
            "type": "stage-start"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.28,
              "count": 5,
              "elite": false,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_bug_01",
              "hpMultiplier": 1.28,
              "id": "entry_2",
              "initialDelayMs": 0,
              "levelMultiplier": 1.28,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_right"
            }
          ],
          "id": "wave_2",
          "maxAlive": 6,
          "name": "第2波 甲虫夹击",
          "nextWave": "next",
          "order": 2,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.36,
              "count": 6,
              "elite": false,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_bug_01",
              "hpMultiplier": 1.36,
              "id": "entry_3",
              "initialDelayMs": 0,
              "levelMultiplier": 1.36,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_top"
            }
          ],
          "id": "wave_3",
          "maxAlive": 6,
          "name": "第3波 甲虫夹击",
          "nextWave": "stage-clear",
          "order": 3,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        }
      ]
    },
    {
      "completionRule": {
        "type": "all-waves-cleared"
      },
      "failureRule": {
        "type": "hero-dead"
      },
      "layers": [
        {
          "artKey": "map.trainingGround.overhead",
          "enabled": true,
          "height": 2800,
          "id": "stage-map",
          "name": "俯视工业战术地图",
          "opacity": 1,
          "order": 0,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "ground",
          "width": 1800,
          "x": 0,
          "y": 0
        },
        {
          "enabled": true,
          "height": 820,
          "id": "press-blocker",
          "name": "中央压装台",
          "opacity": 0,
          "order": 1,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 600,
          "x": 600,
          "y": 280
        },
        {
          "enabled": true,
          "height": 840,
          "id": "cargo-blocker",
          "name": "左侧货箱区",
          "opacity": 0,
          "order": 2,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 450,
          "x": 70,
          "y": 1040
        },
        {
          "enabled": true,
          "height": 740,
          "id": "generator-blocker",
          "name": "右侧发电机",
          "opacity": 0,
          "order": 3,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 480,
          "x": 1190,
          "y": 1160
        },
        {
          "enabled": true,
          "height": 250,
          "id": "barrier-blocker",
          "name": "下方检修栏",
          "opacity": 0,
          "order": 4,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 760,
          "x": 500,
          "y": 2200
        }
      ],
      "layout": {
        "backgroundThemeId": "background_training_ground_v1",
        "battleArea": {
          "height": 2800,
          "width": 1800,
          "x": 0,
          "y": 0
        },
        "camera": {
          "clampToWorld": true,
          "exploreHud": {
            "layout": "tactical",
            "panelOpacity": 0.82,
            "showSkillLabels": true,
            "showWaveNotice": false,
            "skillButtonBottom": 24,
            "skillButtonGap": 14,
            "skillButtonRight": 18,
            "skillButtonShape": "hex",
            "skillButtonSize": 68,
            "theme": "industrial"
          },
          "mode": "follow"
        },
        "canvasHeight": 2800,
        "canvasWidth": 1800,
        "enabled": true,
        "exploreHud": {
          "layout": "tactical",
          "panelOpacity": 0.82,
          "showSkillLabels": true,
          "showWaveNotice": false,
          "skillButtonBottom": 24,
          "skillButtonGap": 14,
          "skillButtonRight": 18,
          "skillButtonShape": "hex",
          "skillButtonSize": 68,
          "theme": "industrial"
        },
        "heroSpawnPointId": "hero_start",
        "sceneMode": "exploration",
        "stageId": "stage_ch1_04",
        "version": 1
      },
      "schemaVersion": 1,
      "spawnPoints": [
        {
          "enabled": true,
          "facing": "up",
          "id": "hero_start",
          "name": "主角出生点",
          "type": "hero",
          "x": 900,
          "y": 2380
        },
        {
          "enabled": true,
          "facing": "right",
          "id": "enemy_left",
          "name": "西侧入口",
          "type": "enemy",
          "x": 300,
          "y": 760
        },
        {
          "enabled": true,
          "facing": "left",
          "id": "enemy_right",
          "name": "东侧入口",
          "type": "enemy",
          "x": 1500,
          "y": 980
        },
        {
          "enabled": true,
          "facing": "down",
          "id": "enemy_top",
          "name": "北侧入口",
          "type": "enemy",
          "x": 900,
          "y": 380
        }
      ],
      "stageId": "stage_ch1_04",
      "waves": [
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.3,
              "count": 5,
              "elite": false,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_bug_01",
              "hpMultiplier": 1.3,
              "id": "entry_1",
              "initialDelayMs": 0,
              "levelMultiplier": 1.3,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_left"
            }
          ],
          "id": "wave_1",
          "maxAlive": 6,
          "name": "第1波 甲虫夹击",
          "nextWave": "next",
          "order": 1,
          "startDelayMs": 0,
          "startTrigger": {
            "type": "stage-start"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.38,
              "count": 6,
              "elite": false,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_bug_01",
              "hpMultiplier": 1.38,
              "id": "entry_2",
              "initialDelayMs": 0,
              "levelMultiplier": 1.38,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_right"
            }
          ],
          "id": "wave_2",
          "maxAlive": 6,
          "name": "第2波 甲虫夹击",
          "nextWave": "next",
          "order": 2,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.46,
              "count": 7,
              "elite": false,
              "enabled": true,
              "enemyTemplateId": "enemy_drone_eye_01",
              "hpMultiplier": 1.46,
              "id": "entry_3",
              "initialDelayMs": 0,
              "levelMultiplier": 1.46,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_top"
            }
          ],
          "id": "wave_3",
          "maxAlive": 6,
          "name": "第3波 侦察火网",
          "nextWave": "next",
          "order": 3,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.54,
              "count": 8,
              "elite": false,
              "enabled": true,
              "enemyTemplateId": "enemy_drone_eye_01",
              "hpMultiplier": 1.54,
              "id": "entry_4",
              "initialDelayMs": 0,
              "levelMultiplier": 1.54,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_left"
            }
          ],
          "id": "wave_4",
          "maxAlive": 6,
          "name": "第4波 侦察火网",
          "nextWave": "stage-clear",
          "order": 4,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        }
      ]
    },
    {
      "completionRule": {
        "type": "all-waves-cleared"
      },
      "failureRule": {
        "type": "hero-dead"
      },
      "layers": [
        {
          "artKey": "map.trainingGround.overhead",
          "enabled": true,
          "height": 2800,
          "id": "stage-map",
          "name": "俯视工业战术地图",
          "opacity": 1,
          "order": 0,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "ground",
          "width": 1800,
          "x": 0,
          "y": 0
        },
        {
          "enabled": true,
          "height": 820,
          "id": "press-blocker",
          "name": "中央压装台",
          "opacity": 0,
          "order": 1,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 600,
          "x": 600,
          "y": 280
        },
        {
          "enabled": true,
          "height": 840,
          "id": "cargo-blocker",
          "name": "左侧货箱区",
          "opacity": 0,
          "order": 2,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 450,
          "x": 70,
          "y": 1040
        },
        {
          "enabled": true,
          "height": 740,
          "id": "generator-blocker",
          "name": "右侧发电机",
          "opacity": 0,
          "order": 3,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 480,
          "x": 1190,
          "y": 1160
        },
        {
          "enabled": true,
          "height": 250,
          "id": "barrier-blocker",
          "name": "下方检修栏",
          "opacity": 0,
          "order": 4,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 760,
          "x": 500,
          "y": 2200
        }
      ],
      "layout": {
        "backgroundThemeId": "background_training_ground_v1",
        "battleArea": {
          "height": 2800,
          "width": 1800,
          "x": 0,
          "y": 0
        },
        "camera": {
          "clampToWorld": true,
          "exploreHud": {
            "layout": "tactical",
            "panelOpacity": 0.82,
            "showSkillLabels": true,
            "showWaveNotice": false,
            "skillButtonBottom": 24,
            "skillButtonGap": 14,
            "skillButtonRight": 18,
            "skillButtonShape": "hex",
            "skillButtonSize": 68,
            "theme": "industrial"
          },
          "mode": "follow"
        },
        "canvasHeight": 2800,
        "canvasWidth": 1800,
        "enabled": true,
        "exploreHud": {
          "layout": "tactical",
          "panelOpacity": 0.82,
          "showSkillLabels": true,
          "showWaveNotice": false,
          "skillButtonBottom": 24,
          "skillButtonGap": 14,
          "skillButtonRight": 18,
          "skillButtonShape": "hex",
          "skillButtonSize": 68,
          "theme": "industrial"
        },
        "heroSpawnPointId": "hero_start",
        "sceneMode": "exploration",
        "stageId": "stage_ch1_05",
        "version": 1
      },
      "schemaVersion": 1,
      "spawnPoints": [
        {
          "enabled": true,
          "facing": "up",
          "id": "hero_start",
          "name": "主角出生点",
          "type": "hero",
          "x": 900,
          "y": 2380
        },
        {
          "enabled": true,
          "facing": "right",
          "id": "enemy_left",
          "name": "西侧入口",
          "type": "enemy",
          "x": 300,
          "y": 760
        },
        {
          "enabled": true,
          "facing": "left",
          "id": "enemy_right",
          "name": "东侧入口",
          "type": "enemy",
          "x": 1500,
          "y": 980
        },
        {
          "enabled": true,
          "facing": "down",
          "id": "enemy_top",
          "name": "北侧入口",
          "type": "enemy",
          "x": 900,
          "y": 380
        }
      ],
      "stageId": "stage_ch1_05",
      "waves": [
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.4,
              "count": 5,
              "elite": false,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_bug_01",
              "hpMultiplier": 1.4,
              "id": "entry_1",
              "initialDelayMs": 0,
              "levelMultiplier": 1.4,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_left"
            }
          ],
          "id": "wave_1",
          "maxAlive": 6,
          "name": "第1波 甲虫夹击",
          "nextWave": "next",
          "order": 1,
          "startDelayMs": 0,
          "startTrigger": {
            "type": "stage-start"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.48,
              "count": 6,
              "elite": false,
              "enabled": true,
              "enemyTemplateId": "enemy_drone_eye_01",
              "hpMultiplier": 1.48,
              "id": "entry_2",
              "initialDelayMs": 0,
              "levelMultiplier": 1.48,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_right"
            }
          ],
          "id": "wave_2",
          "maxAlive": 6,
          "name": "第2波 侦察火网",
          "nextWave": "next",
          "order": 2,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.56,
              "count": 7,
              "elite": false,
              "enabled": true,
              "enemyTemplateId": "enemy_drone_eye_01",
              "hpMultiplier": 1.56,
              "id": "entry_3",
              "initialDelayMs": 0,
              "levelMultiplier": 1.56,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_top"
            }
          ],
          "id": "wave_3",
          "maxAlive": 6,
          "name": "第3波 侦察火网",
          "nextWave": "next",
          "order": 3,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.64,
              "count": 8,
              "elite": true,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_guard_elite_01",
              "hpMultiplier": 1.64,
              "id": "entry_4",
              "initialDelayMs": 0,
              "levelMultiplier": 1.64,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_left"
            }
          ],
          "id": "wave_4",
          "maxAlive": 6,
          "name": "第4波 精英压制",
          "nextWave": "stage-clear",
          "order": 4,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        }
      ]
    },
    {
      "completionRule": {
        "type": "all-waves-cleared"
      },
      "failureRule": {
        "type": "hero-dead"
      },
      "layers": [
        {
          "artKey": "map.trainingGround.overhead",
          "enabled": true,
          "height": 2800,
          "id": "stage-map",
          "name": "俯视工业战术地图",
          "opacity": 1,
          "order": 0,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "ground",
          "width": 1800,
          "x": 0,
          "y": 0
        },
        {
          "enabled": true,
          "height": 820,
          "id": "press-blocker",
          "name": "中央压装台",
          "opacity": 0,
          "order": 1,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 600,
          "x": 600,
          "y": 280
        },
        {
          "enabled": true,
          "height": 840,
          "id": "cargo-blocker",
          "name": "左侧货箱区",
          "opacity": 0,
          "order": 2,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 450,
          "x": 70,
          "y": 1040
        },
        {
          "enabled": true,
          "height": 740,
          "id": "generator-blocker",
          "name": "右侧发电机",
          "opacity": 0,
          "order": 3,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 480,
          "x": 1190,
          "y": 1160
        },
        {
          "enabled": true,
          "height": 250,
          "id": "barrier-blocker",
          "name": "下方检修栏",
          "opacity": 0,
          "order": 4,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 760,
          "x": 500,
          "y": 2200
        }
      ],
      "layout": {
        "backgroundThemeId": "background_training_ground_v1",
        "battleArea": {
          "height": 2800,
          "width": 1800,
          "x": 0,
          "y": 0
        },
        "camera": {
          "clampToWorld": true,
          "exploreHud": {
            "layout": "tactical",
            "panelOpacity": 0.82,
            "showSkillLabels": true,
            "showWaveNotice": false,
            "skillButtonBottom": 24,
            "skillButtonGap": 14,
            "skillButtonRight": 18,
            "skillButtonShape": "hex",
            "skillButtonSize": 68,
            "theme": "industrial"
          },
          "mode": "follow"
        },
        "canvasHeight": 2800,
        "canvasWidth": 1800,
        "enabled": true,
        "exploreHud": {
          "layout": "tactical",
          "panelOpacity": 0.82,
          "showSkillLabels": true,
          "showWaveNotice": false,
          "skillButtonBottom": 24,
          "skillButtonGap": 14,
          "skillButtonRight": 18,
          "skillButtonShape": "hex",
          "skillButtonSize": 68,
          "theme": "industrial"
        },
        "heroSpawnPointId": "hero_start",
        "sceneMode": "exploration",
        "stageId": "stage_ch1_06",
        "version": 1
      },
      "schemaVersion": 1,
      "spawnPoints": [
        {
          "enabled": true,
          "facing": "up",
          "id": "hero_start",
          "name": "主角出生点",
          "type": "hero",
          "x": 900,
          "y": 2380
        },
        {
          "enabled": true,
          "facing": "right",
          "id": "enemy_left",
          "name": "西侧入口",
          "type": "enemy",
          "x": 300,
          "y": 760
        },
        {
          "enabled": true,
          "facing": "left",
          "id": "enemy_right",
          "name": "东侧入口",
          "type": "enemy",
          "x": 1500,
          "y": 980
        },
        {
          "enabled": true,
          "facing": "down",
          "id": "enemy_top",
          "name": "北侧入口",
          "type": "enemy",
          "x": 900,
          "y": 380
        }
      ],
      "stageId": "stage_ch1_06",
      "waves": [
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.5,
              "count": 6,
              "elite": false,
              "enabled": true,
              "enemyTemplateId": "enemy_drone_eye_01",
              "hpMultiplier": 1.5,
              "id": "entry_1",
              "initialDelayMs": 0,
              "levelMultiplier": 1.5,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_left"
            }
          ],
          "id": "wave_1",
          "maxAlive": 7,
          "name": "第1波 侦察火网",
          "nextWave": "next",
          "order": 1,
          "startDelayMs": 0,
          "startTrigger": {
            "type": "stage-start"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.58,
              "count": 7,
              "elite": false,
              "enabled": true,
              "enemyTemplateId": "enemy_drone_eye_01",
              "hpMultiplier": 1.58,
              "id": "entry_2",
              "initialDelayMs": 0,
              "levelMultiplier": 1.58,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_right"
            }
          ],
          "id": "wave_2",
          "maxAlive": 7,
          "name": "第2波 侦察火网",
          "nextWave": "next",
          "order": 2,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.66,
              "count": 8,
              "elite": true,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_guard_elite_01",
              "hpMultiplier": 1.66,
              "id": "entry_3",
              "initialDelayMs": 0,
              "levelMultiplier": 1.66,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_top"
            }
          ],
          "id": "wave_3",
          "maxAlive": 7,
          "name": "第3波 精英压制",
          "nextWave": "next",
          "order": 3,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.74,
              "count": 8,
              "elite": true,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_guard_elite_01",
              "hpMultiplier": 1.74,
              "id": "entry_4",
              "initialDelayMs": 0,
              "levelMultiplier": 1.74,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_left"
            }
          ],
          "id": "wave_4",
          "maxAlive": 7,
          "name": "第4波 精英压制",
          "nextWave": "stage-clear",
          "order": 4,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        }
      ]
    },
    {
      "completionRule": {
        "type": "all-waves-cleared"
      },
      "failureRule": {
        "type": "hero-dead"
      },
      "layers": [
        {
          "artKey": "map.trainingGround.overhead",
          "enabled": true,
          "height": 2800,
          "id": "stage-map",
          "name": "俯视工业战术地图",
          "opacity": 1,
          "order": 0,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "ground",
          "width": 1800,
          "x": 0,
          "y": 0
        },
        {
          "enabled": true,
          "height": 820,
          "id": "press-blocker",
          "name": "中央压装台",
          "opacity": 0,
          "order": 1,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 600,
          "x": 600,
          "y": 280
        },
        {
          "enabled": true,
          "height": 840,
          "id": "cargo-blocker",
          "name": "左侧货箱区",
          "opacity": 0,
          "order": 2,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 450,
          "x": 70,
          "y": 1040
        },
        {
          "enabled": true,
          "height": 740,
          "id": "generator-blocker",
          "name": "右侧发电机",
          "opacity": 0,
          "order": 3,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 480,
          "x": 1190,
          "y": 1160
        },
        {
          "enabled": true,
          "height": 250,
          "id": "barrier-blocker",
          "name": "下方检修栏",
          "opacity": 0,
          "order": 4,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 760,
          "x": 500,
          "y": 2200
        }
      ],
      "layout": {
        "backgroundThemeId": "background_training_ground_v1",
        "battleArea": {
          "height": 2800,
          "width": 1800,
          "x": 0,
          "y": 0
        },
        "camera": {
          "clampToWorld": true,
          "exploreHud": {
            "layout": "tactical",
            "panelOpacity": 0.82,
            "showSkillLabels": true,
            "showWaveNotice": false,
            "skillButtonBottom": 24,
            "skillButtonGap": 14,
            "skillButtonRight": 18,
            "skillButtonShape": "hex",
            "skillButtonSize": 68,
            "theme": "industrial"
          },
          "mode": "follow"
        },
        "canvasHeight": 2800,
        "canvasWidth": 1800,
        "enabled": true,
        "exploreHud": {
          "layout": "tactical",
          "panelOpacity": 0.82,
          "showSkillLabels": true,
          "showWaveNotice": false,
          "skillButtonBottom": 24,
          "skillButtonGap": 14,
          "skillButtonRight": 18,
          "skillButtonShape": "hex",
          "skillButtonSize": 68,
          "theme": "industrial"
        },
        "heroSpawnPointId": "hero_start",
        "sceneMode": "exploration",
        "stageId": "stage_ch1_07",
        "version": 1
      },
      "schemaVersion": 1,
      "spawnPoints": [
        {
          "enabled": true,
          "facing": "up",
          "id": "hero_start",
          "name": "主角出生点",
          "type": "hero",
          "x": 900,
          "y": 2380
        },
        {
          "enabled": true,
          "facing": "right",
          "id": "enemy_left",
          "name": "西侧入口",
          "type": "enemy",
          "x": 300,
          "y": 760
        },
        {
          "enabled": true,
          "facing": "left",
          "id": "enemy_right",
          "name": "东侧入口",
          "type": "enemy",
          "x": 1500,
          "y": 980
        },
        {
          "enabled": true,
          "facing": "down",
          "id": "enemy_top",
          "name": "北侧入口",
          "type": "enemy",
          "x": 900,
          "y": 380
        }
      ],
      "stageId": "stage_ch1_07",
      "waves": [
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.6,
              "count": 6,
              "elite": false,
              "enabled": true,
              "enemyTemplateId": "enemy_drone_eye_01",
              "hpMultiplier": 1.6,
              "id": "entry_1",
              "initialDelayMs": 0,
              "levelMultiplier": 1.6,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_left"
            }
          ],
          "id": "wave_1",
          "maxAlive": 7,
          "name": "第1波 侦察火网",
          "nextWave": "next",
          "order": 1,
          "startDelayMs": 0,
          "startTrigger": {
            "type": "stage-start"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.68,
              "count": 7,
              "elite": true,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_guard_elite_01",
              "hpMultiplier": 1.68,
              "id": "entry_2",
              "initialDelayMs": 0,
              "levelMultiplier": 1.68,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_right"
            }
          ],
          "id": "wave_2",
          "maxAlive": 7,
          "name": "第2波 精英压制",
          "nextWave": "next",
          "order": 2,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.76,
              "count": 8,
              "elite": true,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_guard_elite_01",
              "hpMultiplier": 1.76,
              "id": "entry_3",
              "initialDelayMs": 0,
              "levelMultiplier": 1.76,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_top"
            }
          ],
          "id": "wave_3",
          "maxAlive": 7,
          "name": "第3波 精英压制",
          "nextWave": "next",
          "order": 3,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.84,
              "count": 8,
              "elite": true,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_guard_elite_01",
              "hpMultiplier": 1.84,
              "id": "entry_4",
              "initialDelayMs": 0,
              "levelMultiplier": 1.84,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_left"
            }
          ],
          "id": "wave_4",
          "maxAlive": 7,
          "name": "第4波 精英压制",
          "nextWave": "stage-clear",
          "order": 4,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        }
      ]
    },
    {
      "completionRule": {
        "type": "all-waves-cleared"
      },
      "failureRule": {
        "type": "hero-dead"
      },
      "layers": [
        {
          "artKey": "map.trainingGround.overhead",
          "enabled": true,
          "height": 2800,
          "id": "stage-map",
          "name": "俯视工业战术地图",
          "opacity": 1,
          "order": 0,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "ground",
          "width": 1800,
          "x": 0,
          "y": 0
        },
        {
          "enabled": true,
          "height": 820,
          "id": "press-blocker",
          "name": "中央压装台",
          "opacity": 0,
          "order": 1,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 600,
          "x": 600,
          "y": 280
        },
        {
          "enabled": true,
          "height": 840,
          "id": "cargo-blocker",
          "name": "左侧货箱区",
          "opacity": 0,
          "order": 2,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 450,
          "x": 70,
          "y": 1040
        },
        {
          "enabled": true,
          "height": 740,
          "id": "generator-blocker",
          "name": "右侧发电机",
          "opacity": 0,
          "order": 3,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 480,
          "x": 1190,
          "y": 1160
        },
        {
          "enabled": true,
          "height": 250,
          "id": "barrier-blocker",
          "name": "下方检修栏",
          "opacity": 0,
          "order": 4,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 760,
          "x": 500,
          "y": 2200
        }
      ],
      "layout": {
        "backgroundThemeId": "background_training_ground_v1",
        "battleArea": {
          "height": 2800,
          "width": 1800,
          "x": 0,
          "y": 0
        },
        "camera": {
          "clampToWorld": true,
          "exploreHud": {
            "layout": "tactical",
            "panelOpacity": 0.82,
            "showSkillLabels": true,
            "showWaveNotice": false,
            "skillButtonBottom": 24,
            "skillButtonGap": 14,
            "skillButtonRight": 18,
            "skillButtonShape": "hex",
            "skillButtonSize": 68,
            "theme": "industrial"
          },
          "mode": "follow"
        },
        "canvasHeight": 2800,
        "canvasWidth": 1800,
        "enabled": true,
        "exploreHud": {
          "layout": "tactical",
          "panelOpacity": 0.82,
          "showSkillLabels": true,
          "showWaveNotice": false,
          "skillButtonBottom": 24,
          "skillButtonGap": 14,
          "skillButtonRight": 18,
          "skillButtonShape": "hex",
          "skillButtonSize": 68,
          "theme": "industrial"
        },
        "heroSpawnPointId": "hero_start",
        "sceneMode": "exploration",
        "stageId": "stage_ch1_08",
        "version": 1
      },
      "schemaVersion": 1,
      "spawnPoints": [
        {
          "enabled": true,
          "facing": "up",
          "id": "hero_start",
          "name": "主角出生点",
          "type": "hero",
          "x": 900,
          "y": 2380
        },
        {
          "enabled": true,
          "facing": "right",
          "id": "enemy_left",
          "name": "西侧入口",
          "type": "enemy",
          "x": 300,
          "y": 760
        },
        {
          "enabled": true,
          "facing": "left",
          "id": "enemy_right",
          "name": "东侧入口",
          "type": "enemy",
          "x": 1500,
          "y": 980
        },
        {
          "enabled": true,
          "facing": "down",
          "id": "enemy_top",
          "name": "北侧入口",
          "type": "enemy",
          "x": 900,
          "y": 380
        }
      ],
      "stageId": "stage_ch1_08",
      "waves": [
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.7,
              "count": 7,
              "elite": true,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_guard_elite_01",
              "hpMultiplier": 1.7,
              "id": "entry_1",
              "initialDelayMs": 0,
              "levelMultiplier": 1.7,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_left"
            }
          ],
          "id": "wave_1",
          "maxAlive": 7,
          "name": "第1波 精英压制",
          "nextWave": "next",
          "order": 1,
          "startDelayMs": 0,
          "startTrigger": {
            "type": "stage-start"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.78,
              "count": 8,
              "elite": true,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_guard_elite_01",
              "hpMultiplier": 1.78,
              "id": "entry_2",
              "initialDelayMs": 0,
              "levelMultiplier": 1.78,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_right"
            }
          ],
          "id": "wave_2",
          "maxAlive": 7,
          "name": "第2波 精英压制",
          "nextWave": "next",
          "order": 2,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.86,
              "count": 8,
              "elite": true,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_guard_elite_01",
              "hpMultiplier": 1.86,
              "id": "entry_3",
              "initialDelayMs": 0,
              "levelMultiplier": 1.86,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_top"
            }
          ],
          "id": "wave_3",
          "maxAlive": 7,
          "name": "第3波 精英压制",
          "nextWave": "next",
          "order": 3,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.94,
              "count": 8,
              "elite": true,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_guard_elite_01",
              "hpMultiplier": 1.94,
              "id": "entry_4",
              "initialDelayMs": 0,
              "levelMultiplier": 1.94,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_left"
            }
          ],
          "id": "wave_4",
          "maxAlive": 7,
          "name": "第4波 精英压制",
          "nextWave": "stage-clear",
          "order": 4,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        }
      ]
    },
    {
      "completionRule": {
        "type": "all-waves-cleared"
      },
      "failureRule": {
        "type": "hero-dead"
      },
      "layers": [
        {
          "artKey": "map.trainingGround.overhead",
          "enabled": true,
          "height": 2800,
          "id": "stage-map",
          "name": "俯视工业战术地图",
          "opacity": 1,
          "order": 0,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "ground",
          "width": 1800,
          "x": 0,
          "y": 0
        },
        {
          "enabled": true,
          "height": 820,
          "id": "press-blocker",
          "name": "中央压装台",
          "opacity": 0,
          "order": 1,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 600,
          "x": 600,
          "y": 280
        },
        {
          "enabled": true,
          "height": 840,
          "id": "cargo-blocker",
          "name": "左侧货箱区",
          "opacity": 0,
          "order": 2,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 450,
          "x": 70,
          "y": 1040
        },
        {
          "enabled": true,
          "height": 740,
          "id": "generator-blocker",
          "name": "右侧发电机",
          "opacity": 0,
          "order": 3,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 480,
          "x": 1190,
          "y": 1160
        },
        {
          "enabled": true,
          "height": 250,
          "id": "barrier-blocker",
          "name": "下方检修栏",
          "opacity": 0,
          "order": 4,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 760,
          "x": 500,
          "y": 2200
        }
      ],
      "layout": {
        "backgroundThemeId": "background_training_ground_v1",
        "battleArea": {
          "height": 2800,
          "width": 1800,
          "x": 0,
          "y": 0
        },
        "camera": {
          "clampToWorld": true,
          "exploreHud": {
            "layout": "tactical",
            "panelOpacity": 0.82,
            "showSkillLabels": true,
            "showWaveNotice": false,
            "skillButtonBottom": 24,
            "skillButtonGap": 14,
            "skillButtonRight": 18,
            "skillButtonShape": "hex",
            "skillButtonSize": 68,
            "theme": "industrial"
          },
          "mode": "follow"
        },
        "canvasHeight": 2800,
        "canvasWidth": 1800,
        "enabled": true,
        "exploreHud": {
          "layout": "tactical",
          "panelOpacity": 0.82,
          "showSkillLabels": true,
          "showWaveNotice": false,
          "skillButtonBottom": 24,
          "skillButtonGap": 14,
          "skillButtonRight": 18,
          "skillButtonShape": "hex",
          "skillButtonSize": 68,
          "theme": "industrial"
        },
        "heroSpawnPointId": "hero_start",
        "sceneMode": "exploration",
        "stageId": "stage_ch1_09",
        "version": 1
      },
      "schemaVersion": 1,
      "spawnPoints": [
        {
          "enabled": true,
          "facing": "up",
          "id": "hero_start",
          "name": "主角出生点",
          "type": "hero",
          "x": 900,
          "y": 2380
        },
        {
          "enabled": true,
          "facing": "right",
          "id": "enemy_left",
          "name": "西侧入口",
          "type": "enemy",
          "x": 300,
          "y": 760
        },
        {
          "enabled": true,
          "facing": "left",
          "id": "enemy_right",
          "name": "东侧入口",
          "type": "enemy",
          "x": 1500,
          "y": 980
        },
        {
          "enabled": true,
          "facing": "down",
          "id": "enemy_top",
          "name": "北侧入口",
          "type": "enemy",
          "x": 900,
          "y": 380
        }
      ],
      "stageId": "stage_ch1_09",
      "waves": [
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.8,
              "count": 7,
              "elite": true,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_guard_elite_01",
              "hpMultiplier": 1.8,
              "id": "entry_1",
              "initialDelayMs": 0,
              "levelMultiplier": 1.8,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_left"
            }
          ],
          "id": "wave_1",
          "maxAlive": 8,
          "name": "第1波 精英压制",
          "nextWave": "next",
          "order": 1,
          "startDelayMs": 0,
          "startTrigger": {
            "type": "stage-start"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.88,
              "count": 8,
              "elite": true,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_guard_elite_01",
              "hpMultiplier": 1.88,
              "id": "entry_2",
              "initialDelayMs": 0,
              "levelMultiplier": 1.88,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_right"
            }
          ],
          "id": "wave_2",
          "maxAlive": 8,
          "name": "第2波 精英压制",
          "nextWave": "next",
          "order": 2,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.96,
              "count": 8,
              "elite": true,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_guard_elite_01",
              "hpMultiplier": 1.96,
              "id": "entry_3",
              "initialDelayMs": 0,
              "levelMultiplier": 1.96,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_top"
            }
          ],
          "id": "wave_3",
          "maxAlive": 8,
          "name": "第3波 精英压制",
          "nextWave": "next",
          "order": 3,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 2.04,
              "count": 8,
              "elite": true,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_guard_elite_01",
              "hpMultiplier": 2.04,
              "id": "entry_4",
              "initialDelayMs": 0,
              "levelMultiplier": 2.04,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_left"
            }
          ],
          "id": "wave_4",
          "maxAlive": 8,
          "name": "第4波 精英压制",
          "nextWave": "stage-clear",
          "order": 4,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        }
      ]
    },
    {
      "completionRule": {
        "type": "all-waves-cleared"
      },
      "failureRule": {
        "type": "hero-dead"
      },
      "layers": [
        {
          "artKey": "map.trainingGround.overhead",
          "enabled": true,
          "height": 2800,
          "id": "stage-map",
          "name": "俯视工业战术地图",
          "opacity": 1,
          "order": 0,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "ground",
          "width": 1800,
          "x": 0,
          "y": 0
        },
        {
          "enabled": true,
          "height": 820,
          "id": "press-blocker",
          "name": "中央压装台",
          "opacity": 0,
          "order": 1,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 600,
          "x": 600,
          "y": 280
        },
        {
          "enabled": true,
          "height": 840,
          "id": "cargo-blocker",
          "name": "左侧货箱区",
          "opacity": 0,
          "order": 2,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 450,
          "x": 70,
          "y": 1040
        },
        {
          "enabled": true,
          "height": 740,
          "id": "generator-blocker",
          "name": "右侧发电机",
          "opacity": 0,
          "order": 3,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 480,
          "x": 1190,
          "y": 1160
        },
        {
          "enabled": true,
          "height": 250,
          "id": "barrier-blocker",
          "name": "下方检修栏",
          "opacity": 0,
          "order": 4,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 760,
          "x": 500,
          "y": 2200
        }
      ],
      "layout": {
        "backgroundThemeId": "background_training_ground_v1",
        "battleArea": {
          "height": 2800,
          "width": 1800,
          "x": 0,
          "y": 0
        },
        "camera": {
          "clampToWorld": true,
          "exploreHud": {
            "layout": "tactical",
            "panelOpacity": 0.82,
            "showSkillLabels": true,
            "showWaveNotice": false,
            "skillButtonBottom": 24,
            "skillButtonGap": 14,
            "skillButtonRight": 18,
            "skillButtonShape": "hex",
            "skillButtonSize": 68,
            "theme": "industrial"
          },
          "mode": "follow"
        },
        "canvasHeight": 2800,
        "canvasWidth": 1800,
        "enabled": true,
        "exploreHud": {
          "layout": "tactical",
          "panelOpacity": 0.82,
          "showSkillLabels": true,
          "showWaveNotice": false,
          "skillButtonBottom": 24,
          "skillButtonGap": 14,
          "skillButtonRight": 18,
          "skillButtonShape": "hex",
          "skillButtonSize": 68,
          "theme": "industrial"
        },
        "heroSpawnPointId": "hero_start",
        "sceneMode": "exploration",
        "stageId": "stage_ch1_10",
        "version": 1
      },
      "schemaVersion": 1,
      "spawnPoints": [
        {
          "enabled": true,
          "facing": "up",
          "id": "hero_start",
          "name": "主角出生点",
          "type": "hero",
          "x": 900,
          "y": 2380
        },
        {
          "enabled": true,
          "facing": "right",
          "id": "enemy_left",
          "name": "西侧入口",
          "type": "enemy",
          "x": 300,
          "y": 760
        },
        {
          "enabled": true,
          "facing": "left",
          "id": "enemy_right",
          "name": "东侧入口",
          "type": "enemy",
          "x": 1500,
          "y": 980
        },
        {
          "enabled": true,
          "facing": "down",
          "id": "enemy_top",
          "name": "北侧入口",
          "type": "enemy",
          "x": 900,
          "y": 380
        }
      ],
      "stageId": "stage_ch1_10",
      "waves": [
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.9,
              "count": 8,
              "elite": true,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_guard_elite_01",
              "hpMultiplier": 1.9,
              "id": "entry_1",
              "initialDelayMs": 0,
              "levelMultiplier": 1.9,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_left"
            }
          ],
          "id": "wave_1",
          "maxAlive": 8,
          "name": "第1波 精英压制",
          "nextWave": "next",
          "order": 1,
          "startDelayMs": 0,
          "startTrigger": {
            "type": "stage-start"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 1.98,
              "count": 8,
              "elite": true,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_guard_elite_01",
              "hpMultiplier": 1.98,
              "id": "entry_2",
              "initialDelayMs": 0,
              "levelMultiplier": 1.98,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_right"
            }
          ],
          "id": "wave_2",
          "maxAlive": 8,
          "name": "第2波 精英压制",
          "nextWave": "next",
          "order": 2,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 2.06,
              "count": 8,
              "elite": true,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_guard_elite_01",
              "hpMultiplier": 2.06,
              "id": "entry_3",
              "initialDelayMs": 0,
              "levelMultiplier": 2.06,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_top"
            }
          ],
          "id": "wave_3",
          "maxAlive": 8,
          "name": "第3波 精英压制",
          "nextWave": "next",
          "order": 3,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 2.14,
              "count": 8,
              "elite": true,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_guard_elite_01",
              "hpMultiplier": 2.14,
              "id": "entry_4",
              "initialDelayMs": 0,
              "levelMultiplier": 2.14,
              "spawnIntervalMs": 420,
              "spawnPointId": "enemy_left"
            }
          ],
          "id": "wave_4",
          "maxAlive": 8,
          "name": "第4波 精英压制",
          "nextWave": "next",
          "order": 4,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        },
        {
          "completionDelayMs": 650,
          "completionRule": {
            "type": "all-enemies-cleared"
          },
          "enabled": true,
          "entries": [
            {
              "attackMultiplier": 3.22,
              "count": 1,
              "elite": true,
              "enabled": true,
              "enemyTemplateId": "enemy_scrap_mouse_king_01",
              "hpMultiplier": 5.152000000000001,
              "id": "entry_5",
              "initialDelayMs": 0,
              "levelMultiplier": 3.22,
              "spawnIntervalMs": 0,
              "spawnPointId": "enemy_right"
            }
          ],
          "id": "wave_5",
          "maxAlive": 1,
          "name": "首领：机械鼠王",
          "nextWave": "stage-clear",
          "order": 5,
          "startDelayMs": 700,
          "startTrigger": {
            "type": "previous-wave-cleared"
          }
        }
      ]
    },
    {
      "completionRule": {
        "type": "all-waves-cleared"
      },
      "failureRule": {
        "type": "hero-dead"
      },
      "layers": [
        {
          "artKey": "map.trainingGround.overhead",
          "enabled": true,
          "height": 2800,
          "id": "training-ground-art",
          "name": "真实训练场底图",
          "opacity": 1,
          "order": 0,
          "parallax": 1,
          "scale": 0.76,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "ground",
          "width": 1800,
          "x": 216,
          "y": 336
        },
        {
          "enabled": true,
          "height": 623,
          "id": "press-blocker",
          "name": "中央压装台",
          "opacity": 0,
          "order": 1,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 456,
          "x": 672,
          "y": 549
        },
        {
          "enabled": true,
          "height": 638,
          "id": "cargo-blocker",
          "name": "左侧货箱区",
          "opacity": 0,
          "order": 2,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 342,
          "x": 269,
          "y": 1126
        },
        {
          "enabled": true,
          "height": 562,
          "id": "generator-blocker",
          "name": "右侧发电机",
          "opacity": 0,
          "order": 3,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 365,
          "x": 1120,
          "y": 1218
        },
        {
          "enabled": true,
          "height": 190,
          "id": "barrier-blocker",
          "name": "下方检修栏",
          "opacity": 0,
          "order": 4,
          "parallax": 1,
          "scale": 1,
          "scrollsWithCamera": true,
          "tiled": false,
          "type": "collision",
          "width": 578,
          "x": 596,
          "y": 2008
        }
      ],
      "layout": {
        "backgroundThemeId": "background_training_ground_v1",
        "battleArea": {
          "height": 2800,
          "width": 1800,
          "x": 0,
          "y": 0
        },
        "camera": {
          "clampToWorld": true,
          "exploreHud": {
            "layout": "compact",
            "showWaveNotice": false
          },
          "mode": "follow"
        },
        "canvasHeight": 2800,
        "canvasWidth": 1800,
        "enabled": true,
        "exploreHud": {
          "layout": "compact",
          "showWaveNotice": false
        },
        "heroSpawnPointId": "hero_start",
        "sceneMode": "exploration",
        "stageId": "stage_explore_training_01",
        "version": 3
      },
      "schemaVersion": 1,
      "spawnPoints": [
        {
          "enabled": true,
          "facing": "right",
          "id": "hero_start",
          "name": "主角出生点",
          "type": "hero",
          "x": 900,
          "y": 1540
        }
      ],
      "stageId": "stage_explore_training_01",
      "waves": []
    }
  ]
};
