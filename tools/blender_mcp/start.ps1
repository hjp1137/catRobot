param([string]$ScenePath)
$ErrorActionPreference='Stop'
$taskRoot='E:/dev-cache/catRobot-blender-mcp-20261023'
$listener=Get-NetTCPConnection -LocalPort 9876 -State Listen -ErrorAction SilentlyContinue
if($listener){throw 'Port 9876 already has a listener; reuse the existing Blender session.'}
$env:BLENDER_USER_SCRIPTS="$taskRoot/blender_user/scripts"
$env:BLENDER_USER_CONFIG="$taskRoot/blender_user/config"
$env:DISABLE_TELEMETRY='true'
$env:BLENDER_MCP_DISABLE_TELEMETRY='true'
$launchArgs=@('--factory-startup')
if($ScenePath){$resolvedScene=(Resolve-Path -LiteralPath $ScenePath).Path;$launchArgs+=('"'+$resolvedScene+'"')}
$bootstrap=Join-Path $PSScriptRoot 'bootstrap.py'
$launchArgs+=@('--python',('"'+$bootstrap+'"'))
$process=Start-Process -FilePath 'E:/dev-cache/catRobot-tools/blender-4.5.14-windows-x64/blender.exe' `
  -ArgumentList $launchArgs -WindowStyle Hidden -PassThru `
  -RedirectStandardOutput "$taskRoot/blender_gui.log" -RedirectStandardError "$taskRoot/blender_gui_error.log"
$process.Id | Set-Content -LiteralPath "$taskRoot/blender_gui.pid"
Write-Output "Started task-local Blender MCP process $($process.Id); 127.0.0.1:9876."
