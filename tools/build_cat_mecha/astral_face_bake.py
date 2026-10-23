"""Native Cycles selected-to-active face normal/AO bake onto shared UV/PBR."""
import bpy, json
import numpy as np

def pixels(image):
    values=np.empty(image.size[0]*image.size[1]*4,dtype=np.float32)
    image.pixels.foreach_get(values)
    return values.reshape(image.size[1],image.size[0],4)

def target_image(name,cache,data=True):
    image=bpy.data.images.new(name,width=2048,height=1024,alpha=False)
    image.colorspace_settings.name='Non-Color' if data else 'sRGB'
    image.filepath_raw=str(cache/(name+'.png')); image.file_format='PNG'
    return image

def bake_face(low,high,mat,cache):
    cache.mkdir(parents=True,exist_ok=True)
    scene=bpy.context.scene; scene.render.engine='CYCLES'; scene.cycles.device='CPU'
    scene.cycles.samples=16; scene.render.threads_mode='FIXED'; scene.render.threads=6
    scene.render.bake.use_selected_to_active=True
    scene.render.bake.cage_extrusion=.008; scene.render.bake.max_ray_distance=.025
    scene.render.bake.margin=16; scene.render.bake.use_clear=True
    geometric=bpy.data.materials.new('SOURCE_Face_GeometryOnly')
    geometric.use_nodes=True
    high.data.materials.clear(); high.data.materials.append(geometric)
    nodes,links=mat.node_tree.nodes,mat.node_tree.links
    shader=nodes.get('Principled BSDF')
    original=shader.inputs['Base Color'].links[0].from_node.image
    node=nodes.new('ShaderNodeTexImage'); nodes.active=node; node.select=True
    bpy.ops.object.select_all(action='DESELECT'); low.select_set(True); high.select_set(True)
    bpy.context.view_layer.objects.active=low
    normal=target_image('Cat_FurHead_BakedNormal',cache)
    node.image=normal
    bpy.ops.object.bake(type='NORMAL',normal_space='TANGENT')
    normal.save(); normal.pack()
    ao=target_image('Cat_FurHead_BakedAO',cache)
    node.image=ao
    bpy.ops.object.bake(type='AO')
    ao.save(); ao.pack()
    base=pixels(original); ambient=pixels(ao)
    # Store AO in the ordinary albedo map, compatible with the current runtime.
    base[:,:,:3]*=.65+.35*np.clip(ambient[:,:,:3],0,1)
    albedo=target_image('Cat_FurHead_Benchmark_Albedo',cache,False)
    albedo.pixels.foreach_set(base.reshape(-1)); albedo.save(); albedo.pack()
    node.image=normal
    normal_map=nodes.new('ShaderNodeNormalMap'); normal_map.inputs['Strength'].default_value=1
    links.new(node.outputs['Color'],normal_map.inputs['Color'])
    links.new(normal_map.outputs['Normal'],shader.inputs['Normal'])
    color_node=nodes.new('ShaderNodeTexImage'); color_node.image=albedo
    links.new(color_node.outputs['Color'],shader.inputs['Base Color'])
    normals=pixels(normal)[:,:,:3]
    report={'method':'Blender native Cycles selected-to-active NORMAL and AO',
            'low':low.name,'high':high.name,'low_vertices':len(low.data.vertices),
            'high_vertices':len(high.data.vertices),'uv':low.data.uv_layers.active.name,
            'normal':normal.name,'ao':ao.name,'albedo':albedo.name,
            'normal_xy_std':[float(normals[:,:,i].std()) for i in range(2)],
            'ao_range':[float(ambient[:,:,:3].min()),float(ambient[:,:,:3].max())],
            'material':mat.name,'normal_strength':1,'source_projection':False}
    (cache.parent/'face_bake_report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
    print('CAT_FACE_BAKE',json.dumps(report),flush=True)
