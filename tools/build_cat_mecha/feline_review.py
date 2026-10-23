"""Save the unarmored high-poly authoring scene and honest source statistics."""
import bpy,json
from pathlib import Path
from mathutils import Vector,Matrix
from geometry import v

def save_master(cache,points):
    pivot=v(Vector(points['Head'])+Vector((0,.090,.008)))
    scale=Matrix.Diagonal((1.14,1.10,1.11,1))
    for obj in bpy.context.scene.objects:
        if obj.type=='MESH' and obj.get('bind_bone')=='Head':
            obj.matrix_world=Matrix.Translation(pivot)@scale@Matrix.Translation(-pivot)@obj.matrix_world
            obj['high_stage_proportion']='Head width x1.14, depth x1.10, height x1.11; future rig adaptation pending'
    cage=bpy.data.objects.get('SOURCE_Face_ControlCage')
    if cage is not None and not cage.modifiers:
        modifier=cage.modifiers.new('Editable feline limit surface','SUBSURF')
        modifier.levels=2; modifier.render_levels=4
    high=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.get('body_source_kind')=='High']
    cages=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.get('body_source_kind')=='ControlCage']
    visible=[o for o in bpy.context.scene.objects if o.type=='MESH' and not o.hide_render]
    vertices=[o.matrix_world@vertex.co for o in visible for vertex in o.data.vertices]
    bpy.ops.file.pack_all()
    packed=[i for i in bpy.data.images if i.packed_file or len(i.packed_files)]
    nonpacked=[i.name for i in bpy.data.images if i.source!='VIEWER' and not (i.packed_file or len(i.packed_files))]
    report={'stage':'UNARMORED_HIGH_POLY_REVIEW_PENDING_USER_SHAPE_ACCEPTANCE',
            'method':'Native authored quad control cages, local vertex sculpt and Catmull-Clark high surfaces',
            'production_untouched':True,'baked':False,'game_lowpoly_created':False,'rigging_verified':False,
            'source_bones':'Existing 65 rest anchors used for reference; no rest changes',
            'cage_objects':len(cages),'cage_vertices':sum(len(o.data.vertices) for o in cages),
            'high_objects':len(high),'high_vertices':sum(len(o.data.vertices) for o in high),
            'visible_meshes':len(visible),'bounds_min':[min(p[i] for p in vertices) for i in range(3)],
            'packed_images':len(packed),'nonpacked_images':nonpacked,
            'blender_viewer_buffers':[i.name for i in bpy.data.images if i.source=='VIEWER'],
            'missing_external_images':[i.name for i in bpy.data.images if i.name in nonpacked
                                       and i.filepath and not Path(bpy.path.abspath(i.filepath)).is_file()],
            'armor_images':[i.name for i in bpy.data.images if 'Armor' in i.name],
            'cage_relation':'Cages and pre-union surfaces are editable sources; final voxel high is derived, not a live cage binding',
            'bounds_max':[max(p[i] for p in vertices) for i in range(3)],
            'parts':[{'name':o.name,'vertices':len(o.data.vertices),'cage':o.get('control_cage',''),
                      'bone_reference':o.get('bind_bone','')} for o in high]}
    bpy.ops.object.select_all(action='DESELECT')
    body=bpy.data.objects.get('Body_Master_ContinuousHigh')
    if body:
        body.select_set(True); bpy.context.view_layer.objects.active=body
    target=Vector((0,0,1.0)); eye=target+Vector((2.2,-8,.35))
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type!='VIEW_3D': continue
            space=area.spaces.active
            space.region_3d.view_location=target; space.region_3d.view_distance=3.1
            space.region_3d.view_rotation=(target-eye).to_track_quat('-Z','Y')
            space.region_3d.view_perspective='ORTHO'
            space.shading.type='SOLID'; space.shading.color_type='MATERIAL'
    (cache/'body_master_report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
    bpy.ops.wm.save_as_mainfile(filepath=str(cache/'cat_body_master_high.blend'))
    print('CAT_BODY_MASTER_HIGH',json.dumps({k:v for k,v in report.items() if k!='parts'}),flush=True)
