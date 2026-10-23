import sys,json,bpy,importlib
from pathlib import Path
sys.path.insert(0,r'D:/projects/hjp/catRobot/tools/blender_mcp_head')
import review_head
importlib.reload(review_head)
root=Path('E:/dev-cache/catRobot-blender-mcp-20261023')
for angle in ('front','three_quarter','profile'):
    print(review_head.render(root/'comparison','Before',angle))
review_head.view('three_quarter')
bpy.ops.wm.save_as_mainfile(filepath=str(root/'cat_head_baseline.blend'))
print('BASELINE_RENDERED')
