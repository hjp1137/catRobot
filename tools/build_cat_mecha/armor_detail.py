"""Local shell transitions, embedded controls, and compact high-tier hardware."""
import math
from mathutils import Vector
from geometry import mesh, panel, ellipsoid, loft
from armor_shapes import shield, limb_shell, ribbon, surface, finish_shell, joint_ring, curved_polygon, wrapped_polygon


def label(c,slot,part): return 'Tier_%s_Slot_%s_%s'%(c['tier'],slot,part)


def sculpted_cuirass(c,profiles,width,bottom):
    rank,m=c['rank'],c['m']
    pre=lambda part:label(c,'chest','spine_03_'+part)
    base=m.get('ArmorTrim',m['ArmorLiner']) if rank==4 else m['ArmorLiner']
    shield(pre('DeepCuirassSubstructure'),[(y,w,z-.006,r) for y,w,z,r in profiles],
           base,'spine_03',thickness=.008)
    def depth(x,y):
        for high,low in zip(profiles,profiles[1:]):
            if low[0]<=y<=high[0]:
                t=(high[0]-y)/(high[0]-low[0])
                w=high[1]*(1-t)+low[1]*t
                z=high[2]*(1-t)+low[2]*t
                r=high[3]*(1-t)+low[3]*t
                return z+r*(1-min(1,abs(x)/w)**1.45)
        return profiles[0][2] if y>profiles[0][0] else profiles[-1][2]
    def fit(outline):
        return [(x*width/.235,1.432-(1.432-y)*(1.432-bottom-.007)/.299)
                for x,y in outline]
    for s in [-1,1]:
        collar=[(s*.022,1.425),(s*.085,1.427),(s*.181,1.390),
                (s*.205,1.357),(s*.134,1.361),(s*.073,1.387),(s*.022,1.392)]
        outer=[(s*.136,1.357),(s*.208,1.352),(s*.231,1.313),
               (s*.211,1.260),(s*.139,1.218),(s*.100,1.245),(s*.101,1.304)]
        curved_polygon(pre('ObliqueClavicle'+str(s)),fit(collar),depth,m['ArmorShell'],'spine_03')
        curved_polygon(pre('OuterPectoralLeaf'+str(s)),fit(outer),depth,m['ArmorShell'],'spine_03')
    tip=1.190 if rank==4 else 1.133
    central=[(-.018,1.389),(-.072,1.378),(-.097,1.351),(-.097,1.301),
             (-.096,1.245),(-.135,1.213),(0,tip),(.135,1.213),
             (.096,1.245),(.097,1.301),(.097,1.351),(.072,1.378),(.018,1.389)]
    curved_polygon(pre('CentralVChestPlate'),fit(central),depth,m['ArmorShell'],'spine_03',.010)


def chest_details(c,width,bottom):
    rank,m=c['rank'],c['m']
    pre=lambda part:label(c,'chest','spine_03_'+part)
    shell,edge,liner,gem=[m[k] for k in ['ArmorShell','ArmorEdge','ArmorLiner','ArmorGem']]
    trim=m.get('ArmorTrim',edge)
    radius=.014 if rank<2 else .027
    for name,scale,offset,mat in [('CoreSocket',1.38,-.007,liner),
                                  ('CoreBezel',1.17,-.003,edge),('InsetSternumCore',1,0,gem)]:
        panel(pre(name),[(-radius*scale,1.367,.213+offset),
              (0,1.367+.035*scale,.176+offset),(radius*scale,1.367,.213+offset),
              (0,1.367-.035*scale,.226+offset)],.004,mat,'spine_03',.001)
    for s in [-1,1]:
        ribbon(pre('CollarMachining'+str(s)),[(s*.028,1.425,.142),
               (s*.083,1.410,.153),(s*width*.69,1.389,.146)],.005,edge,'spine_03')
        if rank>=2:
            ribbon(pre('CuirassDirectionalSeam'+str(s)),[(s*.083,1.352,.185),
                   (s*.122,1.296,.172),(s*.108,1.248,.184),(s*.031,1.191,.206)],
                   .0035,liner,'spine_03',.0015)
            for row in range(2):
                yy=1.205-row*.079
                shield(pre('SweptRib%s_%s'%(s,row)),[(yy,.039,.089,.037),
                       (yy-.039,.050,.096,.045),(yy-.071,.023,.109,.026)],
                       shell,'spine_01',x=s*.177,thickness=.008,skew=-s*.030)
            if rank>=3:
                ribbon(pre('RecessedFlankBus'+str(s)),[(s*.183,1.168,.146),
                       (s*.173,1.145,.156)],.005,gem,'spine_01',.002)
    if rank==4:
        from armor_power import backpack as build_power
        build_power(c)


def helmet_details(c,center):
    rank,m=c['rank'],c['m']
    shell,edge,liner,gem=[m[k] for k in ['ArmorShell','ArmorEdge','ArmorLiner','ArmorGem']]
    trim=m.get('ArmorTrim',edge)
    pre=lambda part:label(c,'helmet','Head_'+part)
    for s in [-1,1]:
        outer=[center+Vector((s*.062,.141,.046)),center+Vector((s*.213,.136,.024)),
               center+Vector((s*.183,.362,-.010))]
        inner=[center+Vector((s*.089,.158,.047)),center+Vector((s*.190,.157,.029)),
               center+Vector((s*.177,.323,-.002))]
        verts=outer+inner
        faces=[(0,1,4,3),(1,2,5,4),(2,0,3,5)]
        if s<0: faces=[tuple(reversed(face)) for face in faces]
        obj=mesh(pre('IntegratedEarShell'+str(s)),verts,faces,
                 shell,'Head',smooth=True)
        finish_shell(obj,.011,.0025)
        ribbon(pre('EarInnerSeal'+str(s)),[inner[0],inner[2],inner[1]],.0055,liner,'Head')
        if rank>=3:
            panel(pre('InsetEarReceiver'+str(s)),[center+Vector((s*.174,.290,.008)),
                  center+Vector((s*.186,.254,.014)),center+Vector((s*.175,.231,.020))],
                  .003,gem,'Head',.001)
        cheek_plates=[[(.203,.067,.082),(.220,.011,.070),(.205,-.042,.096),(.185,-.023,.126)],
                      [(.211,-.037,.085),(.201,-.095,.088),(.173,-.127,.112),(.179,-.071,.127)],
                      [(.174,-.117,.114),(.143,-.177,.111),(.127,-.157,.138),(.153,-.109,.138)]]
        for j,outline in enumerate(cheek_plates):
            points=[center+Vector((s*x,y,z)) for x,y,z in outline]
            mat=trim if rank==4 and j==1 else shell
            panel(pre('ArticulatedCheek%s_%s'%(s,j)),points,.009,mat,'Head',.002)
        brow=[]
        for u in [0,.25,.5,.75,1]:
            xx=s*.192*u
            yy=.125+.048*math.sin(math.pi*u)-.006*u
            zz=.205*math.sqrt(max(.018,1-(xx/.232)**2-(yy/.248)**2))+.012
            brow.append(center+Vector((xx,yy,zz)))
        ribbon(pre('VShapedBrow'+str(s)),brow,.0055,trim,'Head')
    panel(pre('CrownKeystone'),[center+Vector((-.017,.158,.172)),
          center+Vector((0,.182,.149)),center+Vector((.017,.158,.172)),
          center+Vector((0,.123,.191))],.006,shell,'Head',.0015)


def shoulder_details(c,side,a,b):
    rank,m=c['rank'],c['m']
    bone='upperarm_'+side
    pre=lambda part:label(c,'armor',bone+'_'+part)
    shell,edge,liner,gem=[m[k] for k in ['ArmorShell','ArmorEdge','ArmorLiner','ArmorGem']]
    limb_shell(pre('ShoulderFlex'),a,b,[(-.09,.068,.069),(.05,.086,.082),
               (.38,.079,.074)],liner,bone,3.1415,thickness=.005)
    cap=[(-.24,.047,.061),(-.10,.104,.095),(.08,.125,.112),(.28,.112,.105)]
    limb_shell(pre('ShoulderInnerCup'),a,b,cap,shell,bone,2.90,
               flow=.065,thickness=.009,bevel=.002)
    support=[(-.30,.041,.052),(-.10,.108,.097),(.12,.135,.124),
             (.38,.120,.112),(.64,.072,.080),(.80,.048,.052)]
    front_leaf=[(.03,-1.30),(.30,-1.60),(.56,-.80),(.60,.05),
                (.43,.75),(.15,.90),(-.02,.25)]
    outer_leaf=[(.16,.68),(.35,.16),(.66,.35),(.73,1.05),(.55,1.76),(.26,1.65)]
    if rank>=2:
        wrapped_polygon(pre('SweptShoulderFrontLeaf'),a,b,front_leaf,
                        support,shell,bone,.009,.010)
    if rank>=3:
        wrapped_polygon(pre('SweptShoulderOuterLeaf'),a,b,outer_leaf,
                        support,shell,bone,.015,.009)
    if rank==4:
        center=a.lerp(b,.31)+Vector((0,.013,.142))
        shield(pre('RecessedShoulderCoreHousing'),[(center.y+.035,.029,center.z-.004,.006),
               (center.y,.037,center.z,.006),(center.y-.035,.023,center.z-.004,.006)],
               m.get('ArmorTrim',edge),bone,x=center.x,thickness=.006,bevel=.0015)
        panel(pre('RecessedShoulderCore'),[(center.x-.017,center.y,center.z+.010),
              (center.x,center.y+.026,center.z+.010),(center.x+.017,center.y,center.z+.010),
              (center.x,center.y-.026,center.z+.010)],.003,gem,bone,.001)


def hand_details(c,side,b,d):
    rank,m=c['rank'],c['m']
    lower,hand='lowerarm_'+side,'hand_'+side
    pre=lambda part:label(c,'armor',part)
    shell,edge,liner,gem=[m[k] for k in ['ArmorShell','ArmorEdge','ArmorLiner','ArmorGem']]
    for fraction in [.36,.64]:
        at=b.lerp(d,fraction)
        ribbon(pre(lower+'_DirectionalSeam'+str(fraction)),
               [(at.x-.018,at.y+.042,at.z+.073),(at.x+.019,at.y+.018,at.z+.087)],
               .0035,liner,lower,.0015)
    if rank>=2:
        unit=(c['p']['Head'].y-c['p']['foot_l'].y)/1.58
        palm=d+Vector((0,-.025,.018))*unit
        ellipsoid(pre(hand+'_PalmFlexGlove'),palm,(.062,.064,.058),liner,hand,28,16)
        ellipsoid(pre(hand+'_ThumbFlexGlove'),palm+Vector((-.047,-.010,.021)),
                  (.020,.031,.024),liner,hand,20,12)
        shield(pre(hand+'_ThinMetacarpalPlate'),[(palm.y+.047,.035,palm.z+.047,.008),
               (palm.y+.022,.054,palm.z+.052,.011),(palm.y-.021,.051,palm.z+.053,.009),
               (palm.y-.043,.034,palm.z+.045,.006)],shell,hand,x=palm.x,thickness=.006,bevel=.0014)
        for j in range(3):
            x=palm.x+(j-1)*.035
            base=palm+Vector(((j-1)*.034,-.022,.037))
            joint=base+Vector(((j-1)*.003,-.021,.029))
            tip=joint+Vector((0,.005,.027))
            limb_shell(pre(hand+'_DigitFlex'+str(j)),base,tip,
                       [(0,.020,.020),(.55,.020,.020),(1,.014,.014)],liner,hand,
                       3.1415,thickness=.003,bevel=.0005)
            limb_shell(pre(hand+'_ProximalPhalanx'+str(j)),base,joint,
                       [(.08,.011,.020),(.25,.015,.022),(.75,.014,.021),(.89,.010,.017)],
                       shell,hand,1.13,thickness=.003,bevel=.0008)
            limb_shell(pre(hand+'_DistalPhalanx'+str(j)),joint,tip,
                       [(.12,.009,.018),(.40,.013,.019),(.80,.010,.015),(.98,.007,.012)],
                       shell,hand,1.13,thickness=.003,bevel=.0008)
            shield(pre(hand+'_ArticulatedDigit'+str(j)),[(palm.y-.010,.015,palm.z+.063,.003),
                   (palm.y-.031,.017,palm.z+.067,.004),(palm.y-.049,.011,palm.z+.057,.003)],
                   shell,hand,x=x,thickness=.004,bevel=.001)
    if rank>=3:
        center=b.lerp(d,.42)
        ribbon(pre(lower+'_InsetStatusStrip'),[(center.x-.030,center.y+.014,center.z+.087),
               (center.x+.017,center.y-.010,center.z+.089)],.0045,gem,lower,.002)


def hip_details(c):
    rank,m=c['rank'],c['m']
    shell,edge,liner,gem=[m[k] for k in ['ArmorShell','ArmorEdge','ArmorLiner','ArmorGem']]
    pre=lambda part:label(c,'legs','pelvis_'+part)
    for s in [-1,1]:
        if rank>=1:
            x=s*(.166 if rank>=2 else .156)
            shield(pre('SweptHipPlate'+str(s)),[(.923,.035,.100,.026),
                   (.885,.059,.101,.047),(.826,.061,.098,.039),
                   (.759 if rank>=3 else .802,.027,.084,.029)],
                   shell,'pelvis',x=x,thickness=.009,skew=s*.027)
        if rank>=3:
            ribbon(pre('HipPlateCut'+str(s)),[(s*.157,.904,.155),
                   (s*.184,.857,.147),(s*.190,.801,.118)],.004,liner,'pelvis',.002)
        if rank==4:
            panel(pre('RecessedHipBus'+str(s)),[(s*.195,.903,.135),
                  (s*.208,.879,.131),(s*.199,.851,.141),(s*.186,.875,.149)],
                  .003,gem,'pelvis',.001)


def leg_details(c,side,a,b,d,thigh_profiles):
    rank,m=c['rank'],c['m']
    sign=1 if side=='l' else -1
    upper,lower='thigh_'+side,'calf_'+side
    pre=lambda part:label(c,'legs',part)
    shell,edge,liner,gem=[m[k] for k in ['ArmorShell','ArmorEdge','ArmorLiner','ArmorGem']]
    if rank>=2:
        x=a.x+sign*.035
        outline=[(.15,-.15),(.19,-.75),(.47,-1.00),(.73,-.72),(.84,-.03),
                 (.82,.55),(.62,.95),(.27,.90),(.15,.55)]
        outline=[(t,angle*sign) for t,angle in outline]
        wrapped_polygon(pre(upper+'_DiagonalFrontBlade'),a,b,outline,
                        thigh_profiles,shell,upper,.010,.006,shift=(sign*.028,0,0),
                        flow=sign*.055,sculpt=True,edge_steps=3)
        ribbon(pre(upper+'_SculptedFlowCut'),[(x+sign*.008,.832,.126),
               (x+sign*.022,.769,.122),(x+sign*.018,.690,.106)],.0035,liner,upper,.0015)
    if rank>=3:
        # A dark lateral bearing is visible around the angular front kneecap.
        center=b+Vector((sign*.069,0,-.002))
        joint_ring(pre(lower+'_LateralBearing'),center,(1,0,0),.039,.009,liner,lower)
        joint_ring(pre(lower+'_BearingLip'),center+Vector((sign*.008,0,0)),
                   (1,0,0),.040,.0025,m.get('ArmorTrim',edge),lower)
        shield(pre(lower+'_KneeUpperLeaf'),[(b.y+.070,.035,.087,.008),
               (b.y+.046,.044,.095,.008),(b.y+.021,.022,.100,.007)],
               shell,lower,x=b.x,thickness=.005,bevel=.0015)
    if rank==4:
        shield(pre(upper+'_RearThighCover'),[(.842,.048,-.068,-.025),
               (.754,.064,-.069,-.026),(.636,.041,-.061,-.020)],
               m.get('ArmorTrim',edge),upper,x=a.x+sign*.010,thickness=.006)


def boot_details(c,side,b,d):
    rank,m,p=c['rank'],c['m'],c['p']
    lower,foot,ball='calf_'+side,'foot_'+side,'ball_'+side
    shell,edge,liner,gem=[m[k] for k in ['ArmorShell','ArmorEdge','ArmorLiner','ArmorGem']]
    trim=m.get('ArmorTrim',edge)
    pre=lambda part:label(c,'boots',part)
    if rank>=2:
        gain=1.60 if rank==4 else 1
        profiles=[(.455,.027,.079,.020),(.410,.036,.074,.025),
                  (.317,.032,.058,.030),(.217,.022,.040,.032),(.161,.016,.025,.025)]
        shield(pre(lower+'_ShinKeel'),[(y,w*gain,z,r) for y,w,z,r in profiles],
               shell,lower,x=b.x,thickness=.007,bevel=.0018)
        for j in [-1,1]:
            x=p[ball].x+j*.027
            ribbon(pre(ball+'_ClawDivision'+str(j)),[(x,.089,p[ball].z-.005),
                   (x,.079,p[ball].z+.041),(x,.049,p[ball].z+.075)],.0035,liner,ball,.0015)
    if rank>=3:
        ribbon(pre(lower+'_InsetAnkleSignal'),[(b.x-.018,.202,.070),
               (b.x,.180,.067),(b.x+.018,.204,.070)],.0035,gem,lower,.002)
    if rank==4:
        s=1 if side=='l' else -1
        shield(pre(foot+'_AnkleExoshell'),[(.177,.021,-.050,.025),
               (.144,.039,-.041,.036),(.100,.044,-.011,.040),(.078,.028,.024,.025)],
               trim,foot,x=d.x+s*.041,thickness=.007,skew=-s*.014)


def backpack(c):
    m=c['m']
    shell,edge,liner,gem=[m[k] for k in ['ArmorShell','ArmorEdge','ArmorLiner','ArmorGem']]
    trim=m.get('ArmorTrim',edge)
    pre=lambda part:label(c,'chest','spine_03_'+part)
    up=lambda profiles:[(y+.09,w,z-.025,r) for y,w,z,r in profiles]
    shield(pre('CompactDorsalBridge'),up([(1.455,.055,-.161,-.020),
           (1.380,.110,-.174,-.027),(1.256,.085,-.165,-.027),
           (1.192,.035,-.146,-.019)]),trim,'spine_03',thickness=.010)
    for s in [-1,1]:
        x=s*.205
        shield(pre('DorsalPowerCartridge'+str(s)),up([(1.547,.033,-.174,-.027),
               (1.520,.051,-.181,-.039),(1.449,.060,-.185,-.055),
               (1.356,.058,-.182,-.047),(1.282,.036,-.162,-.031)]),
               trim,'spine_03',x=x,thickness=.012,bevel=.0025,skew=s*.013)
        shield(pre('CartridgeUpperShell'+str(s)),up([(1.548,.032,-.174,-.030),
               (1.522,.049,-.184,-.040),(1.478,.050,-.186,-.047)]),
               shell,'spine_03',x=x,thickness=.006,skew=s*.013)
        for row in range(3):
            y=1.539-row*.032
            ribbon(pre('DorsalCoolingSlot%s_%s'%(s,row)),[(x-.032,y,-.253),
                   (x+.032,y,-.253)],.009,liner,'spine_03',.002)
        ribbon(pre('CartridgePowerBus'+str(s)),[(x+s*.041,1.585,-.238),
               (x+s*.049,1.535,-.243),(x+s*.046,1.457,-.236)],.005,gem,'spine_03',.002)
