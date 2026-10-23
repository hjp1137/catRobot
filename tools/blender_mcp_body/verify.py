"""Check the isolated assembled source, including actual head/neck intersection."""
import bpy,bmesh,json
import numpy as np
from pathlib import Path
from mathutils.bvhtree import BVHTree


def run(output_dir='E:/dev-cache/catRobot-blender-mcp-20261023/full_body'):
    result={'source':bpy.data.filepath,'meshes':[],'fur':[]}
    names=('FULL_Body_Master_ContinuousHigh','AFTER_Skin')
    trees=[]
    for name in names:
        obj=bpy.data.objects[name];me=obj.data
        bm=bmesh.new();bm.from_mesh(me)
        bad=sum(not e.is_manifold for e in bm.edges)
        assert bad==0
        result['meshes'].append({'name':name,'vertices':len(me.vertices),'faces':len(me.polygons),'non_manifold_edges':bad})
        bm.free()
        points=[obj.matrix_world@v.co for v in me.vertices]
        trees.append(BVHTree.FromPolygons(points,[p.vertices[:] for p in me.polygons]))
    overlaps=trees[0].overlap(trees[1]);assert len(overlaps)>0
    result['head_neck_intersecting_face_pairs']=len(overlaps)
    for obj in bpy.data.collections['FULL_After'].all_objects:
        if obj.type=='MESH':
            co=np.empty(len(obj.data.vertices)*3,np.float32);obj.data.vertices.foreach_get('co',co)
            assert np.isfinite(co).all()
        elif obj.type=='CURVES':
            data=obj.data;co=np.empty(len(data.points)*3,np.float32)
            data.attributes['position'].data.foreach_get('vector',co);assert np.isfinite(co).all()
            radius=np.empty(len(data.points),np.float32)
            data.attributes['radius'].data.foreach_get('value',radius);assert np.isfinite(radius).all() and radius.min()>0
            assert data.surface is not None
            result['fur'].append({'name':obj.name,'strands':len(data.curves),'points':len(data.points),'surface':data.surface.name})
    result['total_fur_strands']=sum(r['strands'] for r in result['fur'])
    result['unpacked_images']=[i.name for i in bpy.data.images if i.source=='FILE' and not i.packed_file]
    assert not result['unpacked_images']
    result['head_origin']=list(bpy.context.scene['FULL_head_origin'])
    result['art_review']='Offline assembled candidate; animation and user acceptance not implied'
    (Path(output_dir)/'final_inspect.json').write_text(json.dumps(result,indent=2))
    return result
