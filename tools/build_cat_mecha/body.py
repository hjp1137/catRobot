"""Original adult feline surface; exact UAL rest bones and palm anchors retained."""
import bpy, math
from mathutils import Vector
from geometry import ellipsoid, tube, bar, loft, panel, mesh
from fur_surface import assign_fur_uv, assign_axis_uv


def build_body(points, mats, skip_face=False):
    p={k:Vector(value) for k,value in points.items()}
    fur,cream=mats['FurTorso'],mats['Cream']
    loft('Body_Fur_Torso',[(.77,.12,.10,-.02),(.87,.175,.137,-.025),(.99,.164,.128,-.012),
         (1.10,.153,.127,-.008),(1.22,.205,.149,-.018),(1.34,.235,.155,-.023),
         (1.405,.212,.140,-.027),(1.458,.127,.098,-.027)],fur,'TORSO',48,0,True)
    tube('Body_Fur_Neck',p['spine_03'],p['Head'],[(0,.111),(.55,.100),(1,.084)],mats['Fur'],'neck_01',32)
    head=p['Head']+Vector((0,.090,.008))
    if not skip_face: sculpt_head(head,mats)
    build_ears(head,mats)
    if not skip_face:
        build_eyes(head,mats)
        build_nose(head,mats)
    build_limbs(p,mats)
    build_tail(p,mats)
    for obj in list(bpy.context.scene.objects):
        if obj.type!='MESH' or not obj.name.startswith('Body_'): continue
        names=[m.name for m in obj.data.materials]
        bone=obj.get('bind_bone','')
        limb=next((k for k in ['upperarm','lowerarm','thigh','calf'] if bone.startswith(k)),None)
        if 'FurHead' in names:
            assign_fur_uv(obj,head,(.208,.215,.187))
        elif limb:
            target={'upperarm':'lowerarm','lowerarm':'hand','thigh':'calf','calf':'foot'}[limb]
            assign_axis_uv(obj,p[bone],p[target+bone[bone.rfind('_'):]],.07)
        elif any(n.startswith('Fur') or n=='Cream' for n in names):
            assign_fur_uv(obj,(0,1.04,0),(.25,.95,.20),True)


def sculpt_head(head,mats):
    fur=mats['FurHead']
    profiles=[(-.155,.054,.083,.008),(-.130,.100,.116,.012),(-.102,.143,.139,.010),
              (-.060,.191,.166,.0),(-.020,.201,.178,-.005),(.040,.193,.178,-.005),
              (.075,.188,.173,-.010),(.125,.166,.147,-.020),(.166,.108,.095,-.023),(.186,.008,.009,-.025)]
    curved=[]
    for i in range(len(profiles)-1):
        a,b,c,d=[Vector(profiles[max(0,min(len(profiles)-1,j))]) for j in [i-1,i,i+1,i+2]]
        for j in range(4):
            t=j/4
            q=.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t)
            curved.append((head.y+q[0],max(.004,q[1]),max(.004,q[2]),head.z+q[3]))
    y,w,d,z=profiles[-1]
    curved.append((head.y+y,w,d,head.z+z))
    pieces=[loft('Body_HeadCore',curved,fur,'Head',64,0,True)]
    pieces.append(ellipsoid('Body_HeadChin',head+Vector((0,-.106,.151)),(.072,.025,.034),fur,'Head',32,18))
    pieces.append(ellipsoid('Body_HeadNasalBridge',head+Vector((0,-.029,.170)),(.035,.062,.036),fur,'Head',32,18))
    for side in [-1,1]:
        pieces.append(ellipsoid('Body_HeadMuzzle',head+Vector((side*.048,-.069,.177)),(.062,.035,.043),fur,'Head',32,18))
        pieces.append(ellipsoid('Body_HeadBrow',head+Vector((side*.087,.052,.145)),(.070,.010,.028),fur,'Head',32,16))
    bpy.ops.object.select_all(action='DESELECT')
    for obj in pieces: obj.select_set(True)
    bpy.context.view_layer.objects.active=pieces[0]
    bpy.ops.object.join()
    obj=bpy.context.object
    obj.name='Body_Fur_HeadSculpt'
    modifier=obj.modifiers.new('Offline fused feline facial planes','REMESH')
    modifier.mode='VOXEL'
    modifier.voxel_size=.0055
    modifier.use_smooth_shade=True
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    modifier=obj.modifiers.new('Sculpt surface relaxation','SMOOTH')
    modifier.factor=.55
    modifier.iterations=4
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    for poly in obj.data.polygons: poly.use_smooth=True
    modifier=obj.modifiers.new('Offline facial topology reduction','DECIMATE')
    modifier.ratio=.34
    bpy.ops.object.modifier_apply(modifier=modifier.name)


def build_ears(head,mats):
    for side in [-1,1]:
        x=side*.137
        outline=[(x-side*.073,head.y+.141,head.z-.003),(x+side*.080,head.y+.135,head.z-.020),
                 (side*.184,head.y+.338,head.z-.037),(side*.159,head.y+.326,head.z+.008)]
        panel('Body_FurHead_Ear_'+str(side),outline,.023,mats['FurHead'],'Head',.008)
        inner=[(x-side*.049,head.y+.163,head.z+.010),(x+side*.053,head.y+.159,head.z-.001),
               (side*.176,head.y+.303,head.z-.012)]
        panel('Body_Pink_Ear_'+str(side),inner,.005,mats['Pink'],'Head',.004)
        for j in range(5):
            a=head+Vector((x+side*(.038-j*.006),.172+j*.015,.012))
            b=a+Vector((side*.007,.019,.006))
            tube('Body_Cream_EarFuzz'+str(side)+str(j),a,b,[(0,.0009),(1,.0001)],mats['Cream'],'Head',5)


def eye_patch(name,center,width,height,mat,side,bulge=.009):
    verts=[Vector(center)+Vector((0,0,bulge))]
    faces=[]
    for row in range(1,5):
        r=row/4
        for j in range(40):
            a=j*2*math.pi/40
            x=math.cos(a)*width*r
            opening=height if math.sin(a)>0 else height*.77
            exponent=0 if mat.name=='Eye' else .42
            y=math.sin(a)*abs(math.sin(a))**exponent*opening*r+side*x*.26
            z=bulge*(1-r*r)-.035*(x/.068)**2-side*x*.18
            verts.append(Vector(center)+Vector((x,y,z)))
    for j in range(40): faces.append((0,1+j,1+(j+1)%40))
    for row in range(3):
        a,b=1+row*40,1+(row+1)*40
        for j in range(40): faces.append((a+j,b+j,b+(j+1)%40,a+(j+1)%40))
    obj=mesh(name,verts,faces,mat,'Head',smooth=True)
    uv=obj.data.uv_layers.new(name='UVMap')
    for loop in obj.data.loops:
        i=loop.vertex_index
        if i==0: pair=(.5,.5)
        else:
            r=((i-1)//40+1)/4
            a=(i-1)%40*2*math.pi/40
            pair=(.5+math.cos(a)*r*.5,.5+math.sin(a)*r*.5)
        uv.data[loop.index].uv=pair
    return obj


def build_eyes(head,mats):
    for side in [-1,1]:
        c=head+Vector((side*.087,.017,.174))
        eye_patch('Body_Dark_EyeSocket'+str(side),c,.067,.039,mats['EyeRim'],side,.004)
        eye_patch('Body_EyeWhite'+str(side),c+Vector((0,0,.0015)),.064,.036,mats['EyeWhite'],side,.005)
        eye_patch('Body_Eye_Iris'+str(side),c+Vector((0,0,.004)),.043,.034,mats['Eye'],side,.006)
        eye_patch('Body_Dark_Pupil'+str(side),c+Vector((0,.001,.013)),.0105,.026,mats['Pupil'],side,.001)
        ellipsoid('Body_Shine_Eye'+str(side),c+Vector((-.016,.014,.016)),(.0027,.0036,.0014),mats['Shine'],'Head',12,8)
        for upper in [True,False]:
            path=[]
            for j in range(19):
                a=math.pi*j/18+(0 if upper else math.pi)
                x=math.cos(a)*.065
                y=math.sin(a)*abs(math.sin(a))**.42*(.037 if upper else .029)+side*x*.26
                q=c+Vector((x,y,.005-.035*(x/.068)**2-side*x*.18))
                path.append(q)
            lid_surface('Body_EyeRim_Lid'+str(side)+str(upper),path,.0013 if upper else .0006,mats['EyeRim'])


def lid_surface(name,path,radius,mat):
    # One continuous low density sweep preserves the same visible eyelid curve.
    verts,faces=[],[]
    sides=6
    for i,point in enumerate(path):
        axis=(path[min(i+1,len(path)-1)]-path[max(i-1,0)]).normalized()
        right=axis.cross(Vector((0,0,1))).normalized()
        front=right.cross(axis).normalized()
        for j in range(sides):
            angle=j*2*math.pi/sides
            verts.append(point+radius*(right*math.cos(angle)+front*math.sin(angle)))
    for i in range(len(path)-1):
        for j in range(sides):
            a=i*sides+j
            b=i*sides+(j+1)%sides
            faces.append((a,b,b+sides,a+sides))
    faces.extend([tuple(reversed(range(sides))),tuple(range((len(path)-1)*sides,len(path)*sides))])
    mesh(name,verts,faces,mat,'Head',smooth=True)


def build_nose(head,mats):
    nose=head+Vector((0,-.047,.220))
    panel('Body_Pink_Nose',[(nose.x-.024,nose.y+.011,nose.z),(nose.x+.024,nose.y+.011,nose.z),
                          (0,nose.y-.018,nose.z+.005)],.013,mats['Pink'],'Head',.007)
    for side in [-1,1]:
        ellipsoid('Body_Dark_Nostril'+str(side),nose+Vector((side*.016,.0,.004)),(.004,.0025,.002),mats['Dark'],'Head',12,8)
        a=nose+Vector((0,-.018,.002))
        b=nose+Vector((0,-.043,-.010))
        bar('Body_Dark_Philtrum'+str(side),a,b,.0019,mats['Dark'],'Head',8)
        bar('Body_Dark_Mouth'+str(side),b,b+Vector((side*.043,.009,-.009)),.0017,mats['Dark'],'Head',8)
        for j in range(3):
            root=head+Vector((side*.073,-.060-j*.014,.214-j*.003))
            tip=head+Vector((side*(.205+j*.006),-.050-j*.027,.193))
            tube('Body_Whisker'+str(side)+str(j),root,tip,[(0,.0004),(1,.00008)],mats['Whisker'],'Head',5)


def build_limbs(p,mats):
    fur,cream=mats['Fur'],mats['Cream']
    for side in ['l','r']:
        for arm in [True,False]:
            upper,lower,end=[('upperarm_','lowerarm_','hand_'),('thigh_','calf_','foot_')][not arm]
            upper,lower,end=upper+side,lower+side,end+side
            a,b,c=p[upper],p[lower],p[end]
            radius=.064 if arm else .080
            ellipsoid('Body_Fur_SoftJoint_'+lower,b,(radius*.81,radius*.81,radius*.81),fur,lower,24,16)
            if arm: ellipsoid('Body_Fur_Deltoid_'+upper,a,(.076,.075,.074),fur,upper,24,16)
            tube('Body_Fur_'+upper,a,b,[(0,radius*.96),(.2,radius*1.16),(.58,radius),(.98,radius*.77)],fur,upper,32)
            tube('Body_Fur_'+lower,b,c,[(.02,radius*.80),(.3,radius*.87),(.78,radius*.65),(1,radius*.62)],fur,lower,32)
            if arm:
                unit=(p['Head'].y-p['foot_l'].y)/1.58
                palm=c+Vector((0,-.025,.018))*unit
                ellipsoid('Body_Cream_Paw_'+side,palm,(.060,.062,.055),cream,end,32,18)
                for j in range(3):
                    base=palm+Vector(((j-1)*.034,-.022,.037))
                    knuckle=base+Vector(((j-1)*.003,-.021,.029))
                    tip=knuckle+Vector((0,.005,.027))
                    tube('Body_Cream_Finger'+side+str(j),base,knuckle,[(0,.018),(1,.016)],cream,end,16)
                    tube('Body_Cream_Digit'+side+str(j),knuckle,tip,[(0,.016),(1,.011)],cream,end,16)
                    ellipsoid('Body_Dark_Claw'+side+str(j),tip+Vector((0,0,.008)),(.007,.007,.015),mats['Claw'],end,12,8)
                ellipsoid('Body_Cream_Thumb'+side,palm+Vector((-.047,-.010,.021)),(.018,.029,.022),cream,end,16,10)
            else:
                extras={'foot_side':side,'foot_bone':end}
                ellipsoid('Body_Paws_'+side+'_foot',c+Vector((0,-.051,.024)),(.079,.049,.101),cream,end,24,12,extras)
                ball='ball_'+side
                for j in range(3):
                    ellipsoid('Body_Paws_'+side+'_toe'+str(j),p[ball]+Vector(((j-1)*.04,.014,.025)),
                              (.030,.026,.047),cream,ball,16,10,{'foot_side':side,'foot_bone':ball})


def build_tail(p,mats):
    path=[Vector((0,.83,-.13)),Vector((0,.78,-.25)),Vector((.10,.76,-.40)),
          Vector((.25,.82,-.50)),Vector((.35,.94,-.51)),Vector((.39,1.065,-.47))]
    for i in range(len(path)-1):
        radius=.043-i*.0045
        tube('Body_Fur_Tail'+str(i),path[i],path[i+1],[(0,radius),(1,radius-.0045)],mats['Fur'],'pelvis',28)
        ellipsoid('Body_Fur_TailJoint'+str(i),path[i],(radius,radius,radius),mats['Fur'],'pelvis',24,12)
    ellipsoid('Body_Fur_TailTip',path[-1],(.021,.027,.021),mats['Fur'],'pelvis',20,12)
