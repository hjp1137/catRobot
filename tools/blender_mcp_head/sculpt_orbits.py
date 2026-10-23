"""Fuse closed eyelid masses, then sculpt one continuous recessed opening per eye."""
import bpy
import bmesh
import math
import numpy as np
import sys
from mathutils import Matrix, Vector
from orbit_geometry import eyelid_mass, eye_center, EYE_RADIUS

SKILL = 'E:/dev-cache/catRobot-blender-mcp-20261023/skills/scenario-blender-sculpting/scripts'

def recess_eyelids(co):
    """Push only Y into the real sphere; disjoint XZ domains preserve the nasal bridge."""
    delta = np.zeros(len(co))
    for side in (-1, 1):
        cx, cy, cz = eye_center(side)
        dx, dz = co[:, 0]-cx, co[:, 2]-cz
        angle = math.radians(side*11.5)
        u = dx*math.cos(angle)+dz*math.sin(angle)
        v = -dx*math.sin(angle)+dz*math.cos(angle)
        extent = np.where(v > 0, .034, .027)
        e = (u/.054)**2+(v/extent)**2
        t = np.clip((1-e)/.28, 0, 1)
        front = np.clip((cy-co[:, 1])/.008, 0, 1)
        weight = t*t*(3-2*t)*front*front*(3-2*front)
        target_y = cy-np.sqrt(np.maximum(EYE_RADIUS**2-dx*dx-dz*dz, 0))+.003
        delta = np.maximum(delta, np.maximum(target_y-co[:, 1], 0)*weight)
    co[:, 1] += delta
    return {'moved': int(np.count_nonzero(delta > 1e-8)), 'max_y_recess': float(delta.max())}

def build(voxel=.0028):
    if SKILL not in sys.path: sys.path.insert(0, SKILL)
    import bx_sculpt as S
    col = bpy.data.collections['CATHEAD_After']
    skin = bpy.data.objects['AFTER_Skin']
    inherited = [m.name for m in skin.modifiers]
    for mod in list(skin.modifiers): skin.modifiers.remove(mod)
    old_eye = ('AFTER_Body_Eye', 'AFTER_Body_Dark_Eye', 'AFTER_Body_Dark_Pupil',
               'AFTER_Body_Shine_Eye', 'AFTER_Body_Dark_Mouth', 'AFTER_Body_Dark_Philtrum')
    for obj in list(col.objects):
        if obj.name.startswith(old_eye): bpy.data.objects.remove(obj, do_unlink=True)
    parts = [skin] + [eyelid_mass(s, col, skin.data.materials[0]) for s in (-1, 1)]
    parts += [o for o in col.objects if o.name.startswith('AFTER_Body_Master_EarShell')]
    if len(parts) != 5: raise RuntimeError('Restore primary_clean: need skin, two lid masses, two ear shells')
    bpy.ops.object.select_all(action='DESELECT')
    for obj in parts:
        obj.data.transform(obj.matrix_world); obj.matrix_world = Matrix.Identity(4)
        obj.select_set(True)
    bpy.context.view_layer.objects.active = skin
    bpy.ops.object.join()
    skin.name = 'AFTER_Skin'
    rem = skin.modifiers.new('Continuous head, closed eyelid masses and original ear roots', 'REMESH')
    rem.mode = 'VOXEL'; rem.voxel_size = voxel; rem.use_smooth_shade = True
    bpy.ops.object.modifier_apply(modifier=rem.name)
    # Volume-preserving Taubin relaxation from bx_sculpt, rather than detail inflation.
    relax = S.Sculptor(skin, symmetry_x=False)
    relax.smooth(None, None, strength=.30, iterations=2, preserve_volume=True)
    relax.commit(remember_mask=False)
    # Refine only the ocular surface, keeping the rest of the head at its current density.
    centers = [Vector(eye_center(s)) for s in (-1, 1)]
    bm = bmesh.new(); bm.from_mesh(skin.data)
    edges = [e for e in bm.edges if all(v.co.y < -.060 and
             any((v.co-c).length < .09 for c in centers) for v in e.verts)]
    bmesh.ops.subdivide_edges(bm, edges=edges, cuts=1, use_grid_fill=True)
    bm.to_mesh(skin.data); bm.free(); skin.data.update()
    opened = S.Sculptor(skin, symmetry_x=False)
    recess = recess_eyelids(opened.co)
    opened.commit(remember_mask=False)
    for p in skin.data.polygons: p.use_smooth = True
    skin['socket_method'] = 'Fixed XZ almond domains; Y-only recess behind true spheres; nasal bridge unchanged'
    skin['ear_root_method'] = 'Original outer auricles fused to head; original inner cups retained'
    bpy.context.scene['CATHEAD_stage'] = 'continuous_orbits'
    return {'vertices': len(skin.data.vertices), 'polygons': len(skin.data.polygons),
            'voxel': voxel, 'inherited_modifiers_cleared': inherited, 'eyelid_recess': recess,
            'remaining_old_eyepatches': [o.name for o in col.objects if o.name.startswith(old_eye)]}
