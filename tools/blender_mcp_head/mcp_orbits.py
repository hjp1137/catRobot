import sys,json,bpy
from pathlib import Path
sys.path.insert(0,r'D:/projects/hjp/catRobot/tools/blender_mcp_head')
import sculpt_orbits,build_true_eyes,review_head,inspect_head
root=Path('E:/dev-cache/catRobot-blender-mcp-20261023')
print(json.dumps(sculpt_orbits.build()))
print(json.dumps(build_true_eyes.build()))
report=inspect_head.report()
(root/'head_orbits_inspect.json').write_text(json.dumps(report,indent=2))
bpy.ops.wm.save_as_mainfile(filepath=str(root/'cat_head_orbits.blend'),copy=True)
review_head.show('After');review_head.view('three_quarter')
