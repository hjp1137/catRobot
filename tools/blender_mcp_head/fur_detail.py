"""Static, editable native Hair Curves for the isolated Blender 4.5 head study.

API: docs.blender.org/api/4.5/bpy.types.Curves.html and Attribute.html.
Groom guidance: Scenario Labs scenario-blender-hair (MIT), reviewed only.
No downloaded textures, paid service, skin edits, operators, or UV dependency.
"""
import bpy
import numpy as np
from mathutils import Vector


def _unit(v):
    return v / np.maximum(np.linalg.norm(v, axis=-1, keepdims=True), 1e-12)


def _face_mask(p, nose_bounds):
    """Keep fur off actual eye openings, the nose cover, and painted mouth lines."""
    x, y, z = p.T
    front = y < -.060
    keep = np.ones(len(p), dtype=bool)
    for side in (-1, 1):
        a = np.radians(side * 11.5)
        dx, dz = x - side * .083, z - .029
        u, v = dx * np.cos(a) + dz * np.sin(a), -dx * np.sin(a) + dz * np.cos(a)
        eye = (u / .059) ** 2 + (v / np.where(v > 0, .039, .032)) ** 2
        keep &= ~(front & (eye < 1))
    lo, hi = nose_bounds
    nose = (x > lo[0] - .002) & (x < hi[0] + .002)
    nose &= (z > lo[2] - .002) & (z < hi[2] + .002) & (y < hi[1] + .006)
    mouth_z = -.103 + .014 * (x / .043) ** 2
    mouth = (np.abs(x) < .047) & (np.abs(z - mouth_z) < .004)
    philtrum = (np.abs(x) < .0035) & (z > -.105) & (z < -.061)
    return keep & ~nose & ~(front & (mouth | philtrum))


def _sample(surface, count, rng, nose_bounds, ear=False):
    evaluated = surface.evaluated_get(bpy.context.evaluated_depsgraph_get())
    me = evaluated.to_mesh()
    try:
        me.calc_loop_triangles()
        tri = np.empty(len(me.loop_triangles) * 3, np.int32)
        co = np.empty(len(me.vertices) * 3, np.float32)
        no = np.empty_like(co)
        me.loop_triangles.foreach_get('vertices', tri)
        me.vertices.foreach_get('co', co)
        me.vertex_normals.foreach_get('vector', no)
        tri, co, no = tri.reshape(-1, 3), co.reshape(-1, 3), no.reshape(-1, 3)
        matrix = np.asarray(surface.matrix_world, dtype=float)
        co = co @ matrix[:3, :3].T + matrix[:3, 3]
        no = _unit(no @ np.linalg.inv(matrix[:3, :3]))
        faces = co[tri]
        areas = np.linalg.norm(np.cross(faces[:, 1] - faces[:, 0],
                                       faces[:, 2] - faces[:, 0]), axis=1)
        indices = rng.choice(len(tri), count * 4, p=areas / areas.sum())
        s, r = np.sqrt(rng.random(len(indices))), rng.random(len(indices))
        bary = np.column_stack((1 - s, s * (1 - r), s * r))
        roots = np.einsum('ni,nij->nj', bary, faces[indices])
        normals = _unit(np.einsum('ni,nij->nj', bary, no[tri[indices]]))
        keep = normals[:, 1] < -.12 if ear else _face_mask(roots, nose_bounds)
        roots, normals = roots[keep][:count], normals[keep][:count]
        if len(roots) < count:
            raise RuntimeError(f'{surface.name}: only {len(roots)} valid roots for {count}')
        return roots, normals
    finally:
        evaluated.to_mesh_clear()


def _flow(roots, normals, ear):
    x, y, z = roots.T
    side = np.sign(x)
    front = np.clip((-y - .015) / .10, 0, 1)
    desired = np.column_stack((side * .25, np.ones(len(x)), -.45 * np.ones(len(x))))
    facial = np.column_stack((side * .85, .20 * np.ones(len(x)), -.23 * np.ones(len(x))))
    brow = z > .065
    facial[brow] = np.column_stack((side[brow] * .42, .35 * np.ones(brow.sum()),
                                   .85 * np.ones(brow.sum())))
    chin = z < -.095
    facial[chin, 2] = -.85
    desired = desired * (1 - front[:, None]) + facial * front[:, None]
    auricle = z > .175
    desired[auricle] = np.column_stack((side[auricle] * .20,
                                       .20 * np.ones(auricle.sum()), np.ones(auricle.sum())))
    if ear:
        desired = np.column_stack((side * .16, .08 * np.ones(len(x)), np.ones(len(x))))
    tangent = desired - (desired * normals).sum(axis=1)[:, None] * normals
    singular = np.linalg.norm(tangent, axis=1) < 1e-7
    tangent[singular] = np.cross(normals[singular], (1, 0, 0))
    return _unit(tangent)


def _strands(roots, normals, rng, ear):
    tangent = _flow(roots, normals, ear)
    across = _unit(np.cross(normals, tangent))
    angle = rng.normal(0, .12, len(roots))
    tangent = tangent * np.cos(angle[:, None]) + across * np.sin(angle[:, None])
    front = np.clip((-roots[:, 1] - .025) / .08, 0, 1)
    length = (.0048 - front * .0017) * rng.uniform(.78, 1.20, len(roots))
    if ear:
        length = rng.uniform(.0028, .0052, len(roots))
    length = np.clip(length, .002, .006)
    t = np.linspace(0, 1, 5)[None, :, None]
    lift = .60 * t - .26 * t * t
    sweep = .45 * t + .50 * t * t
    position = roots[:, None, :] + normals[:, None, :] * .00003
    position = position + length[:, None, None] * (
        normals[:, None, :] * lift + tangent[:, None, :] * sweep)
    # Mostly quiet strands; a small per-curve variation avoids a brushed-plastic pattern.
    stray = (rng.random(len(roots)) < .12) * rng.uniform(-.045, .045, len(roots))
    position += across[:, None, :] * (length * stray)[:, None, None] * np.sin(t * np.pi)
    root_radius = rng.uniform(.000055, .000080, len(roots)) * (.67 if ear else 1)
    radii = root_radius[:, None] * (1 - t[0, :, 0]) ** .7 + .000003
    return position, radii


def _material():
    name = 'AFTER_CatHead_Fur_Material'
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name)
        mat['cathead_fur_owned'] = True
    elif not mat.get('cathead_fur_owned'):
        raise RuntimeError(f'Refusing to replace unowned material {name}')
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    shader = nt.nodes.new('ShaderNodeBsdfPrincipled')
    shader.inputs['Roughness'].default_value = .83
    shader.inputs['Specular IOR Level'].default_value = .20
    shader.inputs['Sheen Weight'].default_value = .14
    color = nt.nodes.new('ShaderNodeAttribute')
    color.attribute_name = 'CoatColor'
    nt.links.new(color.outputs['Color'], shader.inputs['Base Color'])
    nt.links.new(shader.outputs['BSDF'], out.inputs['Surface'])
    return mat


def _write(name, surface, positions, radii, colors, mat, collection='CATHEAD_After'):
    obj = bpy.data.objects.get(name)
    if obj is not None and not obj.get('cathead_fur_owned'):
        raise RuntimeError(f'Refusing to replace unowned object {name}')
    data = bpy.data.hair_curves.new(name + '_Curves')
    data.add_curves([positions.shape[1]] * len(positions))
    data.set_types(type='CATMULL_ROM')
    data.attributes['position'].data.foreach_set('vector', positions.astype('float32').ravel())
    radius = data.attributes.new('radius', 'FLOAT', 'POINT')
    radius.data.foreach_set('value', radii.astype('float32').ravel())
    color = data.attributes.new('CoatColor', 'FLOAT_COLOR', 'POINT')
    color.data.foreach_set('color', np.repeat(colors, positions.shape[1], axis=0).ravel())
    data.surface = surface
    data.materials.append(mat)
    if obj is None:
        obj = bpy.data.objects.new(name, data)
        bpy.data.collections[collection].objects.link(obj)
    else:
        previous = obj.data
        obj.data = data
        if previous.users == 0:
            bpy.data.hair_curves.remove(previous)
    obj['cathead_fur_owned'] = True
    obj['groom'] = 'Static surface-sampled short fur; no UV or deformation binding'
    obj['strand_count'] = len(positions)
    obj['control_points_per_strand'] = positions.shape[1]
    obj['radius_m'] = [float(radii.min()), float(radii.max())]
    obj.update_tag()
    return obj


def build(color_fn=None, coat_count=24000, ear_count=1200, seed=23023):
    """Build only AFTER fur. color_fn receives world/model-space Nx3 root positions.

    ear_count is the combined count of both ears. The seed makes reruns comparable.
    Returns actual curve counts and measured strand lengths; does not save or render.
    """
    if color_fn is None:
        from coat_detail import coat_colors
        color_fn = coat_colors
    skin = bpy.data.objects['AFTER_Skin']
    nose = bpy.data.objects['AFTER_Body_Pink_Nose']
    bounds = np.array([nose.matrix_world @ Vector(c) for c in nose.bound_box])
    nose_bounds = (bounds.min(axis=0), bounds.max(axis=0))
    rng = np.random.default_rng(seed)
    ears = sorted((o for o in bpy.data.collections['CATHEAD_After'].objects
                   if o.name.startswith('AFTER_Body_Master_EarInner') and o.type == 'MESH'),
                  key=lambda o: o.name)
    if len(ears) != 2:
        raise RuntimeError(f'Expected two inner-ear surfaces, found {len(ears)}')
    regions = [('AFTER_Fur_Coat', skin, int(coat_count), False)]
    regions += [(f'AFTER_Fur_EarInner_{i}', o, int(ear_count) // 2, True)
                for i, o in enumerate(ears)]
    prepared, report = [], []
    for name, surface, count, ear in regions:
        roots, normals = _sample(surface, count, rng, nose_bounds, ear)
        positions, radii = _strands(roots, normals, rng, ear)
        valid = np.ones(count, dtype=bool) if ear else np.all(
            _face_mask(positions.reshape(-1, 3), nose_bounds).reshape(count, -1), axis=1)
        roots, positions, radii = roots[valid], positions[valid], radii[valid]
        colors = np.asarray(color_fn(roots), dtype='float32')
        prepared.append((name, surface, positions, radii, colors))
        lengths = np.linalg.norm(np.diff(positions, axis=1), axis=2).sum(axis=1)
        report.append({'name': name, 'strands': len(positions), 'points': positions.shape[1],
                       'length_m': [float(lengths.min()), float(lengths.max())],
                       'tip_clearance_rejected': int(count - valid.sum())})
    mat = _material()
    for args in prepared:
        _write(*args, mat)
    bpy.context.scene.render.hair_type = 'STRIP'
    bpy.context.scene.render.hair_subdiv = 1
    bpy.context.view_layer.update()
    return {'native_curves': report, 'total_strands': sum(r['strands'] for r in report),
            'material': mat.name, 'color_attribute': 'CoatColor',
            'attachment': 'Static surface roots; no UV deformation binding', 'seed': seed}
