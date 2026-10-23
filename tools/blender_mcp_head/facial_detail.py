"""Small mouth relief and soft tissue materials on the existing feline landmarks."""
import bpy
import bmesh
import sys
from extract_head import material
from mathutils import Vector
from mathutils.bvhtree import BVHTree


def seat_nostrils():
    nose=bpy.data.objects['AFTER_Body_Pink_Nose']
    tree=BVHTree.FromObject(nose,bpy.context.evaluated_depsgraph_get())
    for side in (-1,1):
        obj=bpy.data.objects['AFTER_Body_Dark_Nostril'+str(side)]
        center=sum((v.co for v in obj.data.vertices),Vector())/len(obj.data.vertices)
        hit=tree.ray_cast(Vector((side*.008,-.6,-.053)),Vector((0,1,0)))[0]
        if hit is None:raise RuntimeError('Nostril target misses refined nose')
        shift=hit+Vector((0,-.0002,0))-center
        for v in obj.data.vertices:v.co+=shift


def build():
    skin=bpy.data.objects['AFTER_Skin']
    bm=bmesh.new();bm.from_mesh(skin.data)
    edges=[e for e in bm.edges if all(abs(v.co.x)<.065 and -.12<v.co.z<-.06
           and v.co.y<-.12 for v in e.verts)]
    bmesh.ops.subdivide_edges(bm,edges=edges,cuts=1,use_grid_fill=True)
    bm.to_mesh(skin.data);bm.free()
    path='E:/dev-cache/catRobot-blender-mcp-20261023/skills/scenario-blender-sculpting/scripts'
    if path not in sys.path:sys.path.insert(0,path)
    import bx_sculpt as S
    sc=S.Sculptor(skin,symmetry_x=False,front_faces_only=True)
    sc.crease_line([(-.041,-.3,-.091),(-.021,-.3,-.100),(0,-.3,-.103),
                    (.021,-.3,-.100),(.041,-.3,-.091)],radius=.0045,depth=.0012,
                    pinch=.08,project=(0,1,0))
    sc.commit(remember_mask=False)
    nose=bpy.data.objects['AFTER_Body_Pink_Nose']
    bpy.context.view_layer.objects.active=nose
    bevel=nose.modifiers.new('Soft nose cartilage edge','BEVEL');bevel.width=.0008;bevel.segments=3
    bpy.ops.object.modifier_apply(modifier=bevel.name)
    for poly in nose.data.polygons:poly.use_smooth=True
    nm=material('REFINED_NoseLeather',(.32,.11,.085),.32)
    shader=next(n for n in nm.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    shader.inputs['Coat Weight'].default_value=.18
    noise=nm.node_tree.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=115
    bump=nm.node_tree.nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.17
    bump.inputs['Distance'].default_value=.00010
    nm.node_tree.links.new(noise.outputs['Fac'],bump.inputs['Height'])
    nm.node_tree.links.new(bump.outputs['Normal'],shader.inputs['Normal'])
    nose.data.materials.clear();nose.data.materials.append(nm)
    inner=material('REFINED_InnerEar',(.40,.23,.22),.72)
    for obj in bpy.data.collections['CATHEAD_After'].objects:
        if 'EarInner' in obj.name:obj.data.materials.clear();obj.data.materials.append(inner)
    seat_nostrils()
    return {'skin_vertices':len(skin.data.vertices),'nose_faces':len(nose.data.polygons),
            'mouth_extra_depth':.0012,'inner_material':inner.name}
