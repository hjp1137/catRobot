import sys,json
sys.path.insert(0,r'D:/projects/hjp/catRobot/tools/blender_mcp_head')
import extract_head,review_head
print(json.dumps(extract_head.build(r'E:/dev-cache/catRobot-astral-benchmark-20261023/body_master/cat_body_master_high.blend')))
print(json.dumps(review_head.setup()))
