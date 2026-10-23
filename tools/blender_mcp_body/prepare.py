"""Combine two saved authoring samples without replacing either input file."""
import bpy
from pathlib import Path
from mathutils import Matrix,Vector

ROOT=Path('E:/dev-cache/catRobot-blender-mcp-20261023/full_body')
ORIGIN=Vector((-2.9103830456733704e-11,-.013679907657206059,1.658700704574585))
HEAD_PREFIX=('Body_Master_Ear','Body_Eye','Body_Dark_Eye','Body_Dark_Pupil',
 'Body_Shine_Eye','Body_Pink_Nose','Body_Dark_Nostril','Body_Dark_Mouth',
 'Body_Dark_Philtrum','Body_Whisker')


def build():
    if bpy.data.collections.get('FULL_After'):raise RuntimeError('Body already prepared')
    ROOT.mkdir(parents=True,exist_ok=True)
    visible=[o for o in bpy.context.scene.objects if o.type=='MESH' and not o.hide_render and not o.hide_get()]
    before=bpy.data.collections.new('FULL_Before');after=bpy.data.collections.new('FULL_After')
    for col in (before,after):bpy.context.scene.collection.children.link(col)
    for obj in visible:
        for col in list(obj.users_collection):col.objects.unlink(obj)
        before.objects.link(obj)
        if obj.name=='SOURCE_Face_HighPoly' or obj.name.startswith(HEAD_PREFIX):continue
        new=obj.copy();new.data=obj.data.copy();new.name='FULL_'+obj.name
        matrix=obj.matrix_world.copy();new.parent=None
        new.data.transform(matrix);new.matrix_world=Matrix.Identity(4)
        after.objects.link(new)
        for modifier in list(new.modifiers):
            if modifier.type=='ARMATURE':new.modifiers.remove(modifier)
    path='E:/dev-cache/catRobot-blender-mcp-20261023/refined/cat_head_refined.blend'
    with bpy.data.libraries.load(path,link=False) as (src,dst):dst.collections=['CATHEAD_After']
    head=dst.collections[0];head.name='FULL_RefinedHead';after.children.link(head)
    head.hide_render=False;head.hide_viewport=False
    for obj in head.objects:obj.matrix_world=Matrix.Translation(ORIGIN)@obj.matrix_world
    before.hide_render=before.hide_viewport=True
    bpy.context.scene['FULL_head_origin']=list(ORIGIN)
    bpy.context.scene['FULL_stage']='head_attached'
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'cat_full_refined.blend'))
    return {'previous_meshes':len(visible),'body_parts':len(after.objects),
            'head_visible':sum(not o.hide_render for o in head.objects),'origin':list(ORIGIN)}
