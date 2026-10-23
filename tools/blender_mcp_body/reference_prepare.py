"""Isolated screenshot reconstruction; retain the prior candidate for comparison."""
import bpy
from pathlib import Path

ROOT=Path('E:/dev-cache/catRobot-blender-mcp-20261023/tripo_rebuild')

def build():
    if bpy.data.collections.get('FULL_ArchivePreReference'):
        raise RuntimeError('Reference candidate already prepared')
    ROOT.mkdir(parents=True,exist_ok=True)
    old=bpy.data.collections['FULL_Before'];old.name='FULL_ArchivePreReference'
    old.hide_render=old.hide_viewport=True
    before=bpy.data.collections.new('FULL_Before');bpy.context.scene.collection.children.link(before)
    mapping={};mats={}
    for obj in bpy.data.collections['FULL_After'].all_objects:
        if obj.hide_render:continue
        new=obj.copy();new.data=obj.data.copy();new.name='BEFORE_REFERENCE_'+obj.name
        before.objects.link(new);mapping[obj]=new
        for i,mat in enumerate(new.data.materials):
            if mat not in mats:mats[mat]=mat.copy()
            new.data.materials[i]=mats[mat]
    for old,new in mapping.items():
        if new.type=='CURVES':new.data.surface=mapping[old.data.surface]
    before.hide_render=before.hide_viewport=True
    bpy.context.scene['FULL_stage']='reference_prepared'
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'cat_reference_rebuild.blend'))
    return {'comparison_objects':len(mapping),'source':bpy.data.filepath}
