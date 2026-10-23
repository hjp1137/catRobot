@echo off
setlocal
set "GAME_DIR=%~dp0godot"
if defined GODOT_EXE goto isolate
set "GODOT_EXE=E:\Program Files\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64.exe"
if exist "%GODOT_EXE%" goto isolate
where godot >nul 2>nul
if not errorlevel 1 (
  set "GODOT_EXE=godot"
  goto isolate
)
echo Godot 4.7.2 or newer is required. Set GODOT_EXE to its executable.
pause
exit /b 1
:isolate
set "CAT3D_RUN_DIR=%~dp0tmp\cat3d-play-mecha-%RANDOM%-%RANDOM%"
if exist "%CAT3D_RUN_DIR%" goto isolate
mkdir "%CAT3D_RUN_DIR%"
if errorlevel 1 (
  echo Could not create the isolated verification save directory.
  pause
  exit /b 1
)
set "CATROBOT_TEST_SAVE_PATH=%CAT3D_RUN_DIR%\pilot.json"
echo Five-tier mecha verification: F1-F5 tiers, F6 bare cat, F7 mixed armor.
echo Keys 1-6: weapons. WASD: move. E: shield. Space: skill. F10: exit.
echo Appearance fixtures affect this fresh temporary session only.
"%GODOT_EXE%" --path "%GAME_DIR%" --script res://tests/play_mecha_evolution.gd %*
set "CAT3D_EXIT=%ERRORLEVEL%"
if not "%CAT3D_EXIT%"=="0" pause
exit /b %CAT3D_EXIT%
