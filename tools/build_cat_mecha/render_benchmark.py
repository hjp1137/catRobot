"""Small CPU grey/PBR DCC views; never formal gameplay acceptance evidence."""
import bpy, json, sys, math
from datetime import datetime
from pathlib import Path
from mathutils import Vector, Matrix
sys.path.insert(0,str(Path(__file__).resolve().parent))
from geometry import material, v
from glb_source import source_points

ROOT=Path(__file__).resolve().parents[2]
CACHE=Path('E:/dev-cache/catRobot-astral-benchmark-20261023')
MASTER='--body-master' in sys.argv
BODY='--body-only' in sys.argv or MASTER
if MASTER: CACHE=CACHE/'body_master'
filename='cat_body_master_high.blend' if MASTER else ('cat_body_study.blend' if BODY else 'cat_mecha_evolution.blend')
source_blend=CACHE/filename
bpy.ops.wm.open_mainfile(filepath=str(source_blend))
scene=bpy.context.scene
points=source_points(ROOT/'godot/assets/characters/cat3d/UAL1_Standard.glb')
head=Vector(points['Head'])+Vector((0,.090,.008))
for obj in scene.objects:
    bone=obj.get('bind_bone','')
    if obj.get('review_pose_applied'): continue
    if any(bone.startswith(k) for k in ['upperarm','lowerarm','hand']):
        side=bone[-1]; pivot=v(points['upperarm_'+side])
        rot=Matrix.Rotation(1.06 if side=='l' else -1.06,4,'Y')
        obj.matrix_world=Matrix.Translation(pivot)@rot@Matrix.Translation(-pivot)@obj.matrix_world
world=bpy.data.worlds.new('DCC_BenchmarkWorld'); scene.world=world; world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(.09,.11,.15,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.35
if MASTER:
    world.color=(.06,.07,.09)
    bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.003))
    bpy.context.object.name='DCC_ReviewFloor'
    bpy.context.object.data.materials.append(material('DCC_ReviewFloorMat',(.07,.08,.10),0,.75))
for name,loc,power,size in [('Key',(-3,-4,4),650,3),('Fill',(3,-2,3),350,3),('Rim',(1,3,3),800,2)]:
    data=bpy.data.lights.new('DCC_'+name,'AREA'); data.energy=power; data.shape='DISK'; data.size=size
    obj=bpy.data.objects.new('DCC_'+name,data); scene.collection.objects.link(obj); obj.location=loc
    obj.rotation_euler=(Vector((0,0,1.5))-obj.location).to_track_quat('-Z','Y').to_euler()
camera=bpy.data.objects.new('DCC_BenchmarkCamera',bpy.data.cameras.new('DCC_BenchmarkCamera'))
scene.collection.objects.link(camera); scene.camera=camera; camera.data.type='ORTHO'
scene.render.engine='CYCLES'; scene.cycles.device='CPU'; scene.cycles.samples=12
scene.cycles.use_denoising=True; scene.render.threads_mode='FIXED'; scene.render.threads=6
scene.render.resolution_x=512; scene.render.resolution_y=512; scene.render.resolution_percentage=100
if MASTER: scene.render.resolution_y=768
scene.render.image_settings.file_format='PNG'; scene.view_settings.view_transform='AgX'
gray=material('DCC_UniformGray',(.32,.34,.38),0,.63)
out=CACHE/('body_gray_review' if MASTER else ('gray_review' if BODY else 'gray_review_full')); out.mkdir(exist_ok=True)
if '--output-name' in sys.argv:
    out=CACHE/sys.argv[sys.argv.index('--output-name')+1]; out.mkdir(exist_ok=True)
if MASTER and '--turntable' in sys.argv:
    turn_name=sys.argv[sys.argv.index('--output-name')+1] if '--output-name' in sys.argv else 'turntable_gray'
    out=CACHE/turn_name; out.mkdir(exist_ok=True)
    scene.render.resolution_x=384; scene.render.resolution_y=576
manifest=json.loads((out/'manifest.json').read_text()) if MASTER and (out/'manifest.json').exists() else []
for entry in manifest:
    entry['source_blend']=str(source_blend)
    entry['source_blend_mtime']=datetime.fromtimestamp(source_blend.stat().st_mtime).isoformat()
    if MASTER and entry['angle']=='front' and 'camera_position' not in entry:
        entry['camera_position']=[0,-8,1.06]; entry['target']=[0,0,1.01]
    if 'camera_position' in entry:
        delta=Vector(entry['camera_position'])-Vector(entry['target'])
        entry['azimuth_degrees']=math.degrees(math.atan2(delta.x,-delta.y))%360
for tier in (['bare'] if BODY else ['bare','astral']):
    for obj in scene.objects:
        if obj.name.startswith('Tier_'):
            obj.hide_render=not obj.name.startswith('Tier_'+tier+'_') or 'Family_' in obj.name
    framings=['full'] if MASTER else (['face'] if '--first' in sys.argv or '--face-review' in sys.argv else ['face','full'])
    if MASTER and '--locals' in sys.argv: framings=['face','ear','paw_hand','paw_foot']
    for framing in framings:
        target=Vector((0,0,head.y-.003)) if framing=='face' else Vector((0,0,1.01))
        camera.data.ortho_scale=.74 if framing=='face' else 2.14
        if MASTER and framing!='full':
            if framing=='face':
                target=Vector((0,-.015,1.70)); camera.data.ortho_scale=.70
            else:
                name={'ear':'Body_Master_EarShell1','paw_hand':'Cage_Body_Master_Palm_l',
                      'paw_foot':'Cage_Body_Master_PlantarVolume_l'}[framing]
                part=bpy.data.objects[name]
                bounds=[part.matrix_world@Vector(corner) for corner in part.bound_box]
                target=sum(bounds,Vector())/8
                if framing=='paw_hand':
                    rotation=Matrix.Rotation(1.06,4,'Y')
                    target+=rotation.to_3x3()@Vector((.025,0,0))
                camera.data.ortho_scale={'ear':.36,'paw_hand':.32,'paw_foot':.34}[framing]
        angles=[('front',(0,-8,.05)),('side',(8,0,.05)),('quarter',(3.5,-8,.35))]
        if MASTER: angles=[angles[0],angles[1],('back',(0,8,.05)),angles[2]]
        if MASTER: angles[-1]=('quarter',(5.656854,-5.656854,.35))
        if MASTER and '--first' in sys.argv: angles=[angles[0],angles[-1]]
        if MASTER and framing!='full':
            angles=[('local',(4,-8,2.2 if framing=='paw_foot' else .7))]
        if '--angles' in sys.argv:
            chosen=sys.argv[sys.argv.index('--angles')+1].split(',')
            angles=[entry for entry in angles if entry[0] in chosen]
        if MASTER and '--turntable' in sys.argv:
            import math
            angles=[('frame_%03d'%i,(8*math.sin(i*math.tau/48),-8*math.cos(i*math.tau/48),.08)) for i in range(48)]
        if '--face-review' in sys.argv: angles=[angles[0],angles[2]]
        for angle,offset in (angles[:1] if '--first' in sys.argv and not MASTER else angles):
            camera.location=target+Vector(offset)
            camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
            styles=['gray','pbr'] if framing=='face' or MASTER else ['gray']
            if '--gray-only' in sys.argv: styles=['gray']
            if '--pbr-only' in sys.argv: styles=['pbr']
            if MASTER and '--turntable' in sys.argv: styles=['gray']
            for style in styles:
                scene.render.engine='BLENDER_WORKBENCH' if MASTER and style=='gray' else 'CYCLES'
                if scene.render.engine=='BLENDER_WORKBENCH':
                    scene.display.shading.light='STUDIO'; scene.display.shading.color_type='SINGLE'
                    scene.display.shading.single_color=(.55,.57,.61)
                    scene.display.shading.show_shadows=True; scene.display.shading.show_cavity=True
                    scene.display.shading.cavity_type='BOTH'
                    scene.display.shading.background_type='WORLD'
                scene.view_layers[0].material_override=gray if style=='gray' else None
                filename=(angle+'_'+style+'.png') if MASTER else (tier+'_'+framing+'_'+angle+'_'+style+'.png')
                if MASTER and framing!='full': filename=framing+'_'+style+'.png'
                if MASTER and '--turntable' in sys.argv: filename=angle+'.png'
                scene.render.filepath=str(out/filename); bpy.ops.render.render(write_still=True)
                manifest=[entry for entry in manifest if entry['file']!=filename]
                manifest.append({'file':filename,'tier':tier,'framing':framing,'angle':angle,'style':style,
                                 'camera_position':list(camera.location),'target':list(target),
                                 'azimuth_degrees':math.degrees(math.atan2(offset[0],-offset[1]))%360,
                                 'source_blend':str(source_blend),
                                 'source_blend_mtime':datetime.fromtimestamp(source_blend.stat().st_mtime).isoformat(),
                                 'evidence':scene.render.engine+' high-poly DCC, not game','ortho_scale':camera.data.ortho_scale})
                print('BENCHMARK_GRAY_VIEW',filename,flush=True)
(out/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
