"""Inspect the saved sample data; geometry checks are not an artistic approval."""
import bpy
import json
import numpy as np
from pathlib import Path
import inspect_head


def run():
    report=inspect_head.report()
    report['art_review']='Offline refined head sample; user review pending'
    report['file']=bpy.data.filepath
    report['fur']=[]
    for obj in bpy.data.collections['CATHEAD_After'].objects:
        if obj.type=='MESH':
            vertices=np.empty(len(obj.data.vertices)*3,np.float32)
            obj.data.vertices.foreach_get('co',vertices)
            assert np.isfinite(vertices).all()
    report['mesh_coordinates_finite']=True
    for obj in bpy.data.collections['CATHEAD_After'].objects:
        if obj.type!='CURVES':continue
        data=obj.data
        co=np.empty(len(data.points)*3,np.float32)
        data.attributes['position'].data.foreach_get('vector',co)
        radius=np.empty(len(data.points),np.float32)
        data.attributes['radius'].data.foreach_get('value',radius)
        colors=np.empty(len(data.points)*4,np.float32)
        data.attributes['CoatColor'].data.foreach_get('color',colors)
        assert np.isfinite(co).all() and np.isfinite(radius).all() and np.isfinite(colors).all()
        assert radius.min()>0 and len(data.curves)>0
        report['fur'].append({'object':obj.name,'curves':len(data.curves),'points':len(data.points),
            'radius_min':float(radius.min()),'radius_max':float(radius.max()),'finite':True})
    assert report['objects'][1]['non_manifold_edges']==0
    assert len(report['objects'][1]['connected_components'])==1
    report['total_fur_curves']=sum(x['curves'] for x in report['fur'])
    report['unpacked_file_images']=[i.name for i in bpy.data.images if i.source=='FILE' and not i.packed_file]
    assert not report['unpacked_file_images']
    report['preserved_previous_objects']=len(bpy.data.collections['CATHEAD_Before'].objects)
    report['visible_whisker_curves']=len([o for o in bpy.data.collections['CATHEAD_After'].objects
        if o.type=='CURVE' and not o.hide_render])
    assert report['visible_whisker_curves']==6
    path=Path('E:/dev-cache/catRobot-blender-mcp-20261023/refined/final_inspect.json')
    path.write_text(json.dumps(report,indent=2),encoding='utf8')
    return report
