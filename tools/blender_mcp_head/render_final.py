"""Record actual live-scene cameras and lights while rendering the review pairs."""
import bpy
import json
import math
from pathlib import Path
import review_head
import render_clay
import inspect_head

ROOT = Path('E:/dev-cache/catRobot-blender-mcp-20261023')


def save():
    review_head.show('After'); review_head.view('three_quarter')
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'cat_head_study.blend'))
    report = inspect_head.report()
    report['file'] = bpy.data.filepath
    report['blender_version'] = bpy.app.version_string
    report['finite_coordinates'] = all(math.isfinite(c) for o in
        bpy.data.collections['CATHEAD_After'].objects if o.type == 'MESH'
        for v in o.data.vertices for c in v.co)
    report['skin_modifiers'] = [m.name for m in bpy.data.objects['AFTER_Skin'].modifiers]
    report['source_cage_vertices'] = len(bpy.data.objects['CATHEAD_SourceCage'].data.vertices)
    report['unpacked_file_images'] = [i.name for i in bpy.data.images
        if i.source == 'FILE' and not i.packed_file]
    report['art_review'] = 'Single head study only; user approval pending'
    (ROOT/'head_final_inspect.json').write_text(json.dumps(report, indent=2), encoding='utf8')
    return report


def render_set(version, clay=False):
    directory = 'clay_comparison' if clay else 'comparison'
    records = []
    for angle in ('front', 'three_quarter', 'profile'):
        fn = render_clay.render if clay else review_head.render
        path = fn(str(ROOT/directory), version, angle)
        scene = bpy.context.scene
        camera = scene.camera
        records.append({'file': path, 'source': bpy.data.filepath, 'version': version,
            'mode': directory, 'view': angle, 'lens_mm': camera.data.lens,
            'position': list(camera.location), 'rotation': list(camera.rotation_euler),
            'resolution': [scene.render.resolution_x, scene.render.resolution_y],
            'engine': scene.render.engine, 'view_transform': scene.view_settings.view_transform,
            'lights': {o.name: {'energy': o.data.energy, 'position': list(o.location)}
                for o in bpy.data.collections['CATHEAD_Review'].objects if o.type == 'LIGHT'}})
    (ROOT/(directory+'_'+version.lower()+'_records.json')).write_text(
        json.dumps(records, indent=2), encoding='utf8')
    return {'mode': directory, 'version': version, 'images': len(records)}
