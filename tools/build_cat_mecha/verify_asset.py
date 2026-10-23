"""Offline content and exact skeleton verification; does not open a game window."""
import json, sys
from pathlib import Path
import numpy as np
from glb_source import read_glb, global_matrices
from skin_export import values

ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'godot/assets/characters/cat3d/UAL1_Standard.glb'
ASSET=(Path(sys.argv[sys.argv.index('--asset')+1]) if '--asset' in sys.argv else
       ROOT/'godot/assets/characters/cat3d/cat_mecha_evolution.glb')
source,sblob=read_glb(SOURCE)
doc,blob=read_glb(ASSET)
source_skin,skin=source['skins'][0],doc['skins'][0]
checks={}
checks['original_65_joint_indices']=source_skin['joints']==skin['joints'] and len(skin['joints'])==65
checks['inverse_bind_matrices_exact']=bool(np.array_equal(values(source,sblob,source_skin['inverseBindMatrices']),
                                                         values(doc,blob,skin['inverseBindMatrices'])))
checks['joint_names_and_rest_exact']=all(source['nodes'][i]==doc['nodes'][i] for i in skin['joints'])
names=[n['name'] for n in doc['nodes'] if 'mesh' in n]
checks['unique_mesh_names']=len(set(names))==len(names)
checks['images_embedded']=bool(doc.get('images')) and all('bufferView' in image and 'uri' not in image for image in doc['images'])
textured_materials={i for i,m in enumerate(doc['materials']) if 'normalTexture' in m or
    any(key.endswith('Texture') for key in m.get('pbrMetallicRoughness',{}))}
checks['textured_primitives_have_uv']=all('TEXCOORD_0' in p['attributes'] for mesh in doc['meshes']
    for p in mesh['primitives'] if p['material'] in textured_materials)
fur_materials={m['name']:m for m in doc['materials'] if m['name'] in ['Fur','FurTorso','FurHead','Cream']}
checks['four_fur_surfaces_have_pbr_maps']=len(fur_materials)==4 and all(
    'baseColorTexture' in m['pbrMetallicRoughness'] and 'metallicRoughnessTexture' in m['pbrMetallicRoughness']
    and 'normalTexture' in m for m in fur_materials.values())
checks['normal_surfaces_have_tangents']=all('TANGENT' in p['attributes'] for mesh in doc['meshes']
    for p in mesh['primitives'] if 'normalTexture' in doc['materials'][p['material']])
summary={'checks':checks,'bytes':ASSET.stat().st_size,'meshes':len(names),'groups':{},'foot_meshes':[]}
primitives=[p for mesh in doc['meshes'] for p in mesh['primitives']]
summary['embedded_images']=sum('bufferView' in image and 'uri' not in image for image in doc['images'])
summary['normal_primitives']=sum('normalTexture' in doc['materials'][p['material']] for p in primitives)
summary['tangent_primitives']=sum('TANGENT' in p['attributes'] for p in primitives)
summary['uv_primitives']=sum('TEXCOORD_0' in p['attributes'] for p in primitives)
for node in doc['nodes']:
    if 'mesh' not in node: continue
    name=node['name']
    group='body' if name.startswith('Body_') else name.split('_')[1]
    stats=summary['groups'].setdefault(group,{'vertices':0,'triangles':0,'meshes':0,'family_meshes':0})
    stats['meshes']+=1
    stats['family_meshes']+=int('Family_' in name)
    all_vertices=[]
    for primitive in doc['meshes'][node['mesh']]['primitives']:
        pos=values(doc,blob,primitive['attributes']['POSITION'])
        joints=values(doc,blob,primitive['attributes']['JOINTS_0'])
        weights=values(doc,blob,primitive['attributes']['WEIGHTS_0'])
        checks['finite_geometry']=checks.get('finite_geometry',True) and bool(np.isfinite(pos).all())
        checks['weights_sum_one']=checks.get('weights_sum_one',True) and bool(np.allclose(weights.sum(axis=1),1,atol=1e-6))
        checks['valid_joints']=checks.get('valid_joints',True) and bool((joints<65).all())
        stats['vertices']+=len(pos)
        stats['triangles']+=doc['accessors'][primitive['indices']]['count']//3
        all_vertices.extend(pos.tolist())
    if 'foot_side' in node.get('extras',{}):
        vertices=np.array(all_vertices)
        contact=np.array(node['extras']['contact_vertices'])
        on_mesh=all(np.min(np.linalg.norm(vertices-point,axis=1))<2e-6 for point in contact)
        checks['contacts_are_actual_vertices']=checks.get('contacts_are_actual_vertices',True) and on_mesh
        t=np.arange(384)
        y=1-2*(t+.5)/len(t)
        radius=np.sqrt(1-y*y)
        directions=np.array([np.cos(t*2.39996323)*radius,y,np.sin(t*2.39996323)*radius]).T
        support_error=float(np.max(np.abs((vertices@directions.T).max(axis=0)-(contact@directions.T).max(axis=0))))
        checks['complete_convex_support']=checks.get('complete_convex_support',True) and support_error<1e-6
        summary['foot_meshes'].append({'name':name,'bone':node['extras']['foot_bone'],'min_y':float(vertices[:,1].min()),
                                       'contact_count':len(contact),'vertices':len(vertices),'support_error_m':support_error})
for tier in ['blackiron','bronze','silver','gold','astral']:
    for slot in ['helmet','chest','armor','legs','boots','ring']:
        prefix='Tier_'+tier+'_Slot_'+slot+'_'
        checks[tier+'_'+slot]=any(n.startswith(prefix) and 'Family_' not in n for n in names)
        checks[tier+'_'+slot+'_five_families']=all(any(n.startswith(prefix+'Family_'+family+'_') for n in names)
            for family in ['assault','bastion','strider','artillery','ward'])
summary['result']='PASS' if all(checks.values()) else 'FAIL'
out=(Path(sys.argv[sys.argv.index('--output')+1]) if '--output' in sys.argv else
     ROOT/'Walkthroughes/logs/20261022_mecha_assets')
out.mkdir(parents=True,exist_ok=True)
(out/'offline_asset_checks.json').write_text(json.dumps(summary,indent=2),encoding='utf8')
print(json.dumps({k:v for k,v in summary.items() if k not in ['checks','foot_meshes']},ensure_ascii=False,indent=2))
print('CHECKS',sum(checks.values()),'/',len(checks),'FOOT_MESHES',len(summary['foot_meshes']))
sys.exit(0 if all(checks.values()) else 1)
