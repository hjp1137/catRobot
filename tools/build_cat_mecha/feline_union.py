"""Native high-only junction union; final UV work follows shape approval."""
import bpy,bmesh,json,math
from mathutils import Matrix
from mathutils.bvhtree import BVHTree
from geometry import v
from feline_cage import move,relief
from fur_surface import assign_fur_uv

def pose_and_unite(points):
    for obj in list(bpy.context.scene.objects):
        bone=obj.get('bind_bone','')
        if obj.get('body_source_kind')!='High': continue
        if any(bone.startswith(k) for k in ['upperarm','lowerarm','hand']):
            side=bone[-1]; pivot=v(points['upperarm_'+side])
            rotation=Matrix.Rotation(1.06 if side=='l' else -1.06,4,'Y')
            obj.matrix_world=Matrix.Translation(pivot)@rotation@Matrix.Translation(-pivot)@obj.matrix_world
            obj['review_pose_applied']=True
    prefixes=['Body_Master_Arm_','Body_Master_Leg_','Body_Master_ShoulderBridge_',
              'Body_Master_HandPaw_','Body_Master_FootPaw_']
    parts=[o for o in bpy.context.scene.objects if o.name in ['Body_Master_TorsoNeck','Body_Master_Tail']
           or any(o.name.startswith(prefix) for prefix in prefixes)]
    names=[o.name for o in parts]
    print('CAT_BODY_UNION source_parts',len(parts),flush=True)
    bpy.ops.object.select_all(action='DESELECT')
    for obj in parts: obj.select_set(True)
    bpy.context.view_layer.objects.active=next(o for o in parts if o.name=='Body_Master_TorsoNeck')
    bpy.ops.object.join()
    source=bpy.context.object; source.name='Source_Body_CageDerivedHigh'
    tree=BVHTree.FromObject(source,bpy.context.evaluated_depsgraph_get())
    materials=[p.material_index for p in source.data.polygons]
    result=source.copy(); result.data=source.data.copy()
    bpy.context.scene.collection.objects.link(result); result.name='Body_Master_ContinuousHigh'
    bpy.context.view_layer.objects.active=result
    modifier=result.modifiers.new('High-poly shoulder and hip sculpt union','REMESH')
    modifier.mode='VOXEL'; modifier.voxel_size=.0026; modifier.use_smooth_shade=True
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    print('CAT_BODY_UNION remesh_ready',len(result.data.vertices),flush=True)
    modifier=result.modifiers.new('Local high sculpt relaxation','SMOOTH')
    modifier.factor=.20; modifier.iterations=2
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    roots=[(v((s*.15,1.46,0)),(.13,.12,.10)) for s in [-1,1]]
    roots.append((v((0,.867,-.165)),(.09,.09,.08)))
    for side in ['l','r']:
        pivot=v(points['upperarm_'+side])
        rotation=Matrix.Rotation(1.06 if side=='l' else -1.06,4,'Y')
        wrist=pivot+rotation.to_3x3()@(v(points['hand_'+side])-pivot)
        roots.append((wrist,(.065,.075,.065)))
        roots.append((v(points['foot_'+side]),(.065,.075,.065)))
    group=result.vertex_groups.new(name='Local anatomical junction relaxation')
    # Write deform weights in BMesh once; per-vertex RNA group.add invalidates the mesh repeatedly.
    editable=bmesh.new(); editable.from_mesh(result.data)
    deform=editable.verts.layers.deform.verify()
    for vertex in editable.verts:
        weight=max(math.exp(-2*sum(((vertex.co[i]-center[i])/radius[i])**2 for i in range(3)))
                   for center,radius in roots)
        if weight>.025: vertex[deform][group.index]=weight
    editable.to_mesh(result.data); editable.free()
    print('CAT_BODY_UNION local_weights_ready',flush=True)
    modifier=result.modifiers.new('Shoulder tail wrist ankle local sculpt blend','SMOOTH')
    modifier.vertex_group=group.name; modifier.factor=.62; modifier.iterations=22
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    assign_fur_uv(result,(0,1,0),(.55,1,.30),cylindrical=True)
    result['preview_uv']='Temporary cylindrical UV; final character UV/bake follows shape acceptance'
    print('CAT_BODY_UNION preview_uv_ready',flush=True)
    for polygon in result.data.polygons:
        hit=tree.find_nearest(polygon.center)
        if hit[2] is not None: polygon.material_index=materials[hit[2]]
        polygon.use_smooth=True
    relief(result,.00022)
    result['review_pose_applied']=True
    result['control_cages']=json.dumps([o.name for o in bpy.context.scene.objects if o.get('body_source_kind')=='ControlCage'])
    result['shape_notes']='Continuous sculpt junctions, preserved source cages, temporary preview UV'
    source['body_source_kind']='CageDerivedHigh'; source['source_parts']=json.dumps(names)
    source.hide_render=True; source.hide_set(True)
    move(source,'Body_PreUnionHigh'); move(result,'Body_HighPoly')
    print('CAT_BODY_CONTINUOUS_HIGH',len(result.data.vertices),flush=True)
