@echo off
setlocal
set "GAME_DIR=%~dp0godot"
if defined GODOT_EXE goto launch
set "GODOT_EXE=E:\Program Files\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64.exe"
if exist "%GODOT_EXE%" goto launch
where godot >nul 2>nul
if not errorlevel 1 (
  set "GODOT_EXE=godot"
  goto launch
)
echo Godot 4.7.2 or newer is required. Set GODOT_EXE or open godot/project.godot.
pause
exit /b 1
:launch
"%GODOT_EXE%" --path "%GAME_DIR%"
