param([string]$Godot = $env:GODOT_EXE, [string]$EvidenceDirectory, [string[]]$Tests, [switch]$SkipImport)
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
if (-not $Godot) {
    $Godot = 'E:/Program Files/Godot_v4.7.2-stable_win64.exe/Godot_v4.7.2-stable_win64_console.exe'
}
if (-not (Test-Path -LiteralPath $Godot)) { throw 'Set GODOT_EXE to a Godot 4 executable.' }
$evidence = if ($EvidenceDirectory) { $EvidenceDirectory } else { Join-Path $repo 'Walkthroughes/logs/20261018_rune_growth_integration' }
New-Item -ItemType Directory -Force -Path $evidence | Out-Null
$runRoot = Join-Path $repo ('tmp/godot-check-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $runRoot | Out-Null
$previousSave = $env:CATROBOT_TEST_SAVE_PATH
try {
    $env:CATROBOT_TEST_SAVE_PATH = Join-Path $runRoot 'import-pilot.json'
    if (-not $SkipImport) {
        $output = & $Godot --headless --path (Join-Path $repo 'godot') --editor --import --quit 2>&1
        $output | Set-Content -LiteralPath (Join-Path $evidence 'import.log') -Encoding utf8
        if ($LASTEXITCODE -ne 0 -or ($output -match 'SCRIPT ERROR|ERROR:')) { throw 'Godot import failed; inspect import.log.' }
        Write-Output 'IMPORT PASS'
    }
    if (-not $Tests) { $Tests = @('test_progression', 'test_equipment_v2', 'test_six_equipment_migration', 'test_rune_sockets', 'test_battle', 'test_dual_weapons', 'test_ui_flow', 'test_interface_runtime', 'test_stage_maps', 'test_movement_input', 'test_expedition', 'test_action_upgrade', 'test_field_loot', 'test_environment_density', 'test_minimal_combat_hud', 'test_campaign_map_camp', 'test_campaign_target', 'test_merged_inventory', 'test_feedback_rune_atlas', 'test_rune_growth', 'test_rune_combat_runtime', 'test_rune_battle_integration', 'test_rune_growth_ui', 'test_settlement_rewards_ui', 'test_equipment_appearance_model', 'test_equipment_appearance_ui', 'test_cat3d_battle', 'test_cat3d_motion', 'test_cat3d_posture', 'test_cat3d_armor', 'test_rune_max_loadout', 'test_rune_full_flow') }
    foreach ($name in $Tests) {
        $profile = Join-Path $runRoot $name
        New-Item -ItemType Directory -Force -Path $profile | Out-Null
        $env:CATROBOT_TEST_SAVE_PATH = Join-Path $profile 'pilot.json'
        $output = & $Godot --headless --path (Join-Path $repo 'godot') --script "res://tests/$name.gd" 2>&1
        $code = $LASTEXITCODE
        $output | Set-Content -LiteralPath (Join-Path $evidence "$name.log") -Encoding utf8
        $result = $output | Select-String 'PASS=\d+ FAIL=0'
        if ($code -ne 0 -or -not $result -or ($output -match 'SCRIPT ERROR|ERROR:|ObjectDB instances leaked|resources still in use')) {
            throw "$name failed; inspect $evidence/$name.log."
        }
        Write-Output $result.Line
    }
    Write-Output "Evidence: $evidence"
} finally {
    $env:CATROBOT_TEST_SAVE_PATH = $previousSave
}

