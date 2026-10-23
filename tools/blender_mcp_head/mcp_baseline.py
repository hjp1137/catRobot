import sys,json,bpy
from pathlib import Path
sys.path.insert(0,r'D:/projects/hjp/catRobot/tools/blender_mcp_head')
import review_head,inspect_head
root=Path('E:/dev-cache/catRobot-blender-mcp-20261023')
print(json.dumps(review_head.setup()))
review_head.show('Before')
report=inspect_head.report()
(root/'head_baseline_inspect.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report))
bpy.ops.wm.save_as_mainfile(filepath=str(root/'cat_head_baseline.blend'))
