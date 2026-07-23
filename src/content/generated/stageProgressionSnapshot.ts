import type { StageProgressionSnapshot } from '../models/StageProgression';

export const STAGE_PROGRESSION_SNAPSHOT: StageProgressionSnapshot = {
  "checksum": "65f4c252553ea0632db87e5cab70dd192f570f932aff2628060f310d55916490",
  "generatedAt": "2026-07-23T13:32:16.853Z",
  "objectiveCount": 3,
  "releaseId": "cmrxjw9y5000kc2esjgdoh1al",
  "releaseVersion": "R000019",
  "rewardCatalog": [
    {
      "iconArtKey": "drop.coin",
      "name": "金币",
      "refId": "gold",
      "type": "currency"
    },
    {
      "iconArtKey": "drop.part",
      "name": "机甲零件",
      "refId": "parts",
      "type": "currency"
    },
    {
      "iconArtKey": "ui.equip.icon",
      "name": "合金猫甲",
      "refId": "alloy_armor",
      "type": "equipment"
    },
    {
      "iconArtKey": "ui.equip.icon",
      "name": "熔岩防护甲",
      "refId": "lava_armor",
      "type": "equipment"
    },
    {
      "iconArtKey": "ui.equip.icon",
      "name": "熔岩重炮",
      "refId": "lava_cannon",
      "type": "equipment"
    },
    {
      "iconArtKey": "ui.equip.icon",
      "name": "熔岩能量核心",
      "refId": "lava_core",
      "type": "equipment"
    },
    {
      "iconArtKey": "ui.equip.icon",
      "name": "霓虹喵能炮",
      "refId": "neon_blaster",
      "type": "equipment"
    },
    {
      "iconArtKey": "ui.equip.icon",
      "name": "霓虹能量核心",
      "refId": "neon_core",
      "type": "equipment"
    },
    {
      "iconArtKey": "ui.equip.icon",
      "name": "拼装重甲",
      "refId": "patched_armor",
      "type": "equipment"
    },
    {
      "iconArtKey": "ui.equip.icon",
      "name": "锈蚀猫爪炮",
      "refId": "rusty_claw",
      "type": "equipment"
    },
    {
      "iconArtKey": "ui.equip.icon",
      "name": "下水道防护甲",
      "refId": "sewer_guard",
      "type": "equipment"
    },
    {
      "iconArtKey": "ui.equip.icon",
      "name": "小型能量核心",
      "refId": "small_core",
      "type": "equipment"
    },
    {
      "iconArtKey": "ui.equip.icon",
      "name": "星核重炮",
      "refId": "starcore_cannon",
      "type": "equipment"
    },
    {
      "iconArtKey": "ui.equip.icon",
      "name": "星核碎片核心",
      "refId": "starcore_fragment",
      "type": "equipment"
    },
    {
      "iconArtKey": "drop.stone",
      "name": "强化石",
      "refId": "enhanceStone",
      "type": "material"
    },
    {
      "iconArtKey": "ui.rune.icon",
      "name": "炮击符文",
      "refId": "cannon_rune_1",
      "type": "rune"
    },
    {
      "iconArtKey": "ui.rune.icon",
      "name": "避火符文",
      "refId": "fire_guard_rune",
      "type": "rune"
    },
    {
      "iconArtKey": "ui.rune.icon",
      "name": "净化符文",
      "refId": "poison_guard_rune",
      "type": "rune"
    },
    {
      "iconArtKey": "ui.rune.icon",
      "name": "护盾符文",
      "refId": "shield_rune_1",
      "type": "rune"
    }
  ],
  "rewardEntryCount": 6,
  "schemaVersion": 1,
  "stageCount": 1,
  "stages": [
    {
      "failureText": "机甲核心失稳，请重新挑战",
      "objectives": [
        {
          "displayText": "清除全部三波敌人",
          "enabled": true,
          "id": "clear_all",
          "name": "清除全部三波",
          "order": 0,
          "params": {},
          "progressDisplay": "waves",
          "required": true,
          "starEligible": true,
          "type": "clear-all-waves"
        },
        {
          "displayText": "90秒内完成",
          "enabled": true,
          "id": "fast_clear",
          "name": "迅捷清场",
          "order": 1,
          "params": {
            "maxDurationSec": 90
          },
          "progressDisplay": "timer",
          "required": false,
          "starEligible": true,
          "type": "complete-within-duration"
        },
        {
          "displayText": "结束时生命不低于50%",
          "enabled": true,
          "id": "healthy_clear",
          "name": "保持装甲",
          "order": 2,
          "params": {
            "minHealthRatio": 0.5
          },
          "progressDisplay": "ratio",
          "required": false,
          "starEligible": true,
          "type": "hero-health-above"
        }
      ],
      "recommendedPower": 220,
      "rewardPools": [
        {
          "entries": [
            {
              "enabled": true,
              "guaranteed": true,
              "id": "gold",
              "maxQuantity": 50,
              "minQuantity": 50,
              "probability": 1,
              "rewardRefId": "gold",
              "rewardType": "currency"
            },
            {
              "enabled": true,
              "guaranteed": true,
              "id": "stone",
              "maxQuantity": 2,
              "minQuantity": 2,
              "probability": 1,
              "rewardRefId": "enhanceStone",
              "rewardType": "material"
            }
          ],
          "group": "first-clear",
          "id": "first_clear",
          "name": "首通奖励",
          "selectionMode": "independent-probability"
        },
        {
          "entries": [
            {
              "enabled": true,
              "guaranteed": true,
              "id": "parts",
              "maxQuantity": 4,
              "minQuantity": 2,
              "probability": 1,
              "rewardRefId": "parts",
              "rewardType": "currency"
            },
            {
              "enabled": true,
              "guaranteed": false,
              "id": "equipment",
              "maxQuantity": 1,
              "minQuantity": 1,
              "probability": 0.2,
              "rewardRefId": "rusty_claw",
              "rewardType": "equipment"
            }
          ],
          "group": "repeat-clear",
          "id": "repeat_clear",
          "name": "常规通关",
          "selectionMode": "independent-probability"
        },
        {
          "entries": [
            {
              "enabled": true,
              "guaranteed": true,
              "id": "rune",
              "maxQuantity": 1,
              "minQuantity": 1,
              "probability": 1,
              "rewardRefId": "cannon_rune_1",
              "rewardType": "rune"
            }
          ],
          "group": "first-three-star",
          "id": "first_three_star",
          "name": "首次三星",
          "selectionMode": "independent-probability"
        },
        {
          "entries": [
            {
              "enabled": true,
              "guaranteed": true,
              "id": "stone",
              "maxQuantity": 1,
              "minQuantity": 1,
              "probability": 1,
              "rewardRefId": "enhanceStone",
              "rewardType": "material"
            }
          ],
          "group": "objective-bonus",
          "id": "healthy_bonus",
          "name": "装甲目标奖励",
          "objectiveId": "healthy_clear",
          "selectionMode": "independent-probability"
        }
      ],
      "stageId": "stage_battle_1_1",
      "unlockRules": [
        {
          "enabled": true,
          "id": "default_1_1",
          "requiredStars": 0,
          "type": "default-unlocked"
        },
        {
          "enabled": true,
          "id": "unlock_training",
          "nextStageId": "stage_explore_training_01",
          "prerequisiteStageId": "stage_battle_1_1",
          "requiredStars": 1,
          "type": "prerequisite-clear"
        }
      ],
      "victoryText": "铸造通道已净化"
    }
  ],
  "unlockRuleCount": 2
};
