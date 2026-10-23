"""Curved, thin manufactured shells authored in the preserved rest space."""
import math
import bpy
from mathutils import Vector
from geometry import mesh


def finish_shell(obj, thickness=.008, bevel=.002, subdiv=0):
    bpy.context.view_layer.objects.active = obj
    if subdiv:
        mod = obj.modifiers.new('Offline curvature subdivision', 'SUBSURF')
        mod.levels = subdiv
        bpy.ops.object.modifier_apply(modifier=mod.name)
    if thickness:
        mod = obj.modifiers.new('Manufactured shell wall', 'SOLIDIFY')
        mod.thickness, mod.offset = thickness, -1
        bpy.ops.object.modifier_apply(modifier=mod.name)
    if bevel:
        mod = obj.modifiers.new('Fine machined edge', 'BEVEL')
        mod.width, mod.segments = bevel, 2
        bpy.ops.object.modifier_apply(modifier=mod.name)
    mod = obj.modifiers.new('Weighted hard surface normals', 'WEIGHTED_NORMAL')
    mod.keep_sharp, mod.weight = True, 35
    bpy.ops.object.modifier_apply(modifier=mod.name)
    return obj


def surface(name, rows, mat, bone, thickness=.008, bevel=.002, extras=None, reverse=False):
    width = len(rows[0])
    verts = [point for row in rows for point in row]
    faces = [(i*width+j, i*width+j+1, (i+1)*width+j+1, (i+1)*width+j)
             for i in range(len(rows)-1) for j in range(width-1)]
    if reverse: faces=[tuple(reversed(face)) for face in faces]
    return finish_shell(mesh(name, verts, faces, mat, bone, smooth=True, extras=extras),
                        thickness, bevel)


def shield(name, profiles, mat, bone, x=0, thickness=.010, bevel=.0025, skew=0, sweep=0):
    """Profiles are (height, half width, edge front depth, central relief)."""
    columns = [-1, -.86, -.50, -.16, 0, .16, .50, .86, 1]
    rows = [[(x+u*w, y+skew*u+sweep*abs(u)**1.3,
              z+relief*(1-abs(u)**1.45)) for u in columns]
            for y,w,z,relief in profiles]
    return surface(name, rows, mat, bone, thickness, bevel, reverse=profiles[0][3]>=0)


def limb_shell(name, a, b, profiles, mat, bone, coverage=2.72,
               shift=(0,0,0), flow=.0, thickness=.008, bevel=.002, phase=0):
    """Elliptical articulated wrap with varying radius and diagonal trim lines."""
    a, b, shift = Vector(a), Vector(b), Vector(shift)
    axis = (b-a).normalized()
    front = Vector((0,0,1))
    front = (front-axis*axis.dot(front)).normalized()
    right = axis.cross(front).normalized()
    rows = []
    for t,rx,rz in profiles:
        row = []
        for j in range(25):
            angle = phase-coverage+2*coverage*j/24
            sculpt = 1+.055*math.cos(angle*3)
            center = a.lerp(b,t+flow*math.sin(angle))+shift
            row.append(center+right*(math.sin(angle)*rx)+front*(math.cos(angle)*rz*sculpt))
        rows.append(row)
    return surface(name, rows, mat, bone, thickness, bevel)


def ribbon(name, path, width, mat, bone, thickness=.003):
    path = [Vector(p) for p in path]
    rows = []
    for i,point in enumerate(path):
        tangent = path[min(i+1,len(path)-1)]-path[max(i-1,0)]
        side = Vector((-tangent.y,tangent.x,0)).normalized()*width*.5
        rows.append([point-side, point+side])
    return surface(name, rows, mat, bone, thickness, .0006, reverse=True)


def boot_shell(name, anchor, toe, mat, bone, side, rank, extras):
    """Low wedge sole with an asymmetric arch and domed toe box."""
    x,y,z = anchor
    sign = 1 if side=='l' else -1
    columns = [-1,-.88,-.56,0,.56,.88,1]
    if toe:
        profiles = [(-.052,.068,.083),(-.027,.081,.089),(.012,.084,.088),
                    (.049,.080,.076),(.080,.066,.049),(.091,.047,.024)]
    else:
        profiles = [(-.094,.050,.075),(-.075,.070,.133),(-.040,.078,.163),
                    (.003,.081,.153),(.049,.083,.121),(.093,.075,.091),(.107,.068,.072)]
    if rank==2:
        profiles = [(pz,w*.94,h*.94) for pz,w,h in profiles]
    if rank==4:
        profiles = [(pz,w*(1.025 if pz<.05 else 1),h*1.035) for pz,w,h in profiles]
    rows = []
    for pz,width,height in profiles:
        row=[]
        for u in columns:
            lateral = u*width
            lateral *= 1.04 if lateral*sign>0 else .92
            dome = max(0,1-u*u)**.30
            row.append((x+lateral,.0032+height*dome,z+pz))
        rows.append(row)
    obj=surface(name,rows,mat,bone,.007,.0025,extras,reverse=True)
    verts=[(row[0][0],.0032,row[0][2]) for row in rows]
    verts += [(row[-1][0],.0032,row[-1][2]) for row in reversed(rows)]
    mesh(name+'_Sole',verts,[tuple(range(len(verts)))],mat,bone,.0,False,extras)
    return obj


def helmet_dome(name, center, mat, bone):
    center=Vector(center)
    rows=[]
    for row in range(16):
        latitude=-.64+row*(2.14/15)
        rows.append([center+Vector((math.sin(phi)*.222*math.cos(latitude),
                     math.sin(latitude)*.230,math.cos(phi)*.201*math.cos(latitude)))
                     for phi in [.86+j*(2*math.pi-1.72)/36 for j in range(37)]])
    verts=[point for row in rows for point in row]
    faces=[(i*37+j,i*37+j+1,(i+1)*37+j+1,(i+1)*37+j)
           for i in range(15) for j in range(36)]
    cap=len(verts)
    verts.append(center+Vector((0,.232,0)))
    faces += [(15*37+j,15*37+j+1,cap) for j in range(36)]
    return finish_shell(mesh(name,verts,faces,mat,bone,smooth=True),.010,.0018)


def crown_shell(name,center,mat,bone):
    center=Vector(center)
    rows=[]
    for v in [0,.18,.40,.66,.84,1]:
        row=[]
        for u in [-1,-.86,-.65,-.36,0,.36,.65,.86,1]:
            xx=u*(.192-v*.007)
            lower=.125+.048*math.sin(math.pi*abs(u))-.006*abs(u)
            yy=lower+v*.033
            zz=.205*math.sqrt(max(.018,1-(xx/.232)**2-(yy/.248)**2))+.010
            row.append(center+Vector((xx,yy,zz)))
        rows.append(row)
    return surface(name,rows,mat,bone,.012,.002)


def joint_ring(name,center,axis,radius,section,mat,bone):
    center,axis=Vector(center),Vector(axis).normalized()
    guide=Vector((0,0,1)) if abs(axis.z)<.9 else Vector((0,1,0))
    u=axis.cross(guide).normalized()
    v=axis.cross(u).normalized()
    verts=[]
    for j in range(24):
        angle=2*math.pi*j/24
        radial=u*math.cos(angle)+v*math.sin(angle)
        for k in range(6):
            phi=2*math.pi*k/6
            verts.append(center+radial*(radius+section*math.cos(phi))+axis*(section*math.sin(phi)))
    faces=[(j*6+k,j*6+(k+1)%6,((j+1)%24)*6+(k+1)%6,((j+1)%24)*6+k)
           for j in range(24) for k in range(6)]
    return mesh(name,verts,faces,mat,bone,.0008,True)


def curved_polygon(name,outline,depth,mat,bone,thickness=.009):
    """A genuinely curved polygonal plate; outline gaps remain physical gaps."""
    outline=[Vector((x,y,0)) for x,y in outline]
    center=sum(outline,Vector())/len(outline)
    verts=[(center.x,center.y,depth(center.x,center.y)+.005)]
    count=len(outline)
    for radius in [.38,.72,1]:
        for point in outline:
            pos=center.lerp(point,radius)
            verts.append((pos.x,pos.y,depth(pos.x,pos.y)+.005))
    faces=[(0,1+j,1+(j+1)%count) for j in range(count)]
    for ring in range(2):
        for j in range(count):
            a=1+ring*count+j
            b=1+ring*count+(j+1)%count
            faces.append((a,a+count,b+count,b))
    area=sum(point.x*outline[(i+1)%count].y-outline[(i+1)%count].x*point.y
             for i,point in enumerate(outline))
    if area<0: faces=[tuple(reversed(face)) for face in faces]
    return finish_shell(mesh(name,verts,faces,mat,bone,smooth=True),thickness,.0016)


def wrapped_polygon(name,a,b,outline,profiles,mat,bone,offset=.007,thickness=.009,
                    shift=(0,0,0),flow=0,sculpt=False,edge_steps=1):
    """An obliquely cut manufactured plate on an elliptical limb surface."""
    a,b,shift=Vector(a),Vector(b),Vector(shift)
    axis=(b-a).normalized()
    front=Vector((0,0,1))
    front=(front-axis*axis.dot(front)).normalized()
    right=axis.cross(front).normalized()
    def project(point):
        t,angle=point
        for one,two in zip(profiles,profiles[1:]):
            if one[0]<=t<=two[0]:
                mix=(t-one[0])/(two[0]-one[0])
                rx=one[1]*(1-mix)+two[1]*mix
                rz=one[2]*(1-mix)+two[2]*mix
                if sculpt: rz*=1+.055*math.cos(angle*3)
                return (a.lerp(b,t+flow*math.sin(angle))+shift
                        +right*(math.sin(angle)*(rx+offset))
                        +front*(math.cos(angle)*(rz+offset)))
        raise ValueError('Plate contour exceeds its authored radius profiles')
    corners=[Vector(point) for point in outline]
    points=[point.lerp(corners[(i+1)%len(corners)],j/edge_steps)
            for i,point in enumerate(corners) for j in range(edge_steps)]
    center=sum(points,Vector((0,0)))/len(points)
    verts=[project(center)]
    count=len(points)
    for radius in [.36,.70,1]:
        verts += [project(center.lerp(point,radius)) for point in points]
    faces=[(0,1+j,1+(j+1)%count) for j in range(count)]
    for ring in range(2):
        for j in range(count):
            aa=1+ring*count+j
            bb=1+ring*count+(j+1)%count
            faces.append((aa,aa+count,bb+count,bb))
    area=sum(point.x*points[(i+1)%count].y-points[(i+1)%count].x*point.y
             for i,point in enumerate(points))
    # Axis/angle chart has its positive normal toward the inside of the wrap.
    if area>0: faces=[tuple(reversed(face)) for face in faces]
    return finish_shell(mesh(name,verts,faces,mat,bone,smooth=True),thickness,.0018)
