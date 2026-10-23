"""Portrait full-body review with recorded camera parameters."""
import bpy,json,math
from pathlib import Path
from mathutils import Vector

ROOT=Path('E:/dev-cache/catRobot-blender-mcp-20261023/full_body')
VIEWS={'front':(0,-5.8,1.08),'three_quarter':(4.101219,-4.101219,1.13),
       'profile':(5.8,0,1.08),'back':(0,5.8,1.08)}


def show(version):
    for key in ('Before','After'):
        col=bpy.data.collections['FULL_'+key];col.hide_render=col.hide_viewport=(key!=version)


def setup():
    scene=bpy.context.scene
    for obj in scene.objects:
        if obj.type in {'LIGHT','CAMERA'}:obj.hide_render=True
    col=bpy.data.collections.get('FULL_Studio')
    if col is None:col=bpy.data.collections.new('FULL_Studio');scene.collection.children.link(col)
    camera=bpy.data.objects.new('FULL_Camera',bpy.data.cameras.new('FULL_90mm'))
    col.objects.link(camera);scene.camera=camera;camera.data.lens=90;camera.data.sensor_fit='VERTICAL';camera.data.sensor_height=36
    scene.render.engine='BLENDER_EEVEE_NEXT';scene.render.resolution_x=720;scene.render.resolution_y=1080
    scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG'
    scene.render.film_transparent=False;scene.view_settings.view_transform='AgX'
    scene.render.hair_type='STRIP';scene.render.hair_subdiv=1
    world=bpy.data.worlds.new('FULL_StudioWorld');world.use_nodes=True;scene.world=world
    bg=next(n for n in world.node_tree.nodes if n.type=='BACKGROUND')
    bg.inputs['Color'].default_value=(.055,.060,.070,1);bg.inputs['Strength'].default_value=.45
    lights=[('Key',(-2,-3,4),600,3),('Fill',(2,-2,2.5),300,2.5),
            ('Rim',(1,2,3),700,2.5),('Bounce',(0,-2,.2),65,2)]
    for name,xyz,power,size in lights:
        obj=bpy.data.objects.new('FULL_'+name,bpy.data.lights.new('FULL_'+name,'AREA'))
        col.objects.link(obj);obj.location=xyz;obj.data.energy=power;obj.data.size=size
        obj.rotation_euler=(Vector((0,0,1))-obj.location).to_track_quat('-Z','Y').to_euler()
    return {'lens':90,'resolution':[720,1080]}


def render(version,angle,clay=False,folder=None,target=(0,0,1),position=None):
    show(version);scene=bpy.context.scene;cam=scene.camera
    cam.location=position if position is not None else VIEWS[angle]
    cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler()
    directory=ROOT/(folder or ('clay_comparison' if clay else 'comparison'));directory.mkdir(parents=True,exist_ok=True)
    objects=bpy.data.collections['FULL_'+version].all_objects
    data={o.data.name:o.data for o in objects if o.type in {'MESH','CURVE','CURVES'}}
    original={name:list(mesh.materials) for name,mesh in data.items()}
    try:
        if clay:
            from extract_head import material
            mat=material('FULL_UniformClay',(.4,.4,.4),.72)
            for mesh in data.values():
                if not mesh.materials:mesh.materials.append(mat)
                else:
                    for i in range(len(mesh.materials)):mesh.materials[i]=mat
        scene.render.filepath=str(directory/(version.lower()+'_'+angle+'.png'))
        bpy.ops.render.render(write_still=True)
    finally:
        if clay:
            for name,mesh in data.items():
                if not original[name]:mesh.materials.clear()
                else:
                    for i,mat in enumerate(original[name]):mesh.materials[i]=mat
    return {'file':scene.render.filepath,'source':bpy.data.filepath,'angle':angle,
            'lens_mm':cam.data.lens,'position':list(cam.location),'rotation':list(cam.rotation_euler),
            'resolution':[scene.render.resolution_x,scene.render.resolution_y],'clay':clay,'version':version,'sensor_height':cam.data.sensor_height,
            'sensor_fit':cam.data.sensor_fit,'view_transform':scene.view_settings.view_transform,
            'lights':{o.name:o.data.energy for o in bpy.data.collections['FULL_Studio'].objects if o.type=='LIGHT'}}


def render_set(version,clay=False):
    from bpy_extras.object_utils import world_to_camera_view
    records=[]
    for angle in VIEWS:
        record=render(version,angle,clay)
        scene=bpy.context.scene
        points=[world_to_camera_view(scene,scene.camera,obj.matrix_world@Vector(c))
                for obj in bpy.data.collections['FULL_'+version].all_objects
                if obj.type=='MESH' and not obj.hide_render for c in obj.bound_box]
        limits=[min(p.x for p in points),max(p.x for p in points),
                min(p.y for p in points),max(p.y for p in points)]
        assert min(limits)>=0 and max(limits)<=1, (angle,limits)
        record['framing_bounds']=limits;records.append(record)
    mode='clay_comparison' if clay else 'comparison'
    (ROOT/(mode+'_'+version.lower()+'_records.json')).write_text(json.dumps(records,indent=2))
    return {'version':version,'mode':mode,'images':len(records),'no_mesh_bbox_clipping':True}
