"""Same camera and light for actual all-material neutral clay comparison."""
import bpy
from pathlib import Path
from extract_head import material
import review_head

def render(output_dir, version, angle):
    target=Path(output_dir);target.mkdir(parents=True,exist_ok=True)
    clay=material('CATHEAD_UniformClay',(.40,.40,.40),.72)
    meshes={o.data.name:o.data for o in bpy.data.collections['CATHEAD_'+version].objects
            if o.type in {'MESH','CURVES','CURVE'}}
    original={name:list(mesh.materials) for name,mesh in meshes.items()}
    try:
        # EEVEE 4.5 did not apply ViewLayer.material_override in the actual render.
        for mesh in meshes.values():
            if not mesh.materials: mesh.materials.append(clay)
            else:
                for index in range(len(mesh.materials)): mesh.materials[index]=clay
        review_head.show(version);review_head.view(angle)
        bpy.context.scene.render.filepath=str(target/(version.lower()+'_'+angle+'.png'))
        bpy.ops.render.render(write_still=True)
        return bpy.context.scene.render.filepath
    finally:
        for name,mesh in meshes.items():
            if original[name]:
                for index,mat in enumerate(original[name]): mesh.materials[index]=mat
            else: mesh.materials.clear()
