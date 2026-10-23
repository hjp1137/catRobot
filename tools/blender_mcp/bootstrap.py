"""Launch the task-local Blender bridge; no cloud integrations or global preferences."""
import os,sys,json
from pathlib import Path
import bpy,addon_utils

ROOT=Path('E:/dev-cache/catRobot-blender-mcp-20261023')
os.environ['DISABLE_TELEMETRY']='true'
os.environ['BLENDER_MCP_DISABLE_TELEMETRY']='true'
bpy.utils.refresh_script_paths()
addon_utils.enable('blender_mcp_local',default_set=True,persistent=True)
import blender_mcp_local
prefs=bpy.context.preferences.addons['blender_mcp_local'].preferences
prefs.telemetry_consent=False
scene=bpy.context.scene
scene.blendermcp_auto_start_server=False
scene.blendermcp_port=9876
for prop in ['polyhaven','hyper3d','sketchfab','polypizza','hunyuan3d','meshy']:
    setattr(scene,'blendermcp_use_'+prop,False)
server=blender_mcp_local.BlenderMCPServer(host='127.0.0.1',port=9876)
bpy.types.blendermcp_server=server
server.start()
scene.blendermcp_server_running=server.running
bpy.ops.wm.save_userpref()
(ROOT/'blender_ready.json').write_text(json.dumps({
    'pid':os.getpid(),'blender':bpy.app.version_string,'host':server.host,
    'port':server.port,'running':server.running,'telemetry':prefs.telemetry_consent,
    'online_integrations':{p:getattr(scene,'blendermcp_use_'+p) for p in
                           ['polyhaven','hyper3d','sketchfab','polypizza','hunyuan3d','meshy']}
},indent=2),encoding='utf8')
print('LOCAL_BLENDER_MCP_READY',server.running,flush=True)
