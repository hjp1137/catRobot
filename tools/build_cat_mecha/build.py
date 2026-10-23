"""Run: blender --background --python tools/build_cat_mecha/build.py -- --preview"""
import bpy, sys, os, json, re, shutil
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from glb_source import source_points
from geometry import material
from body import build_body
from armor import build_armor, TIERS
from families import build_families, astral_segments
from skin_export import attach_skin
from fur_surface import prepare_fur, prepare_metals, assign_fur_uv

ROOT=Path(__file__).resolve().parents[2]
BENCHMARK='--benchmark' in sys.argv
CACHE=Path(os.environ.get('CAT_MECHA_CACHE','E:/dev-cache/catRobot-mecha-fidelity-20261022'))
CANDIDATE=BENCHMARK or '--candidate' in sys.argv or '--body-only' in sys.argv
BODY_ONLY='--body-only' in sys.argv
BODY_MASTER='--body-master' in sys.argv
STEM='cat_body_study' if BODY_ONLY else 'cat_mecha_evolution'
OUT=(CACHE/(STEM+'_candidate.glb') if CANDIDATE else
     ROOT/'godot/assets/characters/cat3d/cat_mecha_evolution.glb')
MESHES=CACHE/('body_meshes.glb' if BODY_ONLY else 'meshes.glb')
REPORT=CACHE/('body_asset_report.json' if BODY_ONLY else 'asset_report.json')
SOURCE=ROOT/'godot/assets/characters/cat3d/UAL1_Standard.glb'
CACHE.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
points=source_points(SOURCE)
palette={'Fur':('96958e',0,.78),'FurTorso':('96958e',0,.78),'FurHead':('96958e',0,.78),'Cream':('eee6d8',0,.78),
         'Stripe':('4e4e4d',0,.78),'Pink':('b67572',0,.61),'Dark':('182327',0,.43),
         'Eye':('3fa9a4',0,.30),'EyeWhite':('b6c3b6',0,.40),'EyeRim':('4f554e',0,.70),'Shine':('ffffff',0,.25),
         'Whisker':('ccc9bd',0,.68),'Claw':('403e39',0,.48),'Pupil':('030606',0,.95)}
def rgb(hexcode):
    srgb=[int(hexcode[j:j+2],16)/255 for j in [0,2,4]]
    return tuple(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in srgb)
mats={key:material(key,rgb(color),metal,rough) for key,(color,metal,rough) in palette.items()}
metals={'blackiron':('30373c','716c60','d2a468'),'bronze':('84603e','c2a27a','88cfd0'),
        'silver':('929fa6','cbd4d8','52c9d0'),'gold':('ac8a48','d0b37a','29c4ec'),
        'astral':('c4d2d8','b7a37a','399bff')}
armor_mats={}
for tier,(shell,edge,glow) in metals.items():
    armor_mats[tier]={key:material(key+'_'+tier,rgb(color),metal,rough,emission)
        for key,color,metal,rough,emission in [('ArmorShell',shell,.78,.32,0),('ArmorEdge',edge,.82,.29,0),
        ('ArmorLiner','151d26',.08,.57,0),('ArmorGem',glow,.28,.23,.65),
        ('ArmorTrim','142d4b' if tier=='astral' else shell,.75,.34,0)]}
prepare_fur(mats,CACHE/'textures')
if BODY_MASTER:
    from feline_body import build_body_master
    from astral_face import replace_face
    build_body_master(points,mats)
    replace_face(points,mats,CACHE,high_only=True)
    from feline_review import save_master
    save_master(CACHE,points)
    sys.exit(0)
prepare_metals(armor_mats,CACHE/'textures')
print('CAT_MECHA_STAGE textures_ready',flush=True)
build_body(points,mats,skip_face=BENCHMARK)
print('CAT_MECHA_STAGE body_ready',flush=True)
if BENCHMARK:
    from astral_face import replace_face
    replace_face(points,mats,CACHE,bake='--bake' in sys.argv)
    print('CAT_MECHA_STAGE benchmark_face_ready',flush=True)
if not BODY_ONLY:
    if BENCHMARK:
        from astral_armor import build_astral
        build_armor(points,armor_mats,tiers=TIERS[:-1])
        print('CAT_MECHA_STAGE original_four_tiers_ready',flush=True)
        build_astral(points,armor_mats['astral'],CACHE)
    else:
        build_armor(points,armor_mats,tiers=['gold','astral'] if CANDIDATE and '--quick' in sys.argv else None)
        astral_segments(points,armor_mats['astral'])
    if '--no-family' not in sys.argv: build_families(points,armor_mats)
    if BENCHMARK and '--bake' in sys.argv:
        from astral_bake import bake_astral
        bake_astral(CACHE)
print('CAT_MECHA_STAGE geometry_ready',flush=True)

def group_key(obj):
    bone=obj.get('bind_bone','')
    if obj.name.startswith('Body_'):
        return 'Body_'+('Paws_'+obj['foot_side']+'_'+bone if 'foot_side' in obj else bone)
    match=re.match(r'(Tier_\w+_Slot_\w+?)_',obj.name)
    prefix=match.group(1)
    family=obj.get('family')
    return prefix+'_'+('Family_'+family+'_' if family else '')+bone

groups={}
for obj in list(bpy.context.scene.objects):
    if obj.type!='MESH' or obj.get('source_only'): continue
    if obj.name.startswith('Tier_') and not obj.data.uv_layers:
        # All hard-surface maps use ordinary UVs too; no runtime procedural shader.
        xyz=[(v.co.x,v.co.z,-v.co.y) for v in obj.data.vertices]
        low=[min(v[i] for v in xyz) for i in range(3)]
        high=[max(v[i] for v in xyz) for i in range(3)]
        center=[(a+b)*.5 for a,b in zip(low,high)]
        radii=[max((b-a)*.5,.002) for a,b in zip(low,high)]
        assign_fur_uv(obj,center,radii,True)
    groups.setdefault(group_key(obj),[]).append(obj)
for name,objects in groups.items():
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects: obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    if len(objects)>1: bpy.ops.object.join()
    obj=bpy.context.object
    obj.name=name
    # Joining preserves originals' material slots; prune duplicate slots offline.
    unique=[]
    mapping={}
    for i,mat in enumerate(obj.data.materials):
        if mat not in unique: unique.append(mat)
        mapping[i]=unique.index(mat)
    face_materials=[mapping[face.material_index] for face in obj.data.polygons]
    obj.data.materials.clear()
    for mat in unique: obj.data.materials.append(mat)
    for face,index in zip(obj.data.polygons,face_materials): face.material_index=index
    # Native tangent generation requires tris/quads; tube/panel caps include ngons.
    modifier=obj.modifiers.new('Offline export triangulation','TRIANGULATE')
    modifier.keep_custom_normals=True
    bpy.context.view_layer.objects.active=obj
    bpy.ops.object.modifier_apply(modifier=modifier.name)
bpy.ops.wm.save_as_mainfile(filepath=str(CACHE/(STEM+'.blend')))
source_dir=ROOT/'art/source/cat3d'
source_dir.mkdir(parents=True,exist_ok=True)
if not CANDIDATE:
    shutil.copyfile(CACHE/'cat_mecha_evolution.blend',source_dir/'cat_mecha_evolution.blend')
    for texture in (CACHE/'textures').glob('*.png'):
        (source_dir/'textures').mkdir(exist_ok=True)
        shutil.copyfile(texture,source_dir/'textures'/texture.name)
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.context.scene.objects:
    if obj.type=='MESH' and not obj.get('source_only'): obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(MESHES),export_format='GLB',export_extras=True,use_selection=True,
                         export_animations=False,export_skins=False,export_yup=True,
                         export_texcoords=True,export_tangents=True)
report=attach_skin(SOURCE,MESHES,OUT,REPORT)
print('CAT_MECHA_EXPORT',str(OUT),len(report['meshes']),flush=True)
if '--preview' in sys.argv:
    from render_preview import render
    render(CACHE,points)
