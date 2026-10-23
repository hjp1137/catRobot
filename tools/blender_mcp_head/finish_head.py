"""Seat inherited facial accessories on the sculpted surface and relax ear voxel edges."""
import bpy
import sys
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree


def seat_nostrils():
    nose = bpy.data.objects['AFTER_Body_Pink_Nose']
    tree = BVHTree.FromObject(nose, bpy.context.evaluated_depsgraph_get())
    for side in (-1, 1):
        obj = bpy.data.objects['AFTER_Body_Dark_Nostril'+str(side)]
        center = sum((v.co for v in obj.data.vertices), Vector())/len(obj.data.vertices)
        x, z = side*.0102, -.053
        hit = tree.ray_cast(Vector((x, -.6, z)), Vector((0, 1, 0)))[0]
        if hit is None: raise RuntimeError('Nostril target misses the nose surface')
        delta = Vector((x, hit.y-.0004, z))-center
        for v in obj.data.vertices: v.co += delta
        obj.data.update()


def build():
    skin = bpy.data.objects['AFTER_Skin']
    skill = 'E:/dev-cache/catRobot-blender-mcp-20261023/skills/scenario-blender-sculpting/scripts'
    if skill not in sys.path: sys.path.insert(0, skill)
    import bx_sculpt as S
    sculpt = S.Sculptor(skin, symmetry_x=False)
    sculpt.mask = np.clip((.18-sculpt.co[:, 2])/.04, 0, 1)
    sculpt.smooth(strength=.5, iterations=6, preserve_volume=False)
    sculpt.commit(remember_mask=False)
    tree = BVHTree.FromObject(skin, bpy.context.evaluated_depsgraph_get())
    def surface(x, z):
        hit = tree.ray_cast(Vector((x, -.6, z)), Vector((0, 1, 0)))[0]
        if hit is None: raise RuntimeError(f'No facial surface at {x}, {z}')
        return hit.y
    col = bpy.data.collections['CATHEAD_After']
    nose = bpy.data.objects['AFTER_Body_Pink_Nose']
    back = max(v.co.y for v in nose.data.vertices)
    attached = []
    for obj in col.objects:
        if 'Pink_Nose' in obj.name or 'Dark_Nostril' in obj.name:
            for v in obj.data.vertices:
                v.co.y = surface(v.co.x, v.co.z) + v.co.y - back + .002
            obj.data.update(); attached.append(obj.name)
        elif 'Whisker' in obj.name:
            nearest = min(abs(v.co.x) for v in obj.data.vertices)
            roots = [v for v in obj.data.vertices if abs(v.co.x) < nearest+.002]
            center = sum((v.co for v in roots), Vector())/len(roots)
            shift = surface(center.x, center.z)+.0015-center.y
            for v in obj.data.vertices: v.co.y += shift
            obj.data.update(); attached.append(obj.name)
    seat_nostrils()
    bpy.context.scene['CATHEAD_stage'] = 'head_sample_review'
    return {'surface_seated_objects': attached, 'ear_relax_iterations': 6}
