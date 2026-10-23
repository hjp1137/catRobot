"""Enclose the enlarged eyeballs in a continuous eyelid skin surface."""
import bpy,bmesh
import numpy as np
from mathutils import Matrix
from reference_head import ORIGIN,recess

def build():
    skin=bpy.data.objects['AFTER_Skin'];col=bpy.data.collections['FULL_RefinedHead']
    bpy.ops.object.select_all(action='DESELECT');parts=[skin]
    for side in (-1,1):
        mesh=bpy.data.meshes.new('ReferenceOrbitMass');bm=bmesh.new()
        bmesh.ops.create_uvsphere(bm,u_segments=64,v_segments=48,radius=.0745)
        bm.to_mesh(mesh);bm.free()
        for v in mesh.vertices:
            v.co.x=(v.co.x+side*.083)*1.13;v.co.y-=.088;v.co.z+=.029
        obj=bpy.data.objects.new('ReferenceOrbitMass',mesh);col.objects.link(obj)
        obj.matrix_world=Matrix.Translation(ORIGIN);parts.append(obj)
    for o in parts:o.select_set(True)
    bpy.context.view_layer.objects.active=skin;bpy.ops.object.join()
    rem=skin.modifiers.new('Continuous larger ocular envelope','REMESH')
    rem.mode='VOXEL';rem.voxel_size=.0016;rem.use_smooth_shade=True
    bpy.ops.object.modifier_apply(modifier=rem.name)
    relax=skin.modifiers.new('Relax joined orbital tissue','SMOOTH');relax.factor=.35;relax.iterations=3
    bpy.ops.object.modifier_apply(modifier=relax.name)
    co=np.empty((len(skin.data.vertices),3),np.float32);skin.data.vertices.foreach_get('co',co.ravel())
    co[:,0]/=1.13;recess(co);co[:,0]*=1.13
    skin.data.vertices.foreach_set('co',co.ravel());skin.data.update()
    bpy.context.view_layer.update()
    return {'vertices':len(co),'faces':len(skin.data.polygons),'voxel':.0016,'method':'Closed eyelid envelope with Y-only recess'}

def nose():
    obj=bpy.data.objects['AFTER_Body_Pink_Nose']
    co=np.empty((len(obj.data.vertices),3),np.float32);obj.data.vertices.foreach_get('co',co.ravel())
    center=(co.min(axis=0)+co.max(axis=0))*.5
    co=(co-center)*np.array([1.3,1.15,1.22])+center;co[:,1]-=.011
    obj.data.vertices.foreach_set('co',co.ravel());obj.data.update()
    for side in (-1,1):
        o=bpy.data.objects['AFTER_Body_Dark_Nostril'+str(side)]
        pts=np.empty((len(o.data.vertices),3),np.float32);o.data.vertices.foreach_get('co',pts.ravel())
        pts=(pts-center)*np.array([1.3,1.15,1.22])+center+np.array([0,-.011,0])
        o.data.vertices.foreach_set('co',pts.ravel())
        o.data.update()

def relax_tail():
    obj=bpy.data.objects['FULL_Body_Master_ContinuousHigh'];group=obj.vertex_groups.new(name='ReferenceTailRelax')
    ids=[v.index for v in obj.data.vertices if v.co.y>.205 and v.co.z<1.15]
    group.add(ids,1.,'REPLACE');bpy.context.view_layer.objects.active=obj
    mod=obj.modifiers.new('Relax remapped tail sections','SMOOTH');mod.factor=.65;mod.iterations=14;mod.vertex_group=group.name
    bpy.ops.object.modifier_apply(modifier=mod.name)
    obj.vertex_groups.remove(obj.vertex_groups['ReferenceTailRelax'])
    return {'smoothed_tail_vertices':len(ids)}
