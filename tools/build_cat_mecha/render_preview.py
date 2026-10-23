"""Clearly labelled DCC beauty previews, never claimed as formal gameplay proof."""
import bpy, math, sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from mathutils import Vector, Matrix
from geometry import v, material

def render(cache,points):
    import sys
    scene=bpy.context.scene
    for obj in list(scene.objects):
        bone=obj.get('bind_bone','')
        side='l' if bone.endswith('_l') else ('r' if bone.endswith('_r') else '')
        if side and any(k in bone for k in ['upperarm','lowerarm','hand']):
            pivot=v(points['upperarm_'+side])
            rotation=Matrix.Rotation(1.06 if side=='l' else -1.06,4,'Y')
            obj.matrix_world=Matrix.Translation(pivot)@rotation@Matrix.Translation(-pivot)@obj.matrix_world
    bpy.ops.mesh.primitive_plane_add(size=200, location=(0,0,0))
    floor=bpy.context.object
    floor.name='DCC_StudioFloor'
    floor.data.materials.append(material('DCC_Floor',(.021,.017,.014),.06,.48))
    world=bpy.data.worlds.new('DCC_StudioWorld')
    scene.world=world
    world.use_nodes=True
    world.node_tree.nodes['Background'].inputs[0].default_value=(.08,.07,.06,1)
    world.node_tree.nodes['Background'].inputs[1].default_value=.30
    for name,loc,power,size,color in [('Key',(-3,-4,4.5),800,2.6,(1,.91,.81)),
                                      ('Fill',(3,-2,3),250,3.5,(.72,.84,1)),
                                      ('Rim',(2,3,4),900,2.5,(1,.87,.68))]:
        data=bpy.data.lights.new('DCC_'+name,'AREA')
        data.energy,data.shape,data.size,data.color=power,'DISK',size,color
        obj=bpy.data.objects.new('DCC_'+name,data)
        scene.collection.objects.link(obj)
        obj.location=loc
        obj.rotation_euler=(Vector((0,0,1.0))-obj.location).to_track_quat('-Z','Y').to_euler()
    data=bpy.data.cameras.new('DCC_Camera')
    camera=bpy.data.objects.new('DCC_Camera',data)
    scene.collection.objects.link(camera)
    camera.location=(3.3,-7.5,2.75)
    camera.rotation_euler=(Vector((0,0,1.03))-camera.location).to_track_quat('-Z','Y').to_euler()
    data.type,data.ortho_scale='ORTHO',2.23
    if '--face-preview' in sys.argv:
        camera.location=(2.6,-8,2.25)
        camera.rotation_euler=(Vector((0,0,1.68))-camera.location).to_track_quat('-Z','Y').to_euler()
        data.ortho_scale=.79
    scene.camera=camera
    scene.render.engine='CYCLES'
    scene.cycles.device='CPU'
    scene.cycles.samples=24
    scene.cycles.use_denoising=True
    scene.render.threads_mode='FIXED'
    scene.render.threads=8
    scene.render.resolution_x,scene.render.resolution_y,scene.render.resolution_percentage=640,800,100
    scene.render.image_settings.file_format='PNG'
    scene.view_settings.view_transform='AgX'
    scene.view_settings.look='AgX - Medium High Contrast'
    tiers=['bare','gold','astral'] if '--quick' in sys.argv else ['bare','gold','astral','blackiron','bronze','silver']
    if '--armor-check' in sys.argv: tiers=['gold','astral']
    if '--bare-preview' in sys.argv: tiers=['bare']
    for tier in tiers:
        for obj in scene.objects:
            if obj.name.startswith('Tier_'):
                obj.hide_render=not obj.name.startswith('Tier_'+tier+'_') or ('Family_' in obj.name and 'Family_assault_' not in obj.name)
        prefix='face_' if '--face-preview' in sys.argv else 'preview_'
        scene.render.filepath=str(cache/(prefix+tier+'.png'))
        bpy.ops.render.render(write_still=True)
        print('DCC_PREVIEW_DONE',tier,flush=True)

if __name__=='__main__':
    import sys
    from pathlib import Path
    sys.path.insert(0,str(Path(__file__).resolve().parent))
    from glb_source import source_points
    root=Path(__file__).resolve().parents[2]
    cache=Path('E:/dev-cache/catRobot-mecha-fidelity-20261022')
    bpy.ops.wm.open_mainfile(filepath=str(cache/'cat_mecha_evolution.blend'))
    render(cache,source_points(root/'godot/assets/characters/cat3d/UAL1_Standard.glb'))
