"""Editable shared feline head: shaped quad cage, native subdivision and bake."""
import bpy, json, math
from mathutils import Vector
from geometry import mesh, panel, ellipsoid, tube
from body import build_ears, eye_patch, lid_surface
from fur_surface import assign_fur_uv

PROFILES=[(-.158,.022,.040,-.002),(-.145,.060,.071,.004),
          (-.120,.105,.110,.006),(-.108,.132,.126,.004),(-.092,.151,.143,.002),
          (-.079,.177,.154,-.001),
          (-.061,.192,.160,-.003),(-.032,.205,.174,-.007),
          (.000,.202,.178,-.008),(.034,.197,.178,-.009),
          (.065,.188,.173,-.011),(.098,.178,.163,-.016),
          (.129,.160,.143,-.021),(.156,.128,.113,-.025),
          (.177,.071,.065,-.027),(.187,.008,.009,-.027)]

def blob(x,y,cx,cy,rx,ry):
    return math.exp(-((x-cx)/rx)**2-((y-cy)/ry)**2)

def shaped_cage(head,mat):
    vertices,faces=[],[]
    for y,width,depth,offset in PROFILES:
        for j in range(32):
            angle=-math.pi+j*2*math.pi/32
            x=math.sin(angle)*width
            front=max(0,math.cos(angle))
            z=math.cos(angle)*depth+offset
            sculpt=.010*blob(x,y,0,-.020,.027,.048)
            sculpt+=.011*blob(x,y,0,-.129,.044,.025)
            sculpt+=.018*blob(x,y,0,-.109,.041,.014)
            for side in [-1,1]:
                sculpt-=.030*blob(x,y,side*.084,.030,.050,.039)
                sculpt+=.018*blob(x,y,side*.142,-.049,.057,.040)
                sculpt+=.056*blob(x,y,side*.047,-.079,.028,.027)
                sculpt+=.008*blob(x,y,side*.089,.079,.061,.020)
            z+=sculpt*front**3
            vertices.append(head+Vector((x,y,z)))
    for row in range(len(PROFILES)-1):
        for j in range(32):
            a=row*32+j; b=row*32+(j+1)%32
            faces.append((a,b,b+32,a+32))
    faces.extend([tuple(reversed(range(32))),tuple(range((len(PROFILES)-1)*32,len(vertices)))])
    obj=mesh('SOURCE_Face_ControlCage',vertices,faces,mat,'Head',smooth=True)
    assign_fur_uv(obj,head,(.208,.190,.187))
    obj['shape_notes']='Continuous cheek, recessed orbit, short nasal bridge, split whisker pads and chin control rings'
    return obj

def duplicate(obj,name,level):
    result=obj.copy(); result.data=obj.data.copy()
    bpy.context.collection.objects.link(result)
    result.name=name
    bpy.context.view_layer.objects.active=result
    modifier=result.modifiers.new('Editable quad surface subdivision','SUBSURF')
    modifier.levels=level; modifier.render_levels=level
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    return result

def mark_source(obj):
    obj['source_only']=True
    obj.hide_render=True
    obj.hide_set(True)

def replace_face(points,mats,cache,bake=False,high_only=False):
    head=Vector(points['Head'])+Vector((0,.090,.008))
    from astral_face_color import prepare_face_color
    prepare_face_color(mats['FurHead'],cache/'textures')
    for obj in list(bpy.context.scene.objects):
        if obj.type=='MESH' and obj.get('bind_bone')=='Head' and 'Ear' not in obj.name:
            bpy.data.objects.remove(obj,do_unlink=True)
    cage=shaped_cage(head,mats['FurHead'])
    print('CAT_FACE_STAGE cage_ready',len(cage.data.vertices),flush=True)
    low=duplicate(cage,'Body_Fur_HeadSculpt',2)
    high=duplicate(cage,'SOURCE_Face_HighPoly',4)
    print('CAT_FACE_STAGE high_ready',len(high.data.vertices),flush=True)
    sculpt_detail(high,head)
    print('CAT_FACE_STAGE detail_ready',flush=True)
    if bake:
        from astral_face_bake import bake_face
        bake_face(low,high,mats['FurHead'],cache/'textures')
    for obj in [cage,high]: mark_source(obj)
    if high_only:
        from feline_cage import move
        high.hide_render=False; high.hide_set(False)
        high['body_source_kind']='High'; high['control_cage']=cage.name
        cage['body_source_kind']='ControlCage'
        move(cage,'Body_ControlCages'); move(high,'Body_HighPoly')
        bpy.data.objects.remove(low,do_unlink=True)
    build_eyes(head,mats)
    build_nose(head,mats)
    report={'cage_vertices':len(cage.data.vertices),'cage_quads':sum(len(p.vertices)==4 for p in cage.data.polygons),
            'preview_vertices':0 if high_only else len(low.data.vertices),'high_vertices':len(high.data.vertices),
            'baked':bake,'head_center':list(head),'profiles':[list(row) for row in PROFILES]}
    (cache/'face_shape_report.json').write_text(json.dumps(report,indent=2),encoding='utf8')

def sculpt_detail(obj,head):
    """Actual high-poly grooves and follicle pits, transferred by a native bake."""
    normals=[vertex.normal.copy() for vertex in obj.data.vertices]
    for vertex,normal in zip(obj.data.vertices,normals):
        q=Vector((vertex.co.x,vertex.co.z,-vertex.co.y))-head
        front=max(0,min(1,q.z/.15))
        angle=math.atan2(q.x,q.z)
        hair=math.sin(angle*280+q.y*72+math.sin(q.y*95)*.7)
        hair*=math.sin(q.y*900+angle*23)**2
        relief=.00032*hair
        for side in [-1,1]:
            for row in range(3):
                for col in range(4):
                    px=side*(.030+col*.014); py=-.067-row*.012
                    relief-=.0009*blob(q.x,q.y,px,py,.0024,.0023)*front**4
        vertex.co+=normal*relief
    obj.data.update()
    obj['detail_notes']='Geometric directional fur grooves and 24 whisker follicles; not image projection'

def build_eyes(head,mats):
    for side in [-1,1]:
        c=head+Vector((side*.083,.025,.160))
        eye_patch('Body_Dark_EyeSocket'+str(side),c,.068,.047,mats['EyeRim'],side,.003)
        eye_patch('Body_EyeWhite'+str(side),c+Vector((0,0,.001)),.063,.043,mats['EyeWhite'],side,.006)
        eye_patch('Body_Eye_Iris'+str(side),c+Vector((0,0,.006)),.052,.040,mats['Eye'],side,.007)
        eye_patch('Body_Dark_Pupil'+str(side),c+Vector((0,.001,.019)),.0085,.029,mats['Pupil'],side,.001)
        ellipsoid('Body_Shine_Eye'+str(side),c+Vector((-.014,.016,.024)),(.0034,.0042,.0018),mats['Shine'],'Head',16,10)
        for upper in [True,False]:
            path=[]
            for j in range(25):
                a=math.pi*j/24+(0 if upper else math.pi)
                x=math.cos(a)*.064
                y=math.sin(a)*abs(math.sin(a))**.42*(.044 if upper else .034)+side*x*.26
                z=.004-.035*(x/.068)**2-side*x*.18
                path.append(c+Vector((x,y,z)))
            lid_surface('Body_EyeRim_Lid'+str(side)+str(upper),path,.0015 if upper else .0008,mats['EyeRim'])

def build_nose(head,mats):
    nose=head+Vector((0,-.055,.207))
    panel('Body_Pink_Nose',[(nose.x-.021,nose.y+.009,nose.z),(nose.x+.021,nose.y+.009,nose.z),
                           (0,nose.y-.014,nose.z+.003)],.009,mats['Pink'],'Head',.004)
    for side in [-1,1]:
        ellipsoid('Body_Dark_Nostril'+str(side),nose+Vector((side*.014,0,.003)),(.003,.002,.0015),mats['Dark'],'Head',12,8)
        center=head+Vector((0,-.094,.197))
        curve=[center,head+Vector((side*.015,-.098,.196)),head+Vector((side*.032,-.094,.190)),
               head+Vector((side*.042,-.086,.180))]
        lid_surface('Body_Dark_Mouth'+str(side),curve,.00125,mats['Dark'])
        if side==1:
            lid_surface('Body_Dark_Philtrum',[nose+Vector((0,-.014,.001)),center],.0011,mats['Dark'])
        for j in range(3):
            a=head+Vector((side*.068,-.069-j*.013,.191-j*.002))
            b=head+Vector((side*(.198+j*.006),-.060-j*.025,.176))
            tube('Body_Whisker'+str(side)+str(j),a,b,[(0,.00045),(1,.00009)],mats['Whisker'],'Head',6)
