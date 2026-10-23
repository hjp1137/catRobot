"""Blender-local closed eye masses; openings are sculpted without cutting the head."""
import bpy
import bmesh
import math

EYE_RADIUS = .0625

def eye_center(side):
    return (side * .083, -.088, .029)

def mesh(name, vertices, faces, collection, material=None):
    me = bpy.data.meshes.new(name)
    me.from_pydata(vertices, [], faces); me.update()
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    obj = bpy.data.objects.new(name, me); collection.objects.link(obj)
    if material: me.materials.append(material)
    for p in me.polygons: p.use_smooth = True
    return obj

def eyelid_mass(side, collection, mat):
    name = 'AFTER_OrbitalMass' + str(side)
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=64, v_segments=32, radius=EYE_RADIUS+.0045)
    bm.to_mesh(me); bm.free()
    center = eye_center(side)
    for v in me.vertices:
        for axis in range(3): v.co[axis] += center[axis]
    obj = bpy.data.objects.new(name, me); collection.objects.link(obj)
    me.materials.append(mat)
    for p in me.polygons: p.use_smooth = True
    return obj
