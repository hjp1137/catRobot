"""Actual eyeball spheres with spherical iris/pupil caps; no eye-mask planes or textures."""
import bpy
import bmesh
import math
from extract_head import material
from orbit_geometry import mesh, eye_center, EYE_RADIUS

def sphere(name, center, radius, col, mat):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=64, v_segments=32, radius=radius)
    bm.to_mesh(me); bm.free()
    obj = bpy.data.objects.new(name, me); col.objects.link(obj)
    for v in me.vertices:
        v.co.x += center[0]; v.co.y += center[1]; v.co.z += center[2]
    me.materials.append(mat)
    for p in me.polygons: p.use_smooth = True
    return obj

def cap(name, center, width, height, offset, col, mat, segments=64, rings=10):
    vertices = [(center[0], center[1]-EYE_RADIUS-offset, center[2])]
    for row in range(1, rings+1):
        t = row/rings
        for i in range(segments):
            a = i*math.tau/segments
            x, z = width*math.cos(a)*t, height*math.sin(a)*t
            y = center[1]-math.sqrt(EYE_RADIUS**2-x*x-z*z)-offset
            vertices.append((center[0]+x, y, center[2]+z))
    faces = [(0, 1+i, 1+(i+1)%segments) for i in range(segments)]
    for row in range(rings-1):
        for i in range(segments):
            a=1+row*segments+i; b=1+row*segments+(i+1)%segments
            faces.append((a,b,b+segments,a+segments))
    return mesh(name, vertices, faces, col, mat)

def build():
    col = bpy.data.collections['CATHEAD_After']
    sclera = material('CATHEAD_Sclera', (.58,.65,.62), .26)
    iris = material('CATHEAD_Iris', (.015,.43,.40), .26)
    pupil = material('CATHEAD_Pupil', (.006,.010,.012), .25)
    nose = material('CATHEAD_Nose', (.25,.085,.075), .46)
    inner = material('CATHEAD_InnerEarClay', (.36,.26,.235), .73)
    for side in (-1, 1):
        c = eye_center(side)
        sphere('AFTER_TrueEyeball'+str(side), c, EYE_RADIUS, col, sclera)
        cap('AFTER_SphericalIris'+str(side), c, .0475, .0465, .00035, col, iris)
        cap('AFTER_SphericalPupil'+str(side), c, .0072, .0265, .00075, col, pupil)
    for obj in col.objects:
        if obj.name.startswith('AFTER_Body_Pink_Nose'):
            obj.data.materials.clear(); obj.data.materials.append(nose)
        if obj.name.startswith('AFTER_Body_Master_EarInner'):
            obj.data.materials.clear(); obj.data.materials.append(inner)
    bpy.context.scene['CATHEAD_stage'] = 'true_eyeballs'
    return {'true_spheres': 2, 'radius': EYE_RADIUS,
            'eye_centers': [eye_center(s) for s in (-1,1)],
            'iris_geometry': 'spherical caps following each actual eyeball surface'}
