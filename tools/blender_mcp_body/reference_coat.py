"""Screenshot-guided silver tabby colors; meters, front=-Y, up=Z.

body_colors uses authored body coordinates; head_colors uses AFTER_Skin local
coordinates. Both return scene-linear float32 RGBA. apply() only updates the
two After skin meshes' color attributes/materials; it never smooths geometry.
"""
import numpy as np


def _smooth(value):
    t = np.clip(value, 0., 1.)
    return t * t * (3. - 2. * t)


def _points(co):
    co = np.asarray(co, dtype=np.float64)
    if co.ndim != 2 or co.shape[1] != 3:
        raise ValueError('Expected an Nx3 coordinate array')
    return co


def _linear(srgb):
    rgb = np.asarray(srgb, dtype=np.float64)
    return np.where(rgb <= .04045, rgb / 12.92, ((rgb + .055) / 1.055) ** 2.4)


BASE = _linear((.62, .60, .59))
WHITE = _linear((.84, .83, .81))
STRIPE = _linear((.29, .27, .28))


def _grain(x, y, z):
    # Long fibers turn towards the centerline to give the bib its V-shaped flow.
    across = np.abs(x) - .31 * z
    fiber = np.sin(across * 3300. + .8 * np.sin(z * 170. + y * 110.))
    return .018 * fiber + .009 * np.sin(x * 1371. + y * 987. + z * 791.)


def _strokes(x, z, strokes):
    """Tapered, slightly bent strokes with frayed edges, never broad sine bands."""
    u = np.abs(x)
    result = np.zeros(len(x))
    for index, (ax, az, bx, bz, width) in enumerate(strokes):
        dx, dz = bx - ax, bz - az
        length = np.hypot(dx, dz)
        t = ((u - ax) * dx + (z - az) * dz) / (length * length)
        tc = np.clip(t, 0., 1.)
        bend = width * .18 * np.sin(tc * 5.2 + index * 1.7 + np.sign(x) * .3)
        distance = np.abs(((u - ax) * dz - (z - az) * dx) / length + bend)
        distance += np.maximum(-t, t - 1.).clip(0.) * length
        taper = .36 + .64 * np.sin(np.pi * tc) ** .5
        fray = width * (.08 * np.sin(x * 1450. + z * 413.)
                        + .06 * np.sin(x * 703. - z * 957. + index))
        edge = _smooth((width * taper - distance + fray) / (width * .30))
        gaps = .87 + .13 * _smooth((np.sin(tc * 24. + index * 2.1) + .5) / .8)
        result = np.maximum(result, edge * gaps)
    return result


def _finish(co, pale, stripes, shade=1.):
    color = BASE[None, :] * (1. - pale[:, None]) + WHITE * pale[:, None]
    strength = stripes * (1. - pale * .93)
    color = color * (1. - strength[:, None]) + STRIPE * strength[:, None]
    color *= (np.asarray(shade) + _grain(*co.T))[:, None]
    return np.column_stack((np.clip(color, 0., 1.), np.ones(len(co)))).astype('float32')


BODY_STROKES = (
    # Shoulder chevrons fork towards the neck and follow the deltoid down.
    (.075, 1.48, .255, 1.37, .026), (.190, 1.405, .295, 1.31, .024),
    (.130, 1.355, .275, 1.29, .022), (.245, 1.325, .315, 1.245, .023),
    # Shorter inward branches break up the long flank strokes.
    (.105, 1.215, .242, 1.285, .023), (.185, 1.245, .225, 1.20, .015),
    (.090, 1.100, .220, 1.175, .023), (.165, 1.145, .220, 1.105, .015),
    (.080, .985, .205, 1.065, .022), (.100, .875, .230, .965, .026),
    # Upper and lower arms: opposing diagonal edges, with broad colored cores.
    (.225, 1.265, .335, 1.195, .028), (.255, 1.165, .365, 1.115, .024),
    (.290, 1.080, .390, 1.025, .028), (.335, .985, .425, .945, .026),
    (.345, .925, .415, .980, .017), (.375, .885, .450, .845, .023),
    (.400, .805, .470, .790, .016),
    # Thighs and calves cross the actual leg center, rather than the outer edge.
    (.035, .860, .225, .940, .027), (.065, .825, .235, .850, .023),
    (.035, .730, .225, .815, .028), (.065, .685, .205, .735, .025),
    (.065, .620, .215, .680, .026), (.035, .545, .190, .585, .025),
    (.050, .485, .185, .530, .023), (.065, .445, .175, .410, .022),
    (.040, .350, .180, .400, .025), (.055, .285, .180, .330, .021),
    (.070, .220, .165, .255, .016),
)


def _tail_colors(co):
    # This is the existing authored tail centerline, not a mesh raycast.
    from reference_shape import NEW_TAIL
    path = NEW_TAIL
    delta = np.diff(path, axis=0)
    lengths = np.linalg.norm(delta, axis=1)
    t = np.clip(np.einsum('nsi,si->ns', co[:, None, :] - path[:-1], delta)
                / (lengths * lengths), 0., 1.)
    near = path[:-1] + t[:, :, None] * delta
    segment = np.argmin(np.sum((co[:, None, :] - near) ** 2, axis=2), axis=1)
    row = np.arange(len(co))
    along = np.r_[0., np.cumsum(lengths)][segment] + t[row, segment] * lengths[segment]
    x, y, z = co.T
    phase = along * 84. + .55 * np.sin(along * 23.)
    edge = .14 * np.sin(x * 693. + z * 479.) + .10 * np.sin(y * 971. - z * 167.)
    stripe = _smooth((np.cos(phase) - .20 + edge) / .42) * .98
    pale = _smooth((along / lengths.sum() - .85) / .10)
    return pale, stripe


def body_colors(co):
    """Return body-local Nx3 positions as linear RGBA, including the curved tail."""
    co = _points(co)
    x, y, z = co.T
    ax = np.abs(x)
    front = _smooth((-y - .005) / .10)
    fray = .0025 * np.sin(x * 931. + z * 413.)
    bib_width = .072 + .085 * _smooth((z - 1.01) / .34)
    bib = _smooth((bib_width - ax + fray) / .040) * _smooth((z - .64) / .12) * front
    neck = _smooth((z - 1.37) / .12) * _smooth((.14 - ax) / .045) * front
    paw = _smooth((.21 - z) / .11)
    palm = _smooth((ax - .405) / .05) * _smooth((.83 - z) / .10) * front
    pale = np.maximum.reduce((bib, neck, paw * .94, palm * .88))
    stripes = _strokes(x, z, BODY_STROKES) * (.84 + .12 * front)
    back = _smooth((y - .025) / .10) * _smooth((.25 - ax) / .08)
    back_strokes = [(0., a, .23, b, w) for a, b, w in (
        (1.43, 1.35, .025), (1.30, 1.25, .021), (1.17, 1.10, .026),
        (1.04, .995, .022), (.92, .855, .025), (.80, .755, .023))]
    stripes = np.maximum(stripes * (1. - back * .65), _strokes(x, z, back_strokes) * back)
    tail = (y > .18) & (z < 1.14)
    if tail.any():
        pale[tail], stripes[tail] = _tail_colors(co[tail])
    return _finish(co, pale, stripes)


HEAD_STROKES = (
    (.013, .180, .023, .078, .010), (.046, .175, .034, .095, .012),
    (.078, .163, .061, .087, .011), (.106, .143, .112, .075, .009),
    (.116, .113, .155, .067, .010), (.135, .046, .203, .073, .015),
    (.138, .009, .205, .027, .016), (.142, -.027, .199, -.009, .013),
    (.125, -.052, .184, -.045, .010),
)


def head_colors(co):
    """Return AFTER_Skin local coordinates as linear RGBA; do not pass world Z."""
    co = _points(co)
    x, y, z = co.T
    hx = x / 1.13  # The reference silhouette widened the head, including its markings.
    ax = np.abs(hx)
    front = _smooth((-y - .015) / .09)
    boundary = -.013 - .17 * ax + .002 * np.sin(x * 751. + z * 237.)
    muzzle = _smooth((boundary - z) / .032) * front
    blaze = np.exp(-(hx / .028) ** 2) * _smooth((.115 - z) / .10) * front
    pale = np.maximum(muzzle, blaze * .92)
    stripes = _strokes(hx, z, HEAD_STROKES) * front
    back = _smooth((y + .015) / .08)
    rear = _strokes(hx, z, ((.008, .18, .19, .09, .022),
                           (.010, .090, .20, .015, .019),
                           (.015, .005, .19, -.055, .021),
                           (.012, -.075, .16, -.105, .016)))
    stripes = np.maximum(stripes, rear * back * .98)
    rgba = _finish(co, pale, stripes, .96 + .04 * pale)
    # Skin-side lid ink is sized to the new opening; the eyeball stays untouched.
    angle = np.radians(11.5)
    dx, dz = np.abs(x) - .0938, z - .029
    u = dx * np.cos(angle) + dz * np.sin(angle)
    v = -dx * np.sin(angle) + dz * np.cos(angle)
    radius = np.sqrt((u / .0678) ** 2 + (v / np.where(v > 0., .050, .042)) ** 2)
    top = _smooth((v + .010) / .025)
    lid = np.exp(-((radius - 1.025) / .085) ** 2) * (.60 + .33 * top)
    shadow = np.exp(-((radius - 1.14) / .18) ** 2) * top * .32
    eye_ink = np.maximum(lid, shadow) * front
    rgba[:, :3] = rgba[:, :3] * (1. - eye_ink[:, None]) + _linear((.17, .15, .155)) * eye_ink[:, None]
    mouth_z = -.103 + .014 * (hx / .043) ** 2
    mouth = np.exp(-((z - mouth_z) / .0019) ** 2) * _smooth((.043 - ax) / .008)
    philtrum = np.exp(-(hx / .0017) ** 2) * _smooth((-.063 - z) / .007) * _smooth((z + .105) / .005)
    line = np.maximum(mouth, philtrum) * front * .53
    rgba[:, :3] = rgba[:, :3] * (1. - line[:, None]) + _linear((.36, .28, .27)) * line[:, None]
    return rgba


def _material(bpy, name):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    # Keep references to nodes created by type; UI node names may be translated.
    shader = nt.nodes.new('ShaderNodeBsdfPrincipled')
    output = nt.nodes.new('ShaderNodeOutputMaterial')
    attribute = nt.nodes.new('ShaderNodeAttribute')
    attribute.attribute_name = 'CoatColor'
    nt.links.new(attribute.outputs['Color'], shader.inputs['Base Color'])
    shader.inputs['Roughness'].default_value = .81
    shader.inputs['Specular IOR Level'].default_value = .20
    shader.inputs['Sheen Weight'].default_value = .24
    coords = nt.nodes.new('ShaderNodeTexCoord')
    split = nt.nodes.new('ShaderNodeSeparateXYZ')
    nt.links.new(coords.outputs['Object'], split.inputs['Vector'])
    absolute = nt.nodes.new('ShaderNodeMath')
    absolute.operation = 'ABSOLUTE'
    nt.links.new(split.outputs['X'], absolute.inputs[0])
    slope = nt.nodes.new('ShaderNodeMath')
    slope.operation = 'MULTIPLY'
    slope.inputs[1].default_value = -.31
    nt.links.new(split.outputs['Z'], slope.inputs[0])
    flow = nt.nodes.new('ShaderNodeMath')
    flow.operation = 'ADD'
    nt.links.new(absolute.outputs[0], flow.inputs[0])
    nt.links.new(slope.outputs[0], flow.inputs[1])
    combine = nt.nodes.new('ShaderNodeCombineXYZ')
    nt.links.new(flow.outputs[0], combine.inputs['X'])
    nt.links.new(split.outputs['Y'], combine.inputs['Y'])
    nt.links.new(split.outputs['Z'], combine.inputs['Z'])
    stretch = nt.nodes.new('ShaderNodeVectorMath')
    stretch.operation = 'MULTIPLY'
    stretch.inputs[1].default_value = (1550., 1550., 95.)
    nt.links.new(combine.outputs['Vector'], stretch.inputs[0])
    noise = nt.nodes.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = 1.
    noise.inputs['Detail'].default_value = 2.
    noise.inputs['Roughness'].default_value = .65
    nt.links.new(stretch.outputs['Vector'], noise.inputs['Vector'])
    bump = nt.nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = .16
    bump.inputs['Distance'].default_value = .00024
    nt.links.new(noise.outputs['Fac'], bump.inputs['Height'])
    nt.links.new(bump.outputs['Normal'], shader.inputs['Normal'])
    nt.links.new(shader.outputs['BSDF'], output.inputs['Surface'])
    mat.diffuse_color = (*BASE, 1.)
    return mat


def apply():
    """Paint only After head/body skin; preserve vertex positions and modifiers.

    Existing hair is unchanged. Rebuild body hair with
    ``groom.colors = body_colors``; a head hair callback must convert its world
    roots to AFTER_Skin local coordinates before calling head_colors.
    """
    import bpy
    prepared = []
    targets = (('AFTER_Skin', head_colors, 'TRIPO_REF_Head_Coat'),
               ('FULL_Body_Master_ContinuousHigh', body_colors, 'TRIPO_REF_Body_Coat'))
    for name, color_fn, material_name in targets:
        obj = bpy.data.objects[name]
        if obj.type != 'MESH':
            raise TypeError(f'{name} must be a mesh')
        mesh = obj.data
        attr = mesh.color_attributes.get('CoatColor')
        if attr is not None and (attr.domain != 'POINT' or attr.data_type != 'FLOAT_COLOR'):
            raise ValueError(f'{name}: CoatColor must be a POINT FLOAT_COLOR attribute')
        co = np.empty((len(mesh.vertices), 3), dtype='float32')
        mesh.vertices.foreach_get('co', co.ravel())
        prepared.append((obj, color_fn(co), material_name))
    report = []
    for obj, rgba, material_name in prepared:
        # Material slots and attributes live on the mesh; preserve any shared Before.
        if obj.data.users > 1:
            obj.data = obj.data.copy()
        mesh = obj.data
        attr = mesh.color_attributes.get('CoatColor')
        if attr is None:
            attr = mesh.color_attributes.new('CoatColor', 'FLOAT_COLOR', 'POINT')
        attr.data.foreach_set('color', rgba.ravel())
        mat = _material(bpy, material_name)
        mesh.materials.clear()
        mesh.materials.append(mat)
        obj.update_tag()
        report.append({'object': obj.name, 'color_points': len(rgba), 'material': mat.name})
    return {'surfaces': report, 'color_attribute': 'CoatColor', 'texture_files': 0,
            'geometry_operations': 0, 'hair_recolored': False}
