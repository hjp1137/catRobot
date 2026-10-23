"""Native editable quad cages and genuine subdivided high-poly review surfaces."""
import bpy, math
from mathutils import Vector
from geometry import mesh
from fur_surface import assign_fur_uv,assign_axis_uv

def collection(name):
    result=bpy.data.collections.get(name)
    if result is None:
        result=bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(result)
    return result

def move(obj,name):
    for old in list(obj.users_collection): old.objects.unlink(obj)
    collection(name).objects.link(obj)

def surface(name,vertices,faces,mat,bone,uv=None,extras=None,level=3):
    control=mesh('Cage_'+name,vertices,faces,mat,bone,smooth=True,extras=extras)
    if uv: uv(control)
    high=control.copy(); high.data=control.data.copy()
    bpy.context.scene.collection.objects.link(high); high.name=name
    bpy.context.view_layer.objects.active=high
    modifier=high.modifiers.new('Authored cage subdivision','SUBSURF')
    modifier.levels=level; modifier.render_levels=level
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    high['source_only']=True; high['body_source_kind']='High'
    high['control_cage']=control.name
    move(high,'Body_HighPoly')
    modifier=control.modifiers.new('Editable high surface preview','SUBSURF')
    modifier.levels=2; modifier.render_levels=level
    control['source_only']=True; control['body_source_kind']='ControlCage'
    control.hide_render=True; control.hide_set(True)
    move(control,'Body_ControlCages')
    return high

def tube_cage(name,path,radii,mat,bone,sides=16,front_hint=(0,0,1),extras=None):
    path=[Vector(point) for point in path]
    verts,faces=[],[]
    for i,center in enumerate(path):
        axis=(path[min(i+1,len(path)-1)]-path[max(i-1,0)]).normalized()
        front=Vector(front_hint)
        if abs(axis.dot(front))>.95: front=Vector((0,1,0))
        right=axis.cross(front).normalized(); front=right.cross(axis).normalized()
        a,b=radii[i]
        for j in range(sides):
            theta=j*math.tau/sides
            verts.append(center+right*math.sin(theta)*a+front*math.cos(theta)*b)
    for i in range(len(path)-1):
        for j in range(sides):
            a=i*sides+j; b=i*sides+(j+1)%sides
            faces.append((a,b,b+sides,a+sides))
    faces.extend([tuple(reversed(range(sides))),tuple(range((len(path)-1)*sides,len(verts)))])
    uv=lambda o:assign_axis_uv(o,path[0],path[-1],max(radii[0]))
    return surface(name,verts,faces,mat,bone,uv,extras)

def relief(obj,strength=.00028):
    normals=[v.normal.copy() for v in obj.data.vertices]
    for vertex,normal in zip(obj.data.vertices,normals):
        p=vertex.co
        grain=math.sin(p.x*1870+p.z*61)*math.sin(p.z*2370-p.y*340)**2
        vertex.co+=normal*(strength*grain)
    obj.data.update()
    obj['surface_detail']='Actual high-poly short-fur relief, no bitmap displacement or concept projection'
