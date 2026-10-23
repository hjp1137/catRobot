"""Unarmored adult feline anatomy authored as local quad control surfaces."""
import math
from mathutils import Vector
from feline_cage import surface,tube_cage,relief
from fur_surface import assign_fur_uv

def bump(x,y,cx,cy,rx,ry): return math.exp(-((x-cx)/rx)**2-((y-cy)/ry)**2)

def torso(mats):
    profiles=[(.775,.075,.086,-.018),(.815,.137,.122,-.017),(.865,.183,.149,-.020),
              (.920,.193,.158,-.022),(.980,.182,.152,-.018),(1.045,.174,.145,-.014),
              (1.115,.180,.157,-.014),(1.205,.207,.171,-.022),(1.285,.236,.176,-.029),
              (1.355,.251,.161,-.032),(1.410,.233,.128,-.026),(1.450,.173,.103,-.014),
              (1.482,.127,.097,-.006),(1.520,.105,.090,.001),(1.553,.087,.079,.005),
              (1.567,.052,.052,.006)]
    verts,faces=[],[]
    for y,width,depth,offset in profiles:
        for j in range(32):
            angle=j*math.tau/32; x=math.sin(angle)*width; c=math.cos(angle)
            z=c*depth+offset
            if c>0:
                z+=c*c*(.011*bump(x,y,.095,1.305,.080,.077)+.011*bump(x,y,-.095,1.305,.080,.077))
                z-=c*c*.004*bump(x,y,0,1.29,.020,.13)
                z+=c*c*.008*bump(x,y,0,1.12,.08,.12)
            else:
                z-=c*c*(.012*bump(x,y,.13,1.335,.060,.09)+.012*bump(x,y,-.13,1.335,.060,.09))
                z+=c*c*.006*bump(x,y,0,1.27,.020,.18)
            verts.append((x,y,z))
    for i in range(len(profiles)-1):
        for j in range(32):
            a=i*32+j; b=i*32+(j+1)%32; faces.append((a,b,b+32,a+32))
    faces.extend([tuple(reversed(range(32))),tuple(range((len(profiles)-1)*32,len(verts)))])
    high=surface('Body_Master_TorsoNeck',verts,faces,mats['FurTorso'],'TORSO',
                 lambda o:assign_fur_uv(o,(0,1.04,0),(.25,.95,.20),True))
    high['shape_notes']='Continuous pelvis, waist, rib cage, scapula planes and tapered neck; no neck cylinder or shoulder balls'
    relief(high)

def build_body_master(points,mats):
    p={k:Vector(v) for k,v in points.items()}
    for side,sign in [('l',1),('r',-1)]:
        for key in ['thigh_','calf_','foot_','ball_']: p[key+side].x+=sign*.015
    torso(mats)
    limbs(p,mats)
    shoulder_bridges(mats)
    from feline_paws import build_paws
    from feline_ears import build_ears
    build_paws(p,mats)
    build_ears(p['Head']+Vector((0,.090,.008)),mats)
    path=[(0,.881,-.111),(0,.855,-.154),(0,.804,-.224),(.033,.777,-.304),
          (.109,.787,-.395),(.200,.825,-.460),(.280,.884,-.482),
          (.332,.959,-.473),(.352,1.026,-.445),(.354,1.064,-.427)]
    radii=[(.050,.046),(.047,.043),(.043,.039),(.039,.035),(.035,.032),
           (.031,.029),(.028,.026),(.024,.023),(.018,.018),(.006,.006)]
    tail=tube_cage('Body_Master_Tail',path,radii,mats['Fur'],'pelvis',20)
    tail['shape_notes']='One continuous curved quad tube from broad tail root to rounded taper'
    relief(tail)
    from feline_union import pose_and_unite
    pose_and_unite(p)

def limbs(p,mats):
    for side in ['l','r']:
        for arm in [True,False]:
            upper,lower,end=[('upperarm_','lowerarm_','hand_'),('thigh_','calf_','foot_')][not arm]
            upper,lower,end=upper+side,lower+side,end+side
            a,b,c=p[upper],p[lower],p[end]
            if arm:
                sections=[(-.30,.057,.057),(-.08,.072,.066),(.12,.086,.074),
                          (.31,.077,.070),(.55,.066,.061),(.79,.053,.050),
                          (.94,.049,.045),(1.00,.047,.045)]
                distal=[(.07,.050,.047),(.18,.057,.053),
                        (.39,.060,.054),(.62,.050,.044),(.82,.041,.038),(1.04,.036,.035)]
            else:
                sections=[(-.18,.068,.072),(.00,.085,.089),(.16,.091,.094),
                          (.35,.087,.090),(.57,.074,.079),(.78,.059,.064),
                          (.94,.052,.054),(1.00,.050,.051)]
                distal=[(.07,.053,.056),(.18,.059,.067),
                        (.36,.064,.073),(.55,.055,.062),(.75,.043,.046),
                        (.94,.037,.038),(1.03,.037,.037)]
            path=[a.lerp(b,t) for t,_,_ in sections]+[b.lerp(c,t) for t,_,_ in distal]
            radii=[(u*(1.13 if arm else 1.17),v*(1.12 if arm else 1.16)) for _,u,v in sections]
            radii += [(u*(1.13 if arm else (1.16 if t<.60 else 1.09)),
                       v*(1.12 if arm else (1.14 if t<.60 else 1.08))) for t,u,v in distal]
            name='Body_Master_'+('Arm_' if arm else 'Leg_')+side
            high=tube_cage(name,path,radii,mats['Fur'],upper,20)
            high['shape_notes']='One continuous authored quad control chain across elbow/knee; no capped joint seam'
            high['bone_references']=','.join([upper,lower,end])
            relief(high)

def shoulder_bridges(mats):
    # This is an authored clavicle/trapezius transition, inside the existing back envelope.
    rows=[(.072,1.475,-.012,.031,.030),(.105,1.465,-.015,.034,.035),
          (.145,1.445,-.020,.039,.042),(.190,1.423,-.032,.046,.046),
          (.223,1.399,-.045,.048,.044),(.242,1.376,-.055,.044,.038)]
    for sign in [-1,1]:
        high=tube_cage('Body_Master_ShoulderBridge_'+str(sign),
                       [(sign*x,y,z) for x,y,z,_,_ in rows],[(a,b) for _,_,_,a,b in rows],
                       mats['FurTorso'],'TORSO',20)
        high['review_pose_applied']=True
        high['shape_notes']='Local clavicle and trapezius bridge joining neck/chest to deltoid; back contour preserved'
