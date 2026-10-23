"""Astral-only authored control cages; original four armor tiers stay untouched."""
import math
import bpy
from mathutils import Vector
from geometry import loft,ellipsoid,panel,bar,tube
from armor_shapes import ribbon,joint_ring,boot_shell
from astral_mesh import cage,patch,limb_grid,register_native,detail_stud


def tag(slot,part): return 'Tier_astral_Slot_'+slot+'_'+part


def build_astral(points,materials,cache):
    p={k:Vector(v) for k,v in points.items()}
    c={'p':p,'m':materials,'rank':4,'tier':'astral','cache':cache}
    before=set(bpy.context.scene.objects)
    helmet(c)
    torso(c)
    arms(c)
    legs(c)
    control(c)
    from families import astral_segments
    astral_segments(points,materials)
    for obj in set(bpy.context.scene.objects)-before:
        if obj.type=='MESH' and not obj.get('source_only') and not obj.get('astral_bake_low'):
            register_native(obj)
    lows=[o for o in bpy.context.scene.objects if o.get('astral_bake_low') and not o.get('source_only')]
    print('ASTRAL_AUTHORED_CAGES',len([o for o in bpy.context.scene.objects
          if o.get('astral_source_kind')=='Cage']),'RUNTIME_PARTS',len(lows),flush=True)
    return lows


def helmet(c):
    m,p=c['m'],c['p']
    shell,navy,edge,gem=[m[k] for k in ['ArmorShell','ArmorTrim','ArmorEdge','ArmorGem']]
    center=p['Head']+Vector((0,.090,.008))
    pre=lambda n:tag('helmet','Head_'+n)
    def local(seq,s=1): return [center+Vector((s*x,y,z)) for x,y,z in seq]
    # Segmented occiput, distinct temporal faces and a cheek-following opening.
    cap_rows=[]
    for yy,xx,back,front in [(-.105,.159,-.151,-.004),(-.060,.200,-.181,.018),
                            (.035,.221,-.189,.052),(.125,.203,-.159,.099),
                            (.192,.156,-.108,.110),(.212,.073,-.050,.072)]:
        cap_rows.append([center+Vector((u*xx,yy,back+(front-back)*(abs(u)**1.8)))
                         for u in [-1,-.78,-.39,0,.39,.78,1]])
    cage(pre('OccipitalCrest'),cap_rows,shell,'Head',.009)
    for s in [-1,1]:
        temporal=[(.181,.125,.103),(.218,.083,.051),(.230,-.014,-.008),
                  (.204,-.090,-.010),(.183,-.116,.073),(.190,-.046,.133)]
        patch(pre('TemporalBlade'+str(s)),local(temporal,s),(s*.007,0,.004),shell,'Head')
        cheek=[(.190,-.032,.134),(.205,-.077,.111),(.183,-.128,.130),
               (.142,-.169,.150),(.133,-.149,.172),(.167,-.103,.160)]
        patch(pre('CheekJawRail'+str(s)),local(cheek,s),(s*.003,0,.005),navy,'Head',.006)
        brow=[(.012,.141,.183),(.052,.179,.150),(.117,.178,.127),
              (.191,.126,.115),(.185,.104,.140),(.101,.150,.152),(.037,.147,.189)]
        patch(pre('ForkedBrowCrown'+str(s)),local(brow,s),(0,.004,.003),shell,'Head',.008)
        ear=[(.056,.155,.026),(.109,.161,.057),(.206,.345,-.015),
             (.188,.352,-.040),(.159,.209,-.053)]
        patch(pre('EarCanopy'+str(s)),local(ear,s),(s*.003,0,.011),shell,'Head',.007)
        panel(pre('EarInnerGasket'+str(s)),local([(.107,.179,.050),(.182,.310,-.007),
              (.163,.220,-.022)],s),.004,navy,'Head',.001)
        panel(pre('EarAerialPort'+str(s)),local([(.141,.213,.034),(.177,.279,.000),
              (.160,.216,.007)],s),.002,gem,'Head',.0006)
        ribbon(pre('FineBrowLip'+str(s)),local([(.023,.140,.192),(.099,.153,.156),
               (.183,.110,.143)],s),.0032,edge,'Head',.0012)
    patch(pre('NavyCrownSpine'),local([(-.023,.188,.127),(0,.212,.103),
          (.023,.188,.127),(.020,.141,.193),(0,.116,.207),(-.020,.141,.193)]),
          (0,0,.004),navy,'Head',.005)


def torso(c):
    m=c['m']
    shell,navy,edge,liner,gem=[m[k] for k in
        ['ArmorShell','ArmorTrim','ArmorEdge','ArmorLiner','ArmorGem']]
    pre=lambda n:tag('chest','spine_03_'+n)
    loft(pre('RecessedTorsoFlex'),[(.953,.147,.120,-.018),(1.08,.154,.145,-.016),
         (1.26,.205,.165,-.032),(1.397,.196,.135,-.037)],liner,'spine_03',24,0,True)
    loft(pre('NeckFlex'),[(1.412,.116,.097,-.025),(1.49,.108,.101,-.021),
         (1.536,.085,.084,-.016)],liner,'neck_01',24,0,True)
    for s in [-1,1]:
        def mir(seq): return [(s*x,y,z) for x,y,z in seq]
        patch(pre('ClavicleWing'+str(s)),mir([(.016,1.433,.126),(.095,1.441,.116),
              (.190,1.410,.116),(.224,1.370,.111),(.181,1.370,.155),
              (.085,1.410,.169),(.025,1.399,.166)]),(0,0,.014),shell,'spine_03')
        patch(pre('PectoralPetal'+str(s)),mir([(.052,1.389,.199),(.131,1.391,.180),
              (.220,1.357,.136),(.232,1.311,.123),(.197,1.254,.159),
              (.113,1.200,.206),(.065,1.236,.224),(.040,1.313,.222)]),
              (0,0,.022),shell,'spine_03',.009)
        patch(pre('LowerRibReturn'+str(s)),mir([(.193,1.253,.149),(.222,1.239,.112),
              (.195,1.154,.140),(.145,1.132,.170),(.128,1.171,.175)]),
              (0,0,.009),navy,'spine_01',.006)
        for row in range(2):
            yy=1.171-row*.087
            # Offset left/right overlap rather than two complete circumferential V bands.
            drop=.014 if s<0 else 0
            outline=[(.020,yy+.008-drop,.193),(.116,yy+.034,.172),
                     (.158,yy+.011,.147),(.136,yy-.040,.163),
                     (.045,yy-.069-drop,.198),(.008,yy-.037-drop,.201)]
            patch(tag('chest','spine_01_AlternatingAbdominal%s_%s'%(s,row)),mir(outline),
                  (0,0,.009),shell,'spine_01',.006)
        ribbon(pre('ClavicleFineLip'+str(s)),mir([(.030,1.410,.178),(.090,1.421,.169),
               (.183,1.385,.153)]),.0035,edge,'spine_03',.001)
        ribbon(pre('RecessedRibBus'+str(s)),mir([(.199,1.219,.159),(.170,1.174,.177)]),
               .0037,gem,'spine_01',.0012)
        for x,y,z in [(.176,1.369,.178),(.167,1.282,.207),(.104,1.240,.236)]:
            detail_stud(pre('ChestStud%s_%s'%(s,y)),(s*x,y,z),(0,0,1),.004,edge,'spine_03')
    core=[(-.043,1.398,.203),(0,1.418,.173),(.043,1.398,.203),
          (.042,1.350,.219),(0,1.313,.235),(-.042,1.350,.219)]
    patch(pre('RecessedSternumSocket'),core,(0,0,.002),navy,'spine_03',.006)
    panel(pre('CoreFineBezel'),[(-.024,1.373,.219),(0,1.398,.191),
          (.024,1.373,.219),(0,1.338,.235)],.003,edge,'spine_03',.001)
    panel(pre('InsetSternumCore'),[(-.018,1.373,.219),(0,1.391,.199),
          (.018,1.373,.219),(0,1.346,.232)],.002,gem,'spine_03',.0008)
    patch(pre('DorsalShell'),[(-.177,1.409,-.143),(.177,1.409,-.143),
          (.208,1.323,-.177),(.160,1.201,-.165),(-.160,1.201,-.165),
          (-.208,1.323,-.177)],(0,0,-.015),shell,'spine_03',.008)
    backpack(c)


def backpack(c):
    m=c['m']
    shell,navy,edge,liner,gem=[m[k] for k in
        ['ArmorShell','ArmorTrim','ArmorEdge','ArmorLiner','ArmorGem']]
    pre=lambda n:tag('chest','spine_03_'+n)
    for s in [-1,1]:
        x=s*.288
        bar(pre('PowerMountStrut'+str(s)),(s*.156,1.337,-.178),(x,1.388,-.240),
            .022,navy,'spine_03',8)
        rows=[]
        for y,w,z in [(1.299,.027,-.242),(1.323,.050,-.260),(1.388,.059,-.271),
                       (1.546,.056,-.277),(1.601,.046,-.274),(1.624,.025,-.263)]:
            rows.append([(x+u*w+s*(y-1.36)*.035,y,z-.040*(1-u*u))
                         for u in [-1,-.82,-.40,0,.40,.82,1]])
        cage(pre('ScallopedPowerCartridge'+str(s)),rows,shell,'spine_03',.020)
        panel(pre('PowerServiceCover'+str(s)),[(x-.032,1.563,-.319),
              (x+.032,1.563,-.319),(x+.038,1.372,-.317),(x,1.338,-.311),
              (x-.038,1.372,-.317)],.004,navy,'spine_03',.0018)
        axis=Vector((s*.93,0,.367))
        center=Vector((x+s*.056,1.553,-.267))
        tube(pre('SidePowerSleeve'+str(s)),center-axis*.014,center+axis*.015,
             [(0,.039),(.3,.046),(.8,.046),(1,.039)],navy,'spine_03',16)
        for name,radius,section,mat,offset in [('Bearing',.044,.006,shell,.010),
                ('FineLip',.036,.002,edge,.017),('EnergyAnnulus',.028,.003,gem,.019)]:
            joint_ring(pre('SidePower'+name+str(s)),center+axis*offset,axis,radius,section,mat,'spine_03')
        for row in range(3):
            yy=1.495-row*.027
            ribbon(pre('PowerCooling%s_%s'%(s,row)),[(x-.024,yy,-.324),(x+.024,yy,-.324)],
                   .0045,liner,'spine_03',.0015)
        bar(pre('PowerFeedPipe'+str(s)),(x-s*.030,1.345,-.284),(s*.162,1.284,-.185),
            .007,navy,'spine_03',10)


def arms(c):
    from armor_detail import hand_details
    m,p=c['m'],c['p']
    shell,navy,liner,edge,gem=[m[k] for k in
        ['ArmorShell','ArmorTrim','ArmorLiner','ArmorEdge','ArmorGem']]
    pre=lambda n:tag('armor',n)
    for side,s in [('l',1),('r',-1)]:
        upper,lower,hand='upperarm_'+side,'lowerarm_'+side,'hand_'+side
        a,b,d=p[upper],p[lower],p[hand]
        ellipsoid(pre(upper+'_RecessedShoulderJoint'),a.lerp(b,.10),(.092,.090,.085),
                  liner,upper,20,10)
        limb_grid(pre(upper+'_ShoulderPeakRoof'),a,b,
                  [(-.16,.049,.062,0),(-.03,.113,.093,0),(.20,.142,.115,.012),
                   (.39,.123,.103,.025),(.48,.078,.082,.018)],
                  [s*x for x in [-2.35,-1.85,-1.25,-.72,-.35]],shell,upper,wall=.009)
        limb_grid(pre(upper+'_ShoulderForwardFold'),a,b,
                  [(.035,.083,.100,-.018),(.19,.125,.139,-.020),
                   (.39,.122,.136,.008),(.61,.077,.097,.030)],
                  [s*x for x in [-.42,-.17,.10,.42,.83]],shell,upper,wall=.008)
        limb_grid(pre(upper+'_ShoulderSideReturn'),a,b,
                  [(.16,.123,.098,.012),(.31,.136,.110,.014),
                   (.49,.111,.101,.026),(.62,.069,.082,.014)],
                  [s*x for x in [.79,1.03,1.42,1.79,2.05]],navy,upper,wall=.006)
        joint=a.lerp(b,.27)+Vector((0,.004,.114))
        joint_ring(pre(upper+'_ShoulderFrontBearing'),joint,(0,0,1),.032,.005,navy,upper)
        joint_ring(pre(upper+'_ShoulderFineBearingLip'),joint+Vector((0,0,.005)),
                   (0,0,1),.027,.0018,edge,upper)
        limb_grid(pre(upper+'_UpperArmOuterLeaf'),a,b,
                  [(.51,.078,.082,0),(.60,.088,.093,0),(.75,.070,.081,.014),
                   (.86,.052,.061,.018)],[-1.4,-.7,0,.7,1.3],shell,upper)
        limb_grid(pre(upper+'_UpperArmFlex'),a,b,
                  [(.42,.062,.062,0),(.79,.059,.057,0),(.97,.048,.048,0)],
                  [-math.pi,-1.5,0,1.5,math.pi],liner,upper,wall=.004)
        ellipsoid(pre(lower+'_ElbowAxle'),b,(.051,.051,.051),liner,lower,20,10)
        joint_ring(pre(lower+'_ElbowLip'),b+Vector((0,0,.050)),(0,0,1),.034,.004,edge,lower)
        limb_grid(pre(lower+'_ForearmNavyChassis'),b,d,
                  [(.11,.064,.071,0),(.32,.079,.088,0),(.66,.065,.073,.015),
                   (.95,.048,.053,0)],[-2.7,-1.7,-.8,0,.8,1.7,2.7],navy,lower)
        limb_grid(pre(lower+'_ForearmDorsalBlade'),b,d,
                  [(.16,.062,.079,-.012),(.29,.079,.104,0),(.52,.075,.103,.015),
                   (.76,.060,.080,.035),(.88,.043,.059,.015)],
                  [s*x for x in [-1.05,-.66,-.17,.20,.62]],shell,lower,wall=.007)
        limb_grid(pre(lower+'_ForearmLateralFin'),b,d,
                  [(.32,.079,.088,.012),(.48,.084,.091,.018),(.71,.063,.079,.038),
                   (.82,.050,.063,.018)],[s*x for x in [.68,1.02,1.35,1.70]],shell,lower)
        limb_grid(pre(lower+'_WristBellows'),b,d,
                  [(.88,.049,.054,0),(.93,.049,.054,0),(.99,.046,.050,0)],
                  [-math.pi,-1.5,0,1.5,math.pi],liner,lower,wall=.003)
        hand_details(c,side,b,d)


def legs(c):
    from armor_greaves import fitted_body_liner
    m,p=c['m'],c['p']
    shell,navy,liner,edge,gem=[m[k] for k in
        ['ArmorShell','ArmorTrim','ArmorLiner','ArmorEdge','ArmorGem']]
    pre=lambda n:tag('legs',n)
    loft(pre('pelvis_RecessedFlex'),[(.784,.114,.105,-.018),(.856,.170,.138,-.025),
         (.935,.167,.129,-.024)],liner,'pelvis',24,0,True)
    patch(pre('pelvis_CentralCodLeaf'),[(-.051,.924,.145),(.051,.924,.145),
          (.066,.869,.156),(.025,.792,.143),(-.025,.792,.143),(-.066,.869,.156)],
          (0,0,.012),shell,'pelvis',.007)
    for side,s in [('l',1),('r',-1)]:
        upper,lower,foot,ball='thigh_'+side,'calf_'+side,'foot_'+side,'ball_'+side
        a,b,d=p[upper],p[lower],p[foot]
        def mir(seq): return [(s*x,y,z) for x,y,z in seq]
        patch(pre('pelvis_ForwardHipPetal'+side),mir([(.083,.941,.140),(.171,.936,.122),
              (.212,.899,.098),(.205,.845,.106),(.172,.792,.131),
              (.128,.816,.153),(.098,.878,.157)]),(s*.004,0,.009),shell,'pelvis')
        patch(pre('pelvis_OuterHipPetal'+side),mir([(.190,.934,.081),(.225,.912,.025),
              (.235,.856,-.019),(.214,.795,.020),(.205,.825,.091)]),
              (s*.008,0,0),navy,'pelvis',.006)
        hip=Vector((s*.207,.868,.081))
        joint_ring(pre('pelvis_ExposedHipAxle'+side),hip,(s,0,.2),.036,.007,liner,'pelvis')
        joint_ring(pre('pelvis_HipAxleSignal'+side),hip+Vector((s*.005,0,.001)),
                   (s,0,.2),.030,.0025,gem,'pelvis')
        fitted_body_liner(c,'legs',['Body_Fur_'+upper,'Body_Fur_SoftJoint_'+lower])
        limb_grid(pre(upper+'_RecessedThighChassis'),a,b,
                  [(.06,.077,.079,0),(.26,.090,.102,0),(.59,.081,.093,0),
                   (.90,.059,.067,0)],[-math.pi,-2.1,-1.0,0,1.0,2.1,math.pi],navy,upper,
                  shift=(s*.013,0,0),wall=.004)
        sections=[('UpperHaunch',[(.13,.085,.100,-.02),(.23,.107,.119,-.03),
                                  (.36,.105,.118,-.024),(.40,.083,.101,-.01)]),
                  ('MidOuterBlade',[(.38,.091,.107,-.01),(.48,.102,.118,.015),
                                     (.65,.088,.107,.035),(.71,.064,.084,.02)]),
                  ('KneeApproach',[(.68,.074,.092,.01),(.73,.077,.095,.02),
                                   (.82,.056,.074,.03),(.87,.038,.059,.01)])]
        for name,profiles in sections:
            limb_grid(pre(upper+'_'+name),a,b,profiles,
                      [s*x for x in [-2.15,-1.67,-1.10,-.53,-.13]],shell,upper,
                      shift=(s*.020,0,0),wall=.007)
        ellipsoid(pre(lower+'_KneeFlex'),b,(.062,.061,.061),liner,lower,20,10)
        joint_ring(pre(lower+'_LateralKneeBearing'),b+Vector((s*.063,0,0)),
                   (s,0,0),.041,.007,navy,lower)
        joint_ring(pre(lower+'_KneeBearingLip'),b+Vector((s*.071,0,0)),
                   (s,0,0),.033,.0025,edge,lower)
        joint_ring(pre(lower+'_KneeEnergyRecess'),b+Vector((s*.072,0,0)),
                   (s,0,0),.024,.002,gem,lower)
        patch(pre(lower+'_FloatingPatella'),[(b.x-.038,b.y+.062,b.z+.063),
              (b.x+.034,b.y+.067,b.z+.063),(b.x+.054,b.y+.021,b.z+.079),
              (b.x+.031,b.y-.042,b.z+.073),(b.x-.027,b.y-.047,b.z+.073),
              (b.x-.052,b.y+.010,b.z+.079)],(0,0,.010),shell,lower,.006)
        boots(c,side,b,d,foot,ball)


def boots(c,side,b,d,foot,ball):
    from armor_greaves import fitted_body_liner
    m,p=c['m'],c['p']
    shell,navy,liner,edge,gem=[m[k] for k in
        ['ArmorShell','ArmorTrim','ArmorLiner','ArmorEdge','ArmorGem']]
    pre=lambda n:tag('boots',n)
    lower='calf_'+side
    s=1 if side=='l' else -1
    before=set(bpy.context.scene.objects)
    fitted_body_liner(c,'boots',['Body_Fur_'+lower]+[
        o.name for o in bpy.context.scene.objects if o.name.startswith('Body_Paws_'+side+'_')])
    limb_grid(pre(lower+'_RecessedCalfFrame'),b,d,
              [(.13,.059,.071,0),(.29,.065,.078,0),(.61,.056,.068,0),
               (.97,.046,.052,0)],[-math.pi,-2.1,-1,0,1,2.1,math.pi],navy,lower,wall=.004)
    limb_grid(pre(lower+'_TibialRidge'),b,d,
              [(.17,.044,.083,-.006),(.27,.061,.102,.006),(.48,.051,.100,.018),
               (.65,.039,.081,.018),(.83,.026,.064,0)],
              [-.65,-.30,0,.30,.65],shell,lower,wall=.007)
    limb_grid(pre(lower+'_OuterShinBlade'),b,d,
              [(.25,.068,.086,.02),(.36,.079,.094,.015),(.56,.066,.085,.04),
               (.76,.052,.067,.035),(.87,.039,.053,.01)],
              [s*x for x in [-1.92,-1.53,-1.03,-.73]],shell,lower,wall=.006)
    limb_grid(pre(lower+'_InnerRecessFlange'),b,d,
              [(.27,.065,.075,0),(.46,.063,.078,.01),(.69,.047,.061,.025)],
              [s*x for x in [.80,1.15,1.53]],navy,lower,wall=.004)
    limb_grid(pre(lower+'_AnkleBellows'),b,d,
              [(.85,.050,.057,0),(.95,.048,.055,0),(1.025,.045,.051,0)],
              [-math.pi,-1.5,0,1.5,math.pi],liner,lower,wall=.003)
    for bone,anchor,toe in [(foot,d,False),(ball,p[ball],True)]:
        boot_shell(pre(bone+'_OriginalContactSole'),anchor,toe,liner,bone,side,4,
                   {'foot_side':side,'foot_bone':bone})
    extras={'foot_side':side,'foot_bone':foot}
    bands=[[(-.112,.060,.143),(-.077,.073,.171),(-.052,.077,.166)],
           [(-.045,.077,.162),(-.014,.078,.147),(.013,.075,.128)],
           [(.020,.074,.124),(.046,.070,.105),(.071,.064,.084)]]
    for i,profiles in enumerate(bands):
        rows=[[(d.x+u*w*(1.03 if u*s>0 else .94),.018+(h-.018)*(1-u*u)**.34,z)
               for u in [-1,-.70,-.28,.28,.70,1]] for z,w,h in profiles]
        cage(pre(foot+'_SegmentedInstep'+str(i)),rows,shell,foot,.006,.0015,extras,True)
    for digit in [-1,0,1]:
        for segment,zs in enumerate([[-.030,-.006,.025],[.031,.059,.086]]):
            rows=[]
            for i,z in enumerate(zs):
                w=[.0225,.024,.022][i] if segment==0 else [.022,.021,.017][i]
                h=[.100,.101,.087][i] if segment==0 else [.084,.065,.043][i]
                rows.append([(p[ball].x+digit*.048+u*w,.018+(h-.018)*(1-u*u)**.34,
                              p[ball].z+z) for u in [-1,-.68,-.24,.24,.68,1]])
            cage(pre(ball+'_Toe%dSegment%d'%(digit,segment)),rows,shell,ball,.005,.0013,
                 {'foot_side':side,'foot_bone':ball},True)
    pivot=d+Vector((s*.060,.032,.002))
    joint_ring(pre(foot+'_AnklePivot'),pivot,(1,0,0),.030,.006,navy,foot)
    joint_ring(pre(foot+'_AnkleLip'),pivot+Vector((s*.006,0,0)),(1,0,0),.028,.002,edge,foot)
    # Preserve the established support plane and all original foot/ball assignments.
    for obj in set(bpy.context.scene.objects)-before:
        if obj.type=='MESH' and obj.get('bind_bone') in [foot,ball]:
            obj['foot_side'],obj['foot_bone']=side,obj['bind_bone']
            for vertex in obj.data.vertices: vertex.co.z=max(.0032,vertex.co.z)
            obj.data.update()


def control(c):
    from armor import ring
    ring(c)
