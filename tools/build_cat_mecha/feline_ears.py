"""Concave thick ear cups with a rounded rim and a broad skull root."""
import math
from mathutils import Vector
from feline_cage import surface
from fur_surface import assign_fur_uv

def build_ears(head,mats):
    outline=[(.060,.108,.008),(.105,.095,.030),(.151,.108,.024),(.180,.142,-.006),
             (.199,.205,-.025),(.191,.274,-.035),(.182,.329,-.039),(.169,.309,-.020),
             (.136,.249,.004),(.103,.191,.019)]
    for side in [-1,1]:
        center=Vector((side*.143,.206,-.014))
        boundary=[Vector((side*x,y,z)) for x,y,z in outline]
        for inner in [False,True]:
            verts=[head+center+Vector((0,0,.008 if inner else -.004))]
            fractions=[.20,.49,.73,.91,1.0] if not inner else [.20,.47,.72,.90]
            for fraction in fractions:
                for point in boundary:
                    q=center.lerp(point,fraction*(.82 if inner else 1))
                    q.z+=.023*math.sin(fraction*math.pi*.5)-(.001 if inner else .008)
                    verts.append(head+q)
            n=len(boundary); faces=[(0,1+j,1+(j+1)%n) for j in range(n)]
            for row in range(len(fractions)-1):
                for j in range(n):
                    a=1+row*n+j; b=1+row*n+(j+1)%n
                    faces.append((a,b,b+n,a+n))
            mat=mats['Pink'] if inner else mats['FurHead']
            name='Body_Master_Ear'+('Inner' if inner else 'Shell')+str(side)
            high=surface(name,verts,faces,mat,'Head',
                         lambda o:assign_fur_uv(o,head,(.208,.190,.187)))
            import bpy
            bpy.context.view_layer.objects.active=high
            modifier=high.modifiers.new('Ear cartilage real thickness','SOLIDIFY')
            modifier.thickness=.0025 if inner else .008
            modifier.offset=-1
            bpy.ops.object.modifier_apply(modifier=modifier.name)
            high['shape_notes']='Concave auricle, rolled outer edge, swept taper and root width; not a triangular panel'
