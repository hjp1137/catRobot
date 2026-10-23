"""Five fitted mechanical cuirasses, built offline around original 65-bone rest."""
from mathutils import Vector
from geometry import ellipsoid, loft, panel
from armor_shapes import shield, limb_shell, ribbon, boot_shell, helmet_dome, crown_shell, joint_ring, wrapped_polygon

TIERS=['blackiron','bronze','silver','gold','astral']


def tag(c,slot,part): return 'Tier_%s_Slot_%s_%s'%(c['tier'],slot,part)


def build_armor(points,materials,tiers=None):
    p={key:Vector(value) for key,value in points.items()}
    for rank,tier in enumerate(TIERS):
        if tiers is not None and tier not in tiers: continue
        c={'rank':rank,'tier':tier,'p':p,'m':materials[tier]}
        torso(c)
        helmet(c)
        arms(c)
        legs(c)
        ring(c)


def torso(c):
    rank,m=c['rank'],c['m']
    shell,edge,liner,gem=[m[k] for k in ['ArmorShell','ArmorEdge','ArmorLiner','ArmorGem']]
    pre=lambda part:tag(c,'chest',part)
    width=[.176,.205,.227,.235,.240][rank]
    if rank>=2:
        loft(pre('spine_03_JointSuit'),[(.94,.154,.123,-.01),(1.08,.156,.143,-.005),
             (1.25,.216,.158,-.02),(1.39,.204,.130,-.034)],liner,'TORSO',32,0,True)
    bottom=[1.205,1.17,1.135,1.126,1.115][rank]
    profiles=[(1.432,width*.43,.094,.035),(1.408,width*.76,.105,.048),
              (1.368,width*.96,.096,.089),(1.315,width,.087,.118),
              (1.255,width*.90,.096,.109),(1.205,width*.73,.112,.088),
              (bottom+.022,width*.46,.142,.058),(bottom,width*.10,.169,.032)]
    main_mat=m.get('ArmorTrim',edge) if rank==4 else shell
    from armor_detail import chest_details, sculpted_cuirass
    sculpted_cuirass(c,profiles,width,bottom)
    chest_details(c,width,bottom)
    if rank>=1:
        back=loft(pre('spine_03_BackShell'),[(bottom+.07,width*.60,.110,-.034),
             (1.24,width*.88,.132,-.036),(1.34,width*.94,.121,-.04),
             (1.405,width*.70,.085,-.042)],shell,'spine_03',32,.002,True)
        if rank>=2:
            import bpy,bmesh
            bm=bmesh.new()
            bm.from_mesh(back.data)
            bmesh.ops.delete(bm,geom=[face for face in bm.faces if face.normal.y>.0001],context='FACES')
            bm.to_mesh(back.data)
            bm.free()
            fitted_back(pre('spine_03_BackShellOuter'),bpy.data.objects['Body_Fur_Torso'],
                        bpy.data.objects[pre('spine_03_JointSuit')],shell,bottom+.07)
    if rank>=2:
        for row in range(2):
            y=1.098-row*.074
            w=.123-row*.006
            shield(pre('spine_01_VAbdomen'+str(row)),[(y+.036,w,.118,.070),
                   (y+.004,w*.96,.129,.066),(y-.034,w*.56,.145,.050),
                   (y-.046,w*.46,.165,.034)],shell,'spine_01',thickness=.008,bevel=.002,sweep=.037)
    if rank>=3:
        loft(pre('neck_01_SealedNeckFlex'),[(1.411,.127,.103,-.021),
             (1.463,.120,.111,-.017),(1.515,.108,.100,-.016),
             (1.545,.091,.087,-.013)],liner,'neck_01',32,0,True)
        loft(pre('spine_03_NeckGorget'),[(1.434,.128,.104,-.024),(1.472,.119,.111,-.019),
             (1.498,.104,.096,-.016)],shell,'spine_03',32,.002,True)


def fitted_back(name,body,suit,mat,low_y):
    """Only the rear half: fit the actual torso union, 3.3mm outside its surface."""
    import math
    from mathutils.bvhtree import BVHTree
    from armor_shapes import surface
    trees,profiles=[],[]
    for obj in [body,suit]:
        vertices=[Vector((v.co.x,v.co.z,-v.co.y)) for v in obj.data.vertices]
        trees.append(BVHTree.FromPolygons(vertices,[tuple(p.vertices) for p in obj.data.polygons],epsilon=1e-7))
        levels={}
        for vertex in vertices:
            levels.setdefault(round(vertex.y,6),[]).append(abs(vertex.x))
        profiles.append(sorted((y,max(xs)) for y,xs in levels.items()))
    top=max(y for y,w in profiles[0])-.00002
    ys={low_y,top}
    ys.update(y for profile in profiles for y,w in profile if low_y<y<top)
    steps=math.ceil((top-low_y)/.012)
    ys.update(low_y+(top-low_y)*i/steps for i in range(1,steps))
    rows=[]
    for y in sorted(ys):
        widths=[]
        for profile in profiles:
            for (ya,wa),(yb,wb) in zip(profile,profile[1:]):
                if ya<=y<=yb:
                    widths.append(wa+(wb-wa)*(y-ya)/(yb-ya))
                    break
        width=max(widths)*.999
        row=[]
        for j in range(49):
            x=math.sin(-math.pi*.5+math.pi*j/48)*width
            # BVH may skip an exact shared centre edge and hit the front face.
            # Offset rays by 10 microns, then restore the requested surface x.
            offsets=[-.00001,.00001] if abs(x)<.000001 else [0]
            hits=[tree.ray_cast(Vector((x+dx,y,-1)),Vector((0,0,1)),2)
                  for tree in trees for dx in offsets]
            hits=[hit for hit in hits if hit[0] is not None]
            if not hits: raise ValueError('Back envelope missed actual torso at '+str((x,y)))
            point,normal,face,distance=min(hits,key=lambda hit:hit[0].z)
            point.x=x
            if abs(x)<.000001:
                normal.x=0
                normal.normalize()
            row.append(point+normal*.0033)
        rows.append(row)
    return surface(name,rows,mat,'spine_03',.0010,0,reverse=True)


def helmet(c):
    rank,m,p=c['rank'],c['m'],c['p']
    center=p['Head']+Vector((0,.090,.008))
    pre=lambda part:tag(c,'helmet','Head_'+part)
    shell,edge,gem=[m[k] for k in ['ArmorShell','ArmorEdge','ArmorGem']]
    if rank<2:
        for s in [-1,1]:
            panel(pre('TemporalClamp'+str(s)),[center+Vector((s*.189,.04,.085)),
                  center+Vector((s*.205,-.01,.06)),center+Vector((s*.174,-.09,.100)),
                  center+Vector((s*.155,-.065,.137))],.010,shell,'Head',.002)
        return
    helmet_dome(pre('ContinuousOpenFaceShell'),center,shell,'Head')
    crown_shell(pre('ForeheadCrown'),center,shell,'Head')
    from armor_detail import helmet_details
    helmet_details(c,center)


def arms(c):
    rank,m,p=c['rank'],c['m'],c['p']
    shell,edge,liner,gem=[m[k] for k in ['ArmorShell','ArmorEdge','ArmorLiner','ArmorGem']]
    pre=lambda part:tag(c,'armor',part)
    from armor_detail import shoulder_details, hand_details
    for side in ['l','r']:
        upper,lower,hand='upperarm_'+side,'lowerarm_'+side,'hand_'+side
        a,b,d=p[upper],p[lower],p[hand]
        if rank>=1:
            shoulder_details(c,side,a,b)
        if rank>=2:
            limb_shell(pre(upper+'_JointSleeve'),a,b,[(.30,.064,.065),(.55,.066,.064),
                       (.83,.058,.057),(.97,.049,.050)],liner,upper,3.1415,thickness=.005)
            upper_mat=m.get('ArmorTrim',edge) if rank==4 else shell
            limb_shell(pre(upper+'_BicepShell'),a,b,[(.38,.075,.086),(.47,.089,.095),
                       (.67,.080,.086),(.83,.061,.072)],upper_mat,upper,2.63,flow=.055)
            if rank==4:
                limb_shell(pre(upper+'_WhiteBicepLeaf'),a,b,[(.40,.072,.093),(.48,.086,.102),
                           (.67,.078,.092),(.79,.059,.078)],shell,upper,1.24,flow=-.045)
            ellipsoid(pre(lower+'_ElbowHinge'),b,(.048,.051,.049),liner,lower,24,12)
            joint_ring(pre(lower+'_ElbowBearing'),b+Vector((0,0,.050)),(0,0,1),.039,.007,
                       m.get('ArmorTrim',edge),lower)
        fore_profiles=[(.12,.073,.082),(.27,.089,.101),(.48,.083,.097),
                       (.73,.069,.082),(.94,.049,.060)]
        if rank<2: fore_profiles=[(t,rx*.83,rz*.83) for t,rx,rz in fore_profiles]
        fore_mat=m.get('ArmorTrim',edge) if rank==4 else liner
        limb_shell(pre(lower+'_ShapedVambrace'),b,d,fore_profiles,fore_mat,lower,
                   2.70 if rank>=2 else 1.84,flow=.048,thickness=.008)
        if rank>=2:
            front_outline=[(.16,-.35),(.27,-.86),(.48,-.73),(.78,-.26),
                           (.86,.31),(.65,.74),(.32,.80),(.18,.31)]
            side_outline=[(.30,.85),(.47,.98),(.73,1.42),(.82,1.86),
                          (.57,1.82),(.35,1.53)]
            wrapped_polygon(pre(lower+'_LongWedgeFront'),b,d,front_outline,
                            fore_profiles,shell,lower,.008,.008)
            wrapped_polygon(pre(lower+'_ObliqueSideLeaf'),b,d,side_outline,
                            fore_profiles,m.get('ArmorTrim',edge),lower,.008,.007)
        else:
            wrapped_polygon(pre(lower+'_EarlyForearmPlate'),b,d,
                            [(.18,-.80),(.27,-1.2),(.80,-.60),(.89,.50),(.35,1.10)],
                            fore_profiles,shell,lower,.006,.007)
        if rank>=2:
            limb_shell(pre(lower+'_WristSeal'),b,d,[(.87,.051,.058),(.93,.051,.058),
                       (.98,.047,.054)],liner,lower,3.1415,thickness=.004)
        hand_details(c,side,b,d)


def legs(c):
    rank,m,p=c['rank'],c['m'],c['p']
    shell,edge,liner,gem=[m[k] for k in ['ArmorShell','ArmorEdge','ArmorLiner','ArmorGem']]
    pre=lambda part:tag(c,'legs',part)
    loft(pre('pelvis_FittedBelt'),[(.902,.178,.140,-.018),(.933,.185,.147,-.021),
         (.953,.173,.136,-.02)],shell,'pelvis',32,.0018,True)
    if rank>=2:
        loft(pre('pelvis_FlexSuit'),[(.776,.114,.102,-.015),(.85,.174,.137,-.020),
             (.922,.172,.136,-.025)],liner,'pelvis',32,0,True)
        shield(pre('pelvis_AngularCodpiece'),[(.91,.065,.143,.023),(.864,.074,.132,.042),
               (.809,.044,.131,.029),(.784,.016,.122,.016)],shell,'pelvis',thickness=.009)
    from armor_detail import hip_details, leg_details
    hip_details(c)
    thigh_profiles=[(.15,.088,.103),(.28,.102,.116),(.45,.098,.118),
                    (.67,.087,.103),(.84,.068,.081)]
    for side in ['l','r']:
        upper,lower,foot,ball='thigh_'+side,'calf_'+side,'foot_'+side,'ball_'+side
        a,b,d=p[upper],p[lower],p[foot]
        sign=1 if side=='l' else -1
        if rank>=2:
            from armor_greaves import fitted_body_liner
            fitted_body_liner(c,'legs',['Body_Fur_'+upper,'Body_Fur_SoftJoint_'+lower])
            limb_shell(pre(upper+'_ThighFlex'),a,b,[(.03,.080,.080),(.18,.081,.082),
                       (.81,.066,.068),(.98,.058,.058)],liner,upper,3.1415,
                       shift=(sign*.010,0,0),thickness=.005)
            thigh_mat=m.get('ArmorTrim',edge) if rank==4 else shell
            limb_shell(pre(upper+'_SculptedThigh'),a,b,thigh_profiles,thigh_mat,upper,2.72,
                       shift=(sign*.028,0,0),flow=sign*.055,thickness=.009)
        else:
            shield(pre(upper+'_ThighPlate'),[(.849,.048,.070,.021),(.803,.063,.072,.026),
                   (.714,.044,.073,.020)],shell,upper,x=a.x,thickness=.008,skew=-sign*.025)
        ellipsoid(pre(lower+'_KneeFlex'),b,(.064,.063,.062),liner,lower,24,12)
        shield(pre(lower+'_AngularPatella'),[(b.y+.071,.038,.072,.019),
               (b.y+.043,.058,.077,.023),(b.y-.012,.053,.077,.022),
               (b.y-.051,.026,.071,.019)],shell,lower,x=b.x,thickness=.007)
        leg_details(c,side,a,b,d,thigh_profiles)
        from armor_greaves import build_boots
        build_boots(c,side,b,d,foot,ball)


def boots(c,side,b,d,foot,ball):
    rank,m,p=c['rank'],c['m'],c['p']
    shell,edge,liner,gem=[m[k] for k in ['ArmorShell','ArmorEdge','ArmorLiner','ArmorGem']]
    pre=lambda part:tag(c,'boots',part)
    lower='calf_'+side
    coverage=[1.72,2.05,2.72,2.79,2.86][rank]
    greave_mat=m.get('ArmorTrim',edge) if rank==4 else shell
    limb_shell(pre(lower+'_TaperedGreave'),b,d,[(.16,.064,.078),(.24,.078,.096),
               (.42,.074,.092),(.66,.058,.078),(.88,.052,.063),(.94,.048,.057)],
               greave_mat,lower,coverage,flow=.018,thickness=.009)
    if rank>=2:
        limb_shell(pre(lower+'_AnkleFlex'),b,d,[(.87,.053,.060),(.94,.051,.059),
                   (1.03,.049,.056)],liner,lower,3.1415,thickness=.004)
        boot_shell(pre(foot+'_ArchedSabatons'),d,False,shell,foot,side,rank,
                   {'foot_side':side,'foot_bone':foot})
        limb_shell(pre(foot+'_ContinuousInstepTongue'),d,p[ball],
                   [(-.12,.050,.047),(.08,.062,.053),(.30,.071,.050),(.58,.066,.034)],
                   shell,foot,1.82,thickness=.006,bevel=.0018)
        boot_shell(pre(ball+'_ClawToeShell'),p[ball],True,shell,ball,side,rank,
                   {'foot_side':side,'foot_bone':ball})
    elif rank==1:
        shield(pre(foot+'_InstepPlate'),[(.144,.035,-.051,.028),(.119,.056,-.009,.040),
               (.085,.055,.053,.027)],shell,foot,x=d.x,thickness=.008)
    from armor_detail import boot_details
    boot_details(c,side,b,d)


def ring(c):
    m,p,rank=c['m'],c['p'],c['rank']
    a,b=p['lowerarm_l'],p['hand_l']
    pre=lambda part:tag(c,'ring','lowerarm_l_'+part)
    half=.030+rank*.004
    radius=.050+rank*.001
    limb_shell(pre('SlimControlBand'),a,b,[(.906-half,radius,.059+rank*.0014),
               (.906,radius+.001,.061+rank*.0014),(.906+half,radius-.002,.057+rank*.0014)],
               m['ArmorLiner'],'lowerarm_l',3.1415,thickness=.004)
    center=a.lerp(b,.906)
    width,height=.017+rank*.0015,.018+rank*.0025
    front=center.z+.063+rank*.001
    if rank==4:
        shield(pre('NavyControlFrame'),[(center.y+height+.002,width*.80,front,.009),
               (center.y,width+.002,front+.001,.011),(center.y-height-.002,width*.65,front,.009)],
               m['ArmorTrim'],'lowerarm_l',x=center.x,thickness=.005,bevel=.0012)
    shield(pre('IntegratedControl'),[(center.y+height,width*.76,front+.003,.008),
           (center.y,width,front+.004,.010),(center.y-height,width*.60,front+.003,.008)],
           m['ArmorShell'],'lowerarm_l',x=center.x,thickness=.005,bevel=.0012)
    for index,offset in enumerate([-.006,.006] if rank==4 else [0]):
        ribbon(pre('ControlReadout'+str(index)),[(center.x-width*.60,center.y+offset,front+.018),
               (center.x+width*.54,center.y+offset,front+.018)],
               .0035+rank*.00035,m['ArmorGem'],'lowerarm_l',.0015)
