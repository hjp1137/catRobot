"""Native Cycles high-to-low normal/AO bake into one astral role-shared UV atlas."""
import bpy,json,time
from pathlib import Path


def _select(objects,active):
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        obj.hide_set(False)
        obj.select_set(True)
    bpy.context.view_layer.objects.active=active


def _image(name,cache,size,color):
    image=bpy.data.images.new(name,width=size,height=size,alpha=False)
    image.generated_color=color
    image.colorspace_settings.name='Non-Color'
    image.filepath_raw=str(cache/(name+'.png'))
    image.file_format='PNG'
    return image


def _target(materials,image):
    for mat in materials:
        nodes=mat.node_tree.nodes
        node=nodes.get('AstralBakeTarget') or nodes.new('ShaderNodeTexImage')
        node.name='AstralBakeTarget'
        node.image=image
        nodes.active=node


def _pixels(image):
    import numpy as np
    rgba=np.empty(len(image.pixels),dtype=np.float32)
    image.pixels.foreach_get(rgba)
    rgb=rgba.reshape((-1,4))[:,:3]
    result={'channel_min':rgb.min(axis=0).tolist(),'channel_max':rgb.max(axis=0).tolist()}
    if 'Normal' in image.name:
        result['nonflat_xy_pixels']=int(np.count_nonzero(np.max(abs(rgb[:,:2]-.5),axis=1)>.02))
    return result


def _connect(materials,normal,ao):
    from io_scene_gltf2.blender.com.material_helpers import create_settings_group,get_gltf_node_name
    name=get_gltf_node_name()
    group=bpy.data.node_groups.get(name) or create_settings_group(name)
    for mat in materials:
        nodes,links=mat.node_tree.nodes,mat.node_tree.links
        shader=nodes.get('Principled BSDF')
        tex=nodes.new('ShaderNodeTexImage')
        tex.name,tex.image='AstralSharedBakedNormal',normal
        mapping=nodes.new('ShaderNodeNormalMap')
        mapping.space='TANGENT'
        mapping.inputs['Strength'].default_value=.72
        links.new(tex.outputs['Color'],mapping.inputs['Color'])
        links.new(mapping.outputs['Normal'],shader.inputs['Normal'])
        occ=nodes.new('ShaderNodeTexImage')
        occ.name,occ.image='AstralSharedBakedOcclusion',ao
        out=nodes.new('ShaderNodeGroup')
        out.node_tree=group
        links.new(occ.outputs['Color'],out.inputs['Occlusion'])
        mat['astral_shared_atlas']=normal.name


def bake_astral(cache,size=2048):
    cache=Path(cache)/'textures'
    cache.mkdir(parents=True,exist_ok=True)
    started=time.monotonic()
    lows=sorted([o for o in bpy.context.scene.objects if o.type=='MESH' and
                 o.name.startswith('Tier_astral_') and not o.get('source_only')],key=lambda o:o.name)
    # Family insignia are generated after the armor module and share its materials.
    # Retain an exact high counterpart so their own atlas islands never cast into the chest below.
    from astral_mesh import register_native
    for obj in lows:
        if not obj.get('astral_bake_low'): register_native(obj)
    highs=[o for o in bpy.context.scene.objects if o.type=='MESH' and
           o.name.startswith('Source_astral_High_')]
    if not lows or not highs: raise ValueError('Astral bake requires actual low and high geometry')
    _select(lows,lows[0])
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=1.151917,island_margin=.003,area_weight=.15)
    bpy.ops.uv.pack_islands(rotate=True,margin=.0015)
    bpy.ops.object.mode_set(mode='OBJECT')
    materials=list({mat for o in lows for mat in o.data.materials})
    normal=_image('Astral_Shared_HighToLow_Normal',cache,size,(.5,.5,1,1))
    ao=_image('Astral_Shared_HighToLow_AO',cache,size,(1,1,1,1))
    copies=[]
    for obj in lows:
        copy=obj.copy()
        copy.data=obj.data.copy()
        copy.name='DCC_BakeTarget_'+obj.name
        bpy.context.scene.collection.objects.link(copy)
        copies.append(copy)
    _select(copies,copies[0])
    bpy.ops.object.join()
    target=bpy.context.object
    target.name='DCC_AstralSharedBakeTarget'
    target['source_only']=True
    scene=bpy.context.scene
    scene.render.engine='CYCLES'
    scene.cycles.device='CPU'
    scene.cycles.samples=16
    scene.render.threads_mode='FIXED'
    scene.render.threads=6
    scene.render.bake.use_selected_to_active=True
    scene.render.bake.use_clear=True
    scene.render.bake.margin=8
    scene.render.bake.cage_extrusion=.007
    scene.render.bake.max_ray_distance=.026
    render_state={o:o.hide_render for o in scene.objects if o.type=='MESH'}
    # Original low duplicates and the four unequipped tiers must not occlude the bake.
    for obj in render_state: obj.hide_render=obj not in highs and obj!=target
    operations=[]
    try:
        _select(highs+[target],target)
        for kind,image in [('NORMAL',normal),('AO',ao)]:
            _target(materials,image)
            begin=time.monotonic()
            result=bpy.ops.object.bake(type=kind)
            if result!={'FINISHED'}: raise RuntimeError('Native astral bake failed: '+str(result))
            image.save()
            image.pack()
            operations.append({'type':kind,'operator_result':sorted(result),
                               'seconds':round(time.monotonic()-begin,3),
                               'image':image.filepath_raw,'dimensions':list(image.size),
                               'pixel_measurement':_pixels(image)})
            print('ASTRAL_NATIVE_BAKE',kind,operations[-1]['seconds'],flush=True)
        _connect(materials,normal,ao)
        report={'low_objects':len(lows),'high_objects':len(highs),
                'low_vertices':sum(len(o.data.vertices) for o in lows),
                'high_vertices':sum(len(o.data.vertices) for o in highs),
                'atlas_size':size,'uv_layer_count':sum(bool(o.data.uv_layers) for o in lows),
                'selected_low_names':[o.name for o in lows],
                'selected_high_names':[o.name for o in highs],
                'materials':[m.name for m in materials],'operations':operations,
                'elapsed_seconds':round(time.monotonic()-started,3),
                'method':'Cycles CPU selected-to-active actual control-cage high to runtime low',
                'occlusion_node':'Blender 4.5 io_scene_gltf2 create_settings_group Occlusion'}
    finally:
        bpy.data.objects.remove(target,do_unlink=True)
        for obj,hidden in render_state.items():
            if obj!=target: obj.hide_render=hidden
        for obj in highs:
            obj.hide_render=True
            obj.hide_set(True)
        _select(lows,lows[0])
    report['source_only_restored']=all(o.get('source_only') and o.hide_render and o.hide_get() for o in highs)
    (cache.parent/'astral_bake_report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
    return report
