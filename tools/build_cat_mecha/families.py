"""Small engraved family modules and thin astral tail articulation."""
from mathutils import Vector
from geometry import panel, ellipsoid
from armor_shapes import limb_shell, ribbon
from armor import TIERS, tag

FAMILIES=['assault','bastion','strider','artillery','ward']
TAIL_PATH=[(0,.83,-.13),(0,.78,-.25),(.10,.76,-.40),
           (.25,.82,-.50),(.35,.94,-.51),(.39,1.065,-.47)]


def build_families(points,materials):
    p={k:Vector(value) for k,value in points.items()}
    for rank,tier in enumerate(TIERS):
        c={'tier':tier}
        helmet_center=p['Head']+Vector((0,.240,.185)) if rank>=2 else p['Head']+Vector((.196,.080,.107))
        shoulder_t=.31 if rank==4 else (.285 if rank>=2 else .20)
        shoulder_z=[.059,.114,.124,.124,.1535][rank]
        anchors={'helmet':('Head',helmet_center,.010),
                 'chest':('spine_03',Vector((0,1.270,.211)),.013),
                 'armor':('upperarm_l',p['upperarm_l'].lerp(p['lowerarm_l'],shoulder_t)+Vector((0,.023,shoulder_z)),.011),
                 'legs':('pelvis',Vector((0,.904,.171)),.010),
                 'boots':('calf_l',Vector((p['calf_l'].x,.381,.104 if rank>=2 else .099)),.010),
                 'ring':('lowerarm_l',p['lowerarm_l'].lerp(p['hand_l'],.915)+Vector((0,0,.081)),.008)}
        for slot,(bone,center,size) in anchors.items():
            for family in FAMILIES:
                prefix=tag(c,slot,'Family_'+family+'_'+bone)
                mat=materials[tier]['ArmorEdge']
                x,y,z=center
                extras={'family':family}
                if family=='assault':
                    outline=[(x-size,y+size*.7,z),(x,y+size*1.2,z+.002),
                             (x+size,y+size*.7,z),(x,y-size,z+.003)]
                    panel(prefix,outline,.003,mat,bone,.0008,extras)
                elif family=='bastion':
                    outline=[(x-size,y+size,z),(x+size,y+size,z),
                             (x+size*.8,y-size*.4,z+.002),(x,y-size,z+.003),
                             (x-size*.8,y-size*.4,z+.002)]
                    panel(prefix,outline,.003,mat,bone,.0008,extras)
                elif family=='strider':
                    for s in [-1,1]:
                        outline=[(x,y+size*.4,z),(x+s*size*1.3,y+size*.7,z),
                                 (x+s*size*.4,y-size*.7,z+.002)]
                        panel(prefix+str(s),outline,.003,mat,bone,.0008,extras)
                elif family=='artillery':
                    for j in [-1,0,1]:
                        xx=x+j*size*.65
                        panel(prefix+str(j),[(xx-size*.17,y+size*.8,z),
                              (xx+size*.17,y+size*.8,z),(xx+size*.17,y-size*.8,z),
                              (xx-size*.17,y-size*.8,z)],.003,mat,bone,.0005,extras)
                else:
                    outline=[(x,y+size*1.2,z),(x+size*.7,y,z+.003),
                             (x,y-size*1.2,z),(x-size*.7,y,z+.003)]
                    panel(prefix,outline,.003,mat,bone,.0008,extras)


def astral_segments(points,mats):
    path=[Vector(value) for value in TAIL_PATH]
    c={'tier':'astral'}
    for j in range(len(path)-1):
        a,b=path[j],path[j+1]
        radius=.046-j*.0047
        for piece,(start,end) in enumerate([(.035,.485),(.515,.965)]):
            length=end-start
            profiles=[(start,radius*.94,radius*.94),
                      (start+length*.20,radius,radius),
                      (end-length*.20,radius*.94,radius*.94),
                      (end,radius*.84,radius*.84)]
            limb_shell(tag(c,'legs','pelvis_ThinTailSegment%s_%s'%(j,piece)),
                       a,b,profiles,mats['ArmorShell'],'pelvis',3.1415,
                       thickness=.004,bevel=.001)
        if j>0:
            at=a.lerp(b,.30)+Vector((0,radius*.95,.006))
            to=a.lerp(b,.43)+Vector((0,radius*.95,.006))
            ribbon(tag(c,'legs','pelvis_TailSignal'+str(j)),[at,to],.003,
                   mats['ArmorGem'],'pelvis',.0015)
