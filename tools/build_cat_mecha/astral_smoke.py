"""Small offline construction/inventory smoke; never writes production assets."""
import bpy,sys,json,time
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from geometry import material
from glb_source import source_points
from body import build_body
from astral_armor import build_astral

root=Path(__file__).resolve().parents[2]
cache=Path('E:/dev-cache/catRobot-astral-benchmark-20261023')
started=time.monotonic()
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
points=source_points(root/'godot/assets/characters/cat3d/UAL1_Standard.glb')
keys=['Fur','FurTorso','FurHead','Cream','Stripe','Pink','Dark','Eye','EyeWhite',
      'EyeRim','Shine','Whisker','Claw','Pupil']
mats={k:material(k,(.3,.3,.3),0,.5) for k in keys}
build_body(points,mats,skip_face=True)
roles=['ArmorShell','ArmorTrim','ArmorLiner','ArmorEdge','ArmorGem']
colors=[(.64,.68,.72),(.018,.035,.07),(.012,.018,.025),(.50,.38,.21),(.02,.22,.8)]
armor={k:material(k+'_astral',color,.4,.35) for k,color in zip(roles,colors)}
build_astral(points,armor,cache)
lows=[o for o in bpy.context.scene.objects if o.type=='MESH' and not o.get('source_only')
      and o.name.startswith('Tier_astral_')]
cages=[o for o in bpy.context.scene.objects if o.get('astral_source_kind')=='Cage']
highs=[o for o in bpy.context.scene.objects if o.get('astral_source_kind')=='High']
slots=sorted({o.name.split('_')[3] for o in lows})
assert slots==['armor','boots','chest','helmet','legs','ring'],slots
assert cages and all(o.modifiers and o.hide_render and o.hide_get() for o in cages)
assert all(o.get('bind_bone') and not o.modifiers for o in lows)
foot={s:[o for o in lows if o.get('foot_side')==s] for s in ['l','r']}
assert all(foot.values())
assert all(min(v.co.z for v in o.data.vertices)>=.00319 for group in foot.values() for o in group)
report={'runtime_parts':len(lows),'cages':len(cages),'highs':len(highs),'slots':slots,
        'runtime_vertices':sum(len(o.data.vertices) for o in lows),
        'high_vertices':sum(len(o.data.vertices) for o in highs),
        'editable_cage_vertices':sum(len(o.data.vertices) for o in cages),
        'seconds':round(time.monotonic()-started,2),'assertions':'PASS'}
(cache/'astral_structure_report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
bpy.ops.wm.save_as_mainfile(filepath=str(cache/'astral_gray_structure.blend'))
print('ASTRAL_STRUCTURE_SMOKE',json.dumps(report),flush=True)
