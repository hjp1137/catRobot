"""Deterministic long-lens review of either untouched before or sculpted after."""
import bpy
from pathlib import Path
from mathutils import Vector

VIEWS = {'front': (0,-1.60,.073), 'three_quarter': (1.18,-1.192,.19),
         'profile': (1.65,-.012,.073), 'below': (.68,-1.40,-.40),
         'above': (.55,-1.40,.74)}

def show(version='After'):
    for name in ('Before', 'After'):
        col = bpy.data.collections['CATHEAD_'+name]
        col.hide_render = col.hide_viewport = name != version
    bpy.data.collections['CATHEAD_Source'].hide_render = True
    bpy.data.collections['CATHEAD_Source'].hide_viewport = True

def setup():
    scene = bpy.context.scene
    col = bpy.data.collections.get('CATHEAD_Review')
    if col is None:
        col = bpy.data.collections.new('CATHEAD_Review')
        scene.collection.children.link(col)
    cam = bpy.data.objects.get('CATHEAD_Camera')
    if cam is None:
        cam = bpy.data.objects.new('CATHEAD_Camera', bpy.data.cameras.new('CATHEAD_90mm'))
        col.objects.link(cam)
    cam.data.lens = 90; cam.data.sensor_width = 36
    scene.camera = cam
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.render.resolution_x = scene.render.resolution_y = 900
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.film_transparent = False
    scene.world = bpy.data.worlds.new('CATHEAD_ReviewWorld') if scene.world is None else scene.world.copy()
    scene.world.use_nodes = True
    bg = next(n for n in scene.world.node_tree.nodes if n.type == 'BACKGROUND')
    bg.inputs['Color'].default_value = (.055,.060,.070,1)
    bg.inputs['Strength'].default_value = .45
    lights = [('Key',(-.75,-1.1,1.25),60,1.0), ('Fill',(.95,-.45,.55),35,.8),
              ('Rim',(.1,.6,.85),65,.7), ('Bounce',(0,-.8,-.4),8,.9)]
    for name, pos, power, size in lights:
        lamp = bpy.data.objects.get('CATHEAD_'+name)
        if lamp is None:
            lamp = bpy.data.objects.new('CATHEAD_'+name, bpy.data.lights.new('CATHEAD_'+name, 'AREA'))
            col.objects.link(lamp)
        lamp.location = pos; lamp.data.energy = power; lamp.data.shape = 'DISK'; lamp.data.size = size
        lamp.rotation_euler = (Vector((0,0,.07))-lamp.location).to_track_quat('-Z','Y').to_euler()
        lamp.hide_render = False; lamp.hide_set(False)
    scene.view_settings.view_transform = 'AgX'
    view('three_quarter')
    return {'camera': cam.name, 'lens_mm': 90, 'resolution': [900,900], 'views': list(VIEWS)}

def view(name):
    cam = bpy.data.objects['CATHEAD_Camera']
    cam.location = VIEWS[name]
    cam.rotation_euler = (Vector((0,-.012,.073))-cam.location).to_track_quat('-Z','Y').to_euler()
    for window in bpy.context.window_manager.windows:
        for area in window.screen.areas:
            if area.type == 'VIEW_3D':
                area.spaces.active.region_3d.view_perspective = 'CAMERA'
    return {'view': name, 'position': list(cam.location)}

def render(output_dir, version='After', name='three_quarter'):
    path = Path(output_dir); path.mkdir(parents=True, exist_ok=True)
    show(version); view(name)
    bpy.context.scene.render.filepath = str(path/(version.lower()+'_'+name+'.png'))
    bpy.ops.render.render(write_still=True)
    return bpy.context.scene.render.filepath
