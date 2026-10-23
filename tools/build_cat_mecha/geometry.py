"""Blender-only offline geometry helpers; game runtime consumes finished meshes."""
import bpy, bmesh, math
from mathutils import Vector

def v(point):
    x, y, z = point
    return Vector((x, -z, y))

def material(name, color, metallic=0.0, roughness=.38, emission=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Metallic'].default_value = metallic
    shader.inputs['Roughness'].default_value = roughness
    if emission:
        shader.inputs['Emission Color'].default_value = (*color, 1)
        shader.inputs['Emission Strength'].default_value = emission
    return mat

def finish(obj, name, mat, bone, bevel=0.0, smooth=True, extras=None):
    obj.name = name
    obj.data.materials.append(mat)
    obj['bind_bone'] = bone
    if extras:
        for key, value in extras.items(): obj[key] = value
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(obj.data)
    bm.free()
    if bevel:
        mod = obj.modifiers.new('Offline edge bevel', 'BEVEL')
        mod.width, mod.segments = bevel, 2
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=mod.name)
    for face in obj.data.polygons: face.use_smooth = smooth
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return obj

def mesh(name, vertices, faces, mat, bone, bevel=0.0, smooth=False, extras=None):
    data = bpy.data.meshes.new(name)
    data.from_pydata([v(p) for p in vertices], [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    return finish(obj, name, mat, bone, bevel, smooth, extras)

def ellipsoid(name, center, size, mat, bone, segments=24, rings=12, extras=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=v(center))
    obj = bpy.context.object
    obj.scale = (size[0], size[2], size[1])
    return finish(obj, name, mat, bone, smooth=True, extras=extras)

def bar(name, a, b, radius, mat, bone, sides=12):
    a, b = Vector(a), Vector(b)
    delta = v(b) - v(a)
    bpy.ops.mesh.primitive_cylinder_add(vertices=sides, radius=radius, depth=delta.length,
                                     location=(v(a) + v(b)) * .5)
    obj = bpy.context.object
    obj.rotation_mode = 'QUATERNION'
    obj.rotation_quaternion = delta.to_track_quat('Z', 'Y')
    return finish(obj, name, mat, bone, bevel=radius*.2)

def tube(name, a, b, radii, mat, bone, sides=16, gap=.0, extras=None):
    a, b = Vector(a), Vector(b)
    axis = (b-a).normalized()
    front = Vector((0, 0, 1))
    if abs(axis.dot(front)) > .96: front = Vector((0, 1, 0))
    right = axis.cross(front).normalized()
    front = right.cross(axis).normalized()
    vertices, faces = [], []
    for t, radius in radii:
        center = a.lerp(b, t)
        for j in range(sides):
            angle = 2*math.pi*j/sides
            vertices.append(center + right*math.cos(angle)*radius + front*math.sin(angle)*radius)
    for row in range(len(radii)-1):
        for j in range(sides):
            k, n = row*sides+j, row*sides+(j+1)%sides
            faces.append((k,n,n+sides,k+sides))
    faces.extend([tuple(reversed(range(sides))), tuple(range((len(radii)-1)*sides,len(radii)*sides))])
    return mesh(name, vertices, faces, mat, bone, bevel=gap, smooth=not gap, extras=extras)

def loft(name, profiles, mat, bone, sides=16, bevel=.0, smooth=False, extras=None):
    vertices, faces = [], []
    for y, width, depth, z in profiles:
        for j in range(sides):
            angle = 2*math.pi*j/sides
            vertices.append((math.sin(angle)*width, y, math.cos(angle)*depth+z))
    for row in range(len(profiles)-1):
        for j in range(sides):
            k, n = row*sides+j, row*sides+(j+1)%sides
            faces.append((k,n,n+sides,k+sides))
    faces.extend([tuple(reversed(range(sides))), tuple(range((len(profiles)-1)*sides,len(profiles)*sides))])
    return mesh(name, vertices, faces, mat, bone, bevel, smooth, extras)

def panel(name, outline, depth, mat, bone, bevel=.008, extras=None):
    vertices = [tuple(p) for p in outline] + [(p[0],p[1],p[2]-depth) for p in outline]
    n = len(outline)
    faces = [tuple(range(n)), tuple(reversed(range(n,n*2)))]
    faces += [(j,(j+1)%n,(j+1)%n+n,j+n) for j in range(n)]
    return mesh(name, vertices, faces, mat, bone, bevel, False, extras)

def armor_oval(name, center, width, height, depth, mat, bone, bevel=.006, extras=None):
    x,y,z = center
    points = [(x-width*.63,y+height,z),(x+width*.63,y+height,z),
              (x+width,y+height*.45,z+depth*.15),(x+width*.82,y-height*.62,z+depth*.12),
              (x+width*.36,y-height,z+depth*.2),(x-width*.36,y-height,z+depth*.2),
              (x-width*.82,y-height*.62,z+depth*.12),(x-width,y+height*.45,z+depth*.15)]
    return panel(name, points, depth, mat, bone, bevel, extras)
