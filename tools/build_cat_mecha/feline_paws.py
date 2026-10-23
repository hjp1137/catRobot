"""Bare feline paws: supported quad volumes, short articulated digits and pads."""
import bpy,math,json
from mathutils import Vector
from feline_cage import surface,relief
from fur_surface import assign_fur_uv

def build_paws(p,mats,cache=None):
    p={k:Vector(v) for k,v in p.items()}
    for side in ['l','r']:
        hands(p,side,mats)
        feet(p,side,mats)


def volume(name,path,radii,across,front,mat,bone,extras=None,sole=None):
    """Noncircular authored rings: broad back, flattened pads, narrower side return."""
    across,front=Vector(across),Vector(front)
    vertices,faces=[],[]
    sides=16
    for center,(width,depth) in zip(path,radii):
        center=Vector(center)
        for j in range(sides):
            angle=math.tau*j/sides
            u,v=math.sin(angle),math.cos(angle)
            # Fingertop flattens across its middle while side walls return tightly.
            v=math.copysign(abs(v)**.72,v)
            point=center+across*(u*width)+front*(v*depth)
            if sole is not None and point.y<sole: point.y=sole
            vertices.append(point)
    for row in range(len(path)-1):
        for j in range(sides):
            a=row*sides+j;b=row*sides+(j+1)%sides
            faces.append((a,b,b+sides,a+sides))
    faces.extend([tuple(reversed(range(sides))),tuple(range(len(vertices)-sides,len(vertices)))])
    center=sum([Vector(q) for q in path],Vector())/len(path)
    extents=[max(abs(q[k]-center[k]) for q in vertices)+.001 for k in range(3)]
    high=surface(name,vertices,faces,mat,bone,
                 lambda o:assign_fur_uv(o,center,extents,True),extras)
    high['shape_notes']='Authored varying quad sections, broad dorsal plane and flattened palmar/plantar return'
    return high


def fuse(name,objects,voxel=.0017):
    """Unite metacarpal/thenar roots; preserve each editable quad cage in source."""
    controls=[o.get('control_cage','') for o in objects]
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects: obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join()
    out=bpy.context.object;out.name=name
    mod=out.modifiers.new('Continuous paw web and thenar union','REMESH')
    mod.mode='VOXEL';mod.voxel_size=voxel;mod.use_smooth_shade=True
    bpy.ops.object.modifier_apply(modifier=mod.name)
    mod=out.modifiers.new('Palm root sculpt relaxation','SMOOTH')
    mod.factor=.28;mod.iterations=2
    bpy.ops.object.modifier_apply(modifier=mod.name)
    out['control_cages']=json.dumps(controls)
    out['surface_detail']='Subdivided quad cages joined at real roots; sculpt relaxation preserves finger/toe clefts'
    points=[Vector((v.co.x,v.co.z,-v.co.y)) for v in out.data.vertices]
    center=sum(points,Vector())/len(points)
    extents=[max(abs(q[k]-center[k]) for q in points)+.001 for k in range(3)]
    assign_fur_uv(out,center,extents,True)
    return out

def hands(p,side,mats):
    bone='hand_'+side;c=p[bone]+Vector((0,-.022,.018));s=1 if side=='l' else -1
    # Broaden the paw across its knuckles; preserve axial digit length and wrist anchor.
    def point(t,u,z): return c+Vector((s*t,u*1.20,z*1.15))
    rows=[(-.049,.024,.023),(-.039,.034,.031),(-.021,.047,.040),
          (.002,.056,.043),(.023,.060,.039),(.040,.056,.030),(.048,.042,.021)]
    palm=volume('Body_Master_Palm_'+side,[point(t,0,-.003) for t,w,d in rows],
                [(w,d) for t,w,d in rows],(0,1,0),(0,0,1),mats['Cream'],bone)
    parts=[palm]
    for digit,(u,length) in enumerate([(-.044,.057),(-.015,.074),(.015,.078),(.043,.064)]):
        ts=[.027,.040,.055,.071,.084,.093]
        zs=[-.002,.003,.010,.021,.034,.041]
        path=[point(.027+(t-.027)*length/.066,u,z) for t,z in zip(ts,zs)]
        radii=[(.015,.020),(.018,.020),(.018,.018),(.016,.016),(.012,.012),(.004,.005)]
        radii=[(w*1.18,d*1.15) for w,d in radii]
        parts.append(volume('Body_Master_Digit_'+side+str(digit),path,radii,
                            (0,1,0),(0,0,1),mats['Cream'],bone))
        tip=path[-1]
        # The cap contracts under subdivision/remeshing: root inside the preceding fleshy ring.
        root=path[-2].lerp(tip,.12)
        volume('Body_Master_Claw_'+side+str(digit),[root,tip,
               tip+Vector((s*.010,0,.005)),tip+Vector((s*.015,0,.002))],
               [(.0053,.0053),(.0042,.0042),(.0033,.0033),(.0005,.0005)],
               (0,1,0),(0,0,1),mats['Claw'],bone)
        padpath=[point(.049,u,.023),point(.063,u,.031),point(.077,u,.034)]
        volume('Body_Master_DigitPad_'+side+str(digit),padpath,
               [(.0083,.0022),(.0142,.0044),(.0071,.0022)],(0,1,0),(0,0,1),mats['Pink'],bone)
    thumbpath=[point(-.019,-.030,.003),point(-.007,-.046,.011),
               point(.010,-.060,.023),point(.032,-.062,.034),point(.046,-.055,.040)]
    parts.append(volume('Body_Master_Thumb_'+side,thumbpath,
                        [(.0295,.0276),(.0307,.0276),(.0248,.0253),(.0189,.0196),(.0059,.0081)],
                        (0,1,0),(0,0,1),mats['Cream'],bone))
    thumbroot=thumbpath[-2].lerp(thumbpath[-1],.12)
    volume('Body_Master_ThumbClaw_'+side,[thumbroot,thumbpath[-1],
           thumbpath[-1]+Vector((s*.008,.003,.004)),thumbpath[-1]+Vector((s*.012,.005,.001))],
           [(.0053,.0055),(.004,.0042),(.0033,.0033),(.0005,.0005)],
           (0,1,0),(0,0,1),mats['Claw'],bone)
    palm=fuse('Body_Master_HandPaw_'+side,parts)
    palm['proportion_notes']='v4 broad palm +20 percent, thicker short fingers; original palm anchor and axial finger lengths retained'
    relief(palm,.00014)
    padpath=[point(-.022,0,.032),point(-.009,0,.038),point(.008,0,.039),point(.020,0,.031)]
    volume('Body_Master_PalmPad_'+side,padpath,[(.0168,.0022),(.036,.0044),(.0324,.0044),(.0156,.0022)],
           (0,1,0),(0,0,1),mats['Pink'],bone)

def feet(p,side,mats):
    c=p['foot_'+side];bone='foot_'+side;s=1 if side=='l' else -1
    extras={'foot_side':side,'foot_bone':bone}
    # Heel/ankle flows into a lower broad metatarsal mass; no spherical ankle stuck on a shoe.
    profiles=[(-.107,.018,.052,.007),(-.094,.040,.083,.005),(-.072,.051,.116,.005),
              (-.045,.057,.132,.010),(-.013,.074,.119,.014),(.019,.089,.095,.008),
              (.050,.0924,.078,.005),(.078,.0828,.063,.005),(.093,.0624,.046,.006)]
    vertices,faces=[],[]
    sides=24
    for z,w,top,bottom in profiles:
        for j in range(sides):
            angle=math.tau*j/sides;u=math.sin(angle);v=math.cos(angle)
            y=bottom+(top-bottom)*((v+1)*.5)**.70
            if v<-.60:y=bottom
            x=c.x+u*w*(1.025 if u*s>0 else .97)
            # The central metatarsal lift runs into short toes, rather than a box toe cap.
            y+=.0035*math.exp(-((z-.028)/.044)**2)*(1-u*u)*max(v,0)
            vertices.append((x,y,z))
    for row in range(len(profiles)-1):
        for j in range(sides):
            a=row*sides+j;b=row*sides+(j+1)%sides
            faces.append((a,b,b+sides,a+sides))
    faces.extend([tuple(reversed(range(sides))),tuple(range(len(vertices)-sides,len(vertices)))])
    main=surface('Body_Master_PlantarVolume_'+side,vertices,faces,mats['Cream'],bone,
                 lambda o:assign_fur_uv(o,(c.x,.062,.032),(.096,.070,.145),True),extras)
    main['shape_notes']='Sculpted heel, raised ankle bridge, shallow plantar arch, splayed low forefoot and stable floor'
    parts=[main]
    toes(p,side,mats,c,parts)
    foot=fuse('Body_Master_FootPaw_'+side,parts,.0015)
    relief(foot,.00013)
    for vertex in foot.data.vertices: vertex.co.z=max(.004,vertex.co.z)
    foot.data.update()
    foot['stage0_binding_note']='Whole high paw uses foot reference; foot/ball low-poly split is deferred until shape acceptance'
    foot['proportion_notes']='v4 forefoot width +20 percent with a narrow ankle transition; toe lengths and stable sole unchanged'


def toes(p,side,mats,c,parts):
    ball='ball_'+side
    extras={'foot_side':side,'foot_bone':ball}
    for digit,(offset,tip) in enumerate([(-.053,.153),(-.018,.167),(.018,.165),(.052,.150)]):
        x=c.x+offset*1.20
        path=[(x,.032,.059),(x,.033,.082),(x,.035,.104),
              (x,.033,tip-.027),(x,.028,tip-.009),(x,.023,tip)]
        radii=[(.017,.019),(.022,.024),(.023,.025),(.022,.023),(.016,.017),(.004,.006)]
        path=[(x,.004+(y-.004)*1.12,z) for x,y,z in path]
        radii=[(w*1.20,d*1.12) for w,d in radii]
        parts.append(volume('Body_Master_Toe_'+side+str(digit),path,radii,
                            (1,0,0),(0,1,0),mats['Cream'],ball,extras,sole=.004))
        claw=[(x,.025,tip-.006),(x,.027,tip+.005),(x,.021,tip+.013)]
        claw=[(x,.004+(y-.004)*1.12,z) for x,y,z in claw]
        volume('Body_Master_ToeClaw_'+side+str(digit),claw,
               [(.0051,.0051),(.0042,.0035),(.0006,.0005)],
               (1,0,0),(0,1,0),mats['Claw'],ball,extras)
        # Rounded bean with an upper root entering the real toe underside, not a floor disc.
        # Center minus depth already equals the sole; clamp does not flatten the bean.
        pad=[(x,.014,.103),(x,.015,.124),(x,.0136,tip-.012)]
        volume('Body_Master_ToePad_'+side+str(digit),pad,
               [(.012,.010),(.018,.011),(.0096,.0096)],
               (1,0,0),(0,1,0),mats['Pink'],ball,extras,sole=.004)
    # Rounded triangular metatarsal pad: narrow heel and three-lobed forward edge.
    path=[(c.x,.011,-.057),(c.x,.013,-.035),(c.x,.017,-.006),
          (c.x,.015,.024),(c.x,.012,.047),(c.x,.011,.059)]
    volume('Body_Master_PlantarPad_'+side,path,
           [(.0144,.007),(.0288,.009),(.0444,.013),(.0516,.011),(.042,.008),(.0192,.007)],
           (1,0,0),(0,1,0),mats['Pink'],'foot_'+side,
           {'foot_side':side,'foot_bone':'foot_'+side},sole=.004)
