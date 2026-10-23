"""Run inside Blender through its MCP bridge; append an isolated, editable head."""
import bpy
from mathutils import Vector, Matrix

PREFIXES = ('Body_Master_Ear', 'Body_Eye', 'Body_Dark_Eye', 'Body_Dark_Pupil',
            'Body_Shine_Eye', 'Body_Pink_Nose', 'Body_Dark_Nostril',
            'Body_Dark_Mouth', 'Body_Dark_Philtrum', 'Body_Whisker')

def material(name, color, roughness=.65):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    p = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = roughness
    return mat

def collection(name):
    col = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(col)
    return col

def move(obj, col):
    for old in list(obj.users_collection): old.objects.unlink(obj)
    col.objects.link(obj)

def build(source_path):
    if bpy.data.collections.get('CATHEAD_After'):
        raise RuntimeError('Head study already exists; use a fresh scene or explicitly reset it.')
    for obj in bpy.context.scene.objects:
        obj.hide_render = True
        obj.hide_set(True)
    with bpy.data.libraries.load(source_path, link=False) as (src, dst):
        names = [n for n in src.objects if n in ('SOURCE_Face_ControlCage', 'SOURCE_Face_HighPoly')
                 or n.startswith(PREFIXES)]
        dst.objects = names
    appended = [o for o in dst.objects if o is not None]
    cage = next(o for o in appended if o.name.startswith('SOURCE_Face_ControlCage'))
    if len(cage.data.vertices) != 512:
        raise RuntimeError('Expected original 16 x 32 facial cage; inspect source before recentering.')
    origin = sum((cage.matrix_world @ v.co for v in cage.data.vertices[:32]), Vector()) / 32
    origin += Vector((0, -.002, .158))
    before, after, source = [collection('CATHEAD_' + n) for n in ('Before', 'After', 'Source')]
    skin_mat = material('CATHEAD_Clay', (.44, .40, .34))
    for obj in appended:
        name = obj.name
        world = obj.matrix_world.copy()
        obj.parent = None
        obj.data.transform(Matrix.Translation(-origin) @ world)
        obj.matrix_world = Matrix.Identity(4)
        move(obj, source if obj == cage else before)
        obj.hide_render = False
        obj.hide_set(False)
        obj.name = 'BEFORE_' + name
        if name.startswith('SOURCE_Face_HighPoly'): obj.name = 'BEFORE_Skin'
        if obj == cage: obj.name = 'CATHEAD_SourceCage'
        if obj == cage or 'EarShell' in name or name.startswith('SOURCE_Face_HighPoly'):
            obj.data.materials.clear(); obj.data.materials.append(skin_mat)
        for mod in list(obj.modifiers):
            if obj != cage and mod.type == 'ARMATURE': obj.modifiers.remove(mod)
        if not name.startswith('SOURCE_Face_HighPoly'):
            new = obj.copy(); new.data = obj.data.copy(); after.objects.link(new)
            new.name = 'AFTER_Skin' if obj == cage else obj.name.replace('BEFORE_', 'AFTER_', 1)
            new.hide_render = False; new.hide_set(False)
            if obj == cage:
                for inherited in list(new.modifiers): new.modifiers.remove(inherited)
                bpy.context.view_layer.objects.active = new
                mod = new.modifiers.new('Study resolution, native editable cage retained', 'SUBSURF')
                mod.levels = mod.render_levels = 3
                bpy.ops.object.modifier_apply(modifier=mod.name)
    before.hide_render = before.hide_viewport = True
    source.hide_render = source.hide_viewport = True
    bpy.context.scene['CATHEAD_source_path'] = source_path
    bpy.context.scene['CATHEAD_origin_world'] = list(origin)
    bpy.context.scene['CATHEAD_stage'] = 'baseline_extracted'
    return {'source_objects': [o.name for o in appended], 'skin_vertices': len(cage.data.vertices),
            'origin_world': list(origin), 'collections': [before.name, after.name, source.name]}
