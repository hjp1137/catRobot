"""Keep the accepted head sample as an independent comparison inside a new file."""
import bpy
from pathlib import Path

ROOT = Path('E:/dev-cache/catRobot-blender-mcp-20261023/refined')


def build():
    if bpy.data.collections.get('CATHEAD_ArchiveOriginal'):
        raise RuntimeError('Refined comparison already prepared')
    ROOT.mkdir(parents=True, exist_ok=True)
    archive = bpy.data.collections['CATHEAD_Before']
    archive.name = 'CATHEAD_ArchiveOriginal'
    for obj in archive.objects: obj.name = obj.name.replace('BEFORE_', 'ARCHIVE_', 1)
    archive.hide_viewport = archive.hide_render = True
    before = bpy.data.collections.new('CATHEAD_Before')
    bpy.context.scene.collection.children.link(before)
    mats = {}
    for obj in bpy.data.collections['CATHEAD_After'].objects:
        new = obj.copy(); new.data = obj.data.copy()
        new.name = obj.name.replace('AFTER_', 'BEFORE_', 1)
        before.objects.link(new)
        for i, mat in enumerate(new.data.materials):
            if mat.name not in mats:
                saved = mat.copy(); saved.name = 'PREVIOUS_'+mat.name; mats[mat.name] = saved
            new.data.materials[i] = mats[mat.name]
    before.hide_viewport = before.hide_render = True
    bpy.context.scene['CATHEAD_stage'] = 'refine_prepared'
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'cat_head_refined.blend'))
    return {'before_objects': len(before.objects), 'source': bpy.data.filepath}
