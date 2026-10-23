"""Original split greaves, angled ankle links and articulated feline sabatons."""
import bpy,math
from mathutils import Vector
from armor_shapes import limb_shell,curved_polygon,surface,boot_shell,joint_ring,ribbon,shield


def fitted_body_liner(c,slot,parts):
    """Cover the real animated feline surface, using the exact same bound bone."""
    for name in parts:
        source=bpy.data.objects[name]
        source.data.update()
        obj=source.copy()
        obj.data=source.data.copy()
        obj.name='Tier_%s_Slot_%s_FittedLiner_%s'%(c['tier'],slot,name.removeprefix('Body_'))
        bpy.context.collection.objects.link(obj)
        obj.data.materials.clear()
        obj.data.materials.append(c['m']['ArmorLiner'])
        for polygon in obj.data.polygons: polygon.material_index=0
        for vertex,original in zip(obj.data.vertices,source.data.vertices):
            vertex.co+=original.normal*.0015
        obj.data.update()


def build_boots(c,side,b,d,foot,ball):
    rank,m,p=c['rank'],c['m'],c['p']
    shell,edge,liner,gem=[m[k] for k in ['ArmorShell','ArmorEdge','ArmorLiner','ArmorGem']]
    trim=m['ArmorTrim']
    lower='calf_'+side
    sign=1 if side=='l' else -1
    pre=lambda part:'Tier_%s_Slot_boots_%s'%(c['tier'],part)
    before=set(bpy.context.scene.objects)
    if rank<2:
        shield(pre(lower+'_EarlyShinGuard'),[(.461,.039,.072,.022),(.414,.051,.074,.025),
               (.291,.032,.059,.027),(.179,.019,.036,.025)],shell,lower,x=b.x,thickness=.007)
        if rank==1:
            shield(pre(foot+'_EarlyInstep'),[(.145,.034,-.053,.025),(.119,.052,-.009,.034),
                   (.084,.047,.052,.026)],shell,foot,x=d.x,thickness=.006)
        return
    fitted_body_liner(c,'boots',['Body_Fur_'+lower]+[
        obj.name for obj in bpy.context.scene.objects if obj.name.startswith('Body_Paws_'+side+'_')])
    # A recessed dark/navy under-shell remains visible through physical panel gaps.
    base=trim if rank==4 else liner
    limb_shell(pre(lower+'_RecessedCalfFrame'),b,d,[(.13,.059,.071),(.28,.064,.076),
               (.52,.061,.070),(.79,.049,.058),(.97,.047,.054)],base,lower,3.1415,
               thickness=.004,bevel=.001)
    def depth(x,y):
        t=(y-d.y)/(b.y-d.y)
        radius=.063+.025*math.sin(max(0,min(1,t))*math.pi)
        return b.z+radius+.014*max(0,1-((x-b.x)/.076)**2)
    top=[(-.037,.478),(.021,.488),(.062,.450),(.048,.380),(.011,.337),(-.042,.361),(-.054,.414)]
    bottom=[(-.041,.354),(.013,.329),(.040,.294),(.034,.217),(.008,.157),(-.027,.178),(-.043,.288)]
    for name,outline in [('UpperObliqueShin',top),('LowerObliqueShin',bottom)]:
        outline=[(b.x+sign*x,y) for x,y in outline]
        curved_polygon(pre(lower+'_'+name),outline,depth,shell,lower,.007)
    limb_shell(pre(lower+'_OuterDirectionalLeaf'),b,d,[(.22,.072,.088),(.35,.080,.091),
               (.59,.067,.083),(.82,.055,.064)],shell,lower,.48,phase=-sign*1.26,
               flow=-sign*.065,thickness=.007,bevel=.0016)
    limb_shell(pre(lower+'_AnkleBellows'),b,d,[(.84,.052,.060),(.95,.049,.058),
               (1.04,.047,.052)],liner,lower,3.1415,thickness=.004,bevel=.001)
    # Separate soles preserve the original single-bone foot and ball groups.
    for bone,anchor,toe in [(foot,d,False),(ball,p[ball],True)]:
        boot_shell(pre(bone+'_RecessedSole'),anchor,toe,liner,bone,side,rank,
                   {'foot_side':side,'foot_bone':bone})
    instep(c,side,d,foot,pre)
    toes(c,side,p[ball],ball,pre)
    shield(pre(foot+'_AngledAnkleBridge'),[(.193,.025,.058,.018),(.160,.037,.071,.014),
           (.128,.040,.083,.018),(.103,.038,.103,.014),(.088,.025,.119,.012)],
           shell,foot,x=d.x,thickness=.006,bevel=.0015)
    center=d+Vector((sign*.060,.032,.002))
    joint_ring(pre(foot+'_AnklePivot'),center,(1,0,0),.030,.007,liner,foot)
    joint_ring(pre(foot+'_AnklePivotLip'),center+Vector((sign*.006,0,0)),
               (1,0,0),.031,.0025,edge,foot)
    limb_shell(pre(foot+'_AngledAnkleWing'),d,p[ball],[(-.13,.046,.054),
               (.09,.062,.059),(.35,.064,.050),(.58,.049,.037)],shell,foot,.52,
               phase=-sign*1.18,flow=.035,thickness=.006,bevel=.0015)
    if rank>=3:
        ribbon(pre(lower+'_RecessedShinSignal'),[(b.x-sign*.023,.209,.078),
               (b.x,.187,.079),(b.x+sign*.015,.211,.076)],.003,gem,lower,.0015)
    # Every finished boot part contributes its real vertices to contact support.
    for obj in set(bpy.context.scene.objects)-before:
        bone=obj.get('bind_bone','')
        if obj.type=='MESH' and bone in [foot,ball]:
            obj['foot_side'],obj['foot_bone']=side,bone
            for vertex in obj.data.vertices: vertex.co.z=max(.0032,vertex.co.z)
            obj.data.update()


def roof(name,center,sign,profiles,mat,bone,extras):
    rows=[]
    for z,width,height in profiles:
        row=[]
        for u in [-1,-.70,-.28,.28,.70,1]:
            lateral=u*width*(1.03 if u*sign>0 else .94)
            y=.018+(height-.018)*max(0,1-u*u)**.34
            row.append((center+lateral,y,z))
        rows.append(row)
    return surface(name,rows,mat,bone,.006,.0015,extras,reverse=True)


def instep(c,side,d,foot,pre):
    shell=c['m']['ArmorShell']
    sign=1 if side=='l' else -1
    # Distinct swept plates retain black transverse seams and the ankle bend.
    bands=[[(-.112,.062,.145),(-.078,.075,.170),(-.050,.078,.166)],
           [(-.046,.078,.164),(-.018,.079,.150),(.012,.077,.131)],
           [(.016,.077,.129),(.044,.074,.108),(.072,.067,.086)]]
    extras={'foot_side':side,'foot_bone':foot}
    for i,profiles in enumerate(bands):
        roof(pre(foot+'_ArticulatedInstep'+str(i)),d.x,sign,profiles,shell,foot,extras)


def toes(c,side,anchor,ball,pre):
    shell=c['m']['ArmorShell']
    sign=1 if side=='l' else -1
    extras={'foot_side':side,'foot_bone':ball}
    for digit in [-1,0,1]:
        center=anchor.x+digit*.048
        bands=[[(anchor.z-.030,.0235,.101),(anchor.z-.006,.025,.101),
                (anchor.z+.025,.024,.089)],
               [(anchor.z+.029,.024,.087),(anchor.z+.058,.023,.068),
                (anchor.z+.086,.018,.045)]]
        for segment,profiles in enumerate(bands):
            roof(pre(ball+'_Claw%dSegment%d'%(digit,segment)),center,sign,profiles,shell,ball,extras)
