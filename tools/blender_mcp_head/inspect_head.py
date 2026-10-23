"""Small geometry report only; these numbers do not constitute artistic acceptance."""
import bpy
import bmesh

def report():
    result = {'stage': bpy.context.scene.get('CATHEAD_stage', 'unknown'), 'objects': []}
    for name in ('BEFORE_Skin', 'AFTER_Skin'):
        obj = bpy.data.objects[name]
        bm = bmesh.new(); bm.from_mesh(obj.data)
        unseen = set(bm.verts); components = []
        while unseen:
            seed = unseen.pop(); stack = [seed]; count = 0
            while stack:
                vertex = stack.pop(); count += 1
                for edge in vertex.link_edges:
                    other = edge.other_vert(vertex)
                    if other in unseen: unseen.remove(other); stack.append(other)
            components.append(count)
        result['objects'].append({'name': name, 'vertices': len(bm.verts),
            'faces': len(bm.faces), 'connected_components': sorted(components, reverse=True),
            'non_manifold_edges': sum(not e.is_manifold for e in bm.edges),
            'bounds_min': [min(v.co[i] for v in bm.verts) for i in range(3)],
            'bounds_max': [max(v.co[i] for v in bm.verts) for i in range(3)]})
        bm.free()
    result['art_review'] = 'Pending actual front, profile, three-quarter, above and below images'
    return result
