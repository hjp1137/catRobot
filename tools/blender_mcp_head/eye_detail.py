"""Procedural teal cat irises on the existing spherical eye meshes (Blender 4.5)."""
import bpy
from orbit_geometry import eye_center


def _socket(sockets, identifier):
    return next(s for s in sockets if s.identifier == identifier)


def _feed(tree, value, socket):
    if isinstance(value, (int, float, tuple)):
        socket.default_value = value
    else:
        tree.links.new(value, socket)


def _node(tree, node_type, label):
    node = tree.nodes.new(node_type)
    node.label = label
    return node


def _math(tree, operation, left, right=0.0):
    node = _node(tree, 'ShaderNodeMath', operation)
    node.operation = operation
    _feed(tree, left, node.inputs[0])
    _feed(tree, right, node.inputs[1])
    return node.outputs[0]


def _combine(tree, x, y, z):
    node = _node(tree, 'ShaderNodeCombineXYZ', 'Eye texture coordinates')
    for socket, value in zip(node.inputs, (x, y, z)):
        _feed(tree, value, socket)
    return node.outputs[0]


def _ramp(tree, value, stops, label):
    node = _node(tree, 'ShaderNodeValToRGB', label)
    ramp = node.color_ramp
    for index, (position, color) in enumerate(stops):
        point = ramp.elements[index] if index < 2 else ramp.elements.new(position)
        point.position, point.color = position, color
    tree.links.new(value, node.inputs[0])
    return node.outputs[0]


def _mix(tree, factor, color1, color2, label):
    node = _node(tree, 'ShaderNodeMixRGB', label)
    for socket, value in zip(node.inputs, (factor, color1, color2)):
        _feed(tree, value, socket)
    return node.outputs[0]


def _material(name, color, roughness, coat):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.diffuse_color = color
    tree = mat.node_tree
    tree.nodes.clear()
    shader = _node(tree, 'ShaderNodeBsdfPrincipled', 'Wet eye surface')
    values = {'Base Color': color, 'Roughness': roughness, 'IOR': 1.38,
              'Specular IOR Level': 0.28, 'Coat Weight': coat,
              'Coat Roughness': 0.08, 'Coat IOR': 1.38}
    for identifier, value in values.items():
        _socket(shader.inputs, identifier).default_value = value
    output = _node(tree, 'ShaderNodeOutputMaterial', 'Eye surface output')
    tree.links.new(shader.outputs[0], _socket(output.inputs, 'Surface'))
    return mat, tree, shader


def _noise(tree, coordinates, label):
    node = _node(tree, 'ShaderNodeTexNoise', label)
    node.noise_dimensions = '3D'
    tree.links.new(coordinates, _socket(node.inputs, 'Vector'))
    for identifier, value in {'Scale': 1.0, 'Detail': 2.3,
                              'Roughness': 0.62, 'Distortion': 0.16}.items():
        _socket(node.inputs, identifier).default_value = value
    return _socket(node.outputs, 'Fac')


def _length(tree, x, z):
    return _math(tree, 'SQRT', _math(tree, 'ADD',
                 _math(tree, 'MULTIPLY', x, x), _math(tree, 'MULTIPLY', z, z)))


def _iris(side):
    mat, tree, shader = _material('CATHEAD_EyeDetail_Iris' + str(side),
                                 (0.018, 0.22, 0.18, 1), 0.27, 0.18)
    tex = _node(tree, 'ShaderNodeTexCoord', 'Existing eye object coordinates')
    origin = _node(tree, 'ShaderNodeVectorMath', 'Center on this eyeball')
    origin.operation = 'SUBTRACT'
    tree.links.new(_socket(tex.outputs, 'Object'), origin.inputs[0])
    origin.inputs[1].default_value = eye_center(side)
    xyz = _node(tree, 'ShaderNodeSeparateXYZ', 'Local eye axes')
    tree.links.new(origin.outputs[0], xyz.inputs[0])
    x, z = xyz.outputs[0], xyz.outputs[2]
    nx, nz = _math(tree, 'DIVIDE', x, 0.0475), _math(tree, 'DIVIDE', z, 0.0465)
    radius = _length(tree, nx, nz)
    safe_radius = _math(tree, 'MAXIMUM', radius, 0.0001)
    dx = _math(tree, 'DIVIDE', nx, safe_radius)
    dz = _math(tree, 'DIVIDE', nz, safe_radius)
    # A circular direction vector avoids the seam of atan2-based noise.
    coarse_coords = _combine(tree, _math(tree, 'MULTIPLY', dx, 21.0),
                             _math(tree, 'ADD', _math(tree, 'MULTIPLY', radius, 3.8), side * 0.37),
                             _math(tree, 'MULTIPLY', dz, 21.0))
    fine_coords = _combine(tree, _math(tree, 'MULTIPLY', dx, 54.0),
                           _math(tree, 'ADD', _math(tree, 'MULTIPLY', radius, 7.0), side * 0.61),
                           _math(tree, 'MULTIPLY', dz, 54.0))
    coarse = _noise(tree, coarse_coords, 'Long radial iris fibers')
    fine = _noise(tree, fine_coords, 'Fine irregular iris fibers')
    fibers = _math(tree, 'ADD', _math(tree, 'MULTIPLY', coarse, 0.68),
                   _math(tree, 'MULTIPLY', fine, 0.32))
    color = _ramp(tree, fibers, [
        (0.25, (0.013, 0.120, 0.100, 1)), (0.43, (0.018, 0.170, 0.145, 1)),
        (0.56, (0.022, 0.220, 0.180, 1)), (0.74, (0.037, 0.265, 0.215, 1)),
    ], 'Teal fiber color variation')
    edge = _ramp(tree, radius, [
        (0.0, (0, 0, 0, 1)), (0.79, (0, 0, 0, 1)),
        (0.88, (0.1, 0.1, 0.1, 1)), (0.96, (0.8, 0.8, 0.8, 1)),
        (1.0, (1, 1, 1, 1)),
    ], 'Soft dark outer iris margin')
    color = _mix(tree, edge, color, (0.003, 0.025, 0.023, 1), 'Limbal margin')
    slit_radius = _length(tree, _math(tree, 'DIVIDE', x, 0.0072),
                          _math(tree, 'DIVIDE', z, 0.0265))
    collar = _ramp(tree, _math(tree, 'MULTIPLY', slit_radius, 0.5), [
        (0.0, (1, 1, 1, 1)), (0.485, (1, 1, 1, 1)),
        (0.58, (0, 0, 0, 1)), (1.0, (0, 0, 0, 1)),
    ], 'Narrow soft margin around the vertical pupil')
    color = _mix(tree, collar, color, (0.002, 0.009, 0.008, 1), 'Pupil margin')
    tree.links.new(color, _socket(shader.inputs, 'Base Color'))
    bump = _node(tree, 'ShaderNodeBump', 'Microscopic iris relief')
    _socket(bump.inputs, 'Strength').default_value = 0.045
    _socket(bump.inputs, 'Distance').default_value = 0.000018
    tree.links.new(fibers, _socket(bump.inputs, 'Height'))
    tree.links.new(_socket(bump.outputs, 'Normal'), _socket(shader.inputs, 'Normal'))
    geometry = _node(tree, 'ShaderNodeNewGeometry', 'Smooth optical surface normal')
    tree.links.new(_socket(geometry.outputs, 'Normal'), _socket(shader.inputs, 'Coat Normal'))
    return mat


def apply():
    """Rebuild only these dedicated materials and assign the six existing eye meshes."""
    names = ('AFTER_TrueEyeball', 'AFTER_SphericalIris', 'AFTER_SphericalPupil')
    eyes = {side: [bpy.data.objects[prefix + str(side)] for prefix in names]
            for side in (-1, 1)}
    sclera = _material('CATHEAD_EyeDetail_Sclera',
                       (0.16, 0.22, 0.19, 1), 0.20, 0.38)[0]
    pupil = _material('CATHEAD_EyeDetail_Pupil',
                      (0.0015, 0.003, 0.0028, 1), 0.18, 0.05)[0]
    next(n for n in pupil.node_tree.nodes if n.type=='BSDF_PRINCIPLED').inputs['Specular IOR Level'].default_value=.14
    irises = {side: _iris(side) for side in (-1, 1)}
    for side, objects in eyes.items():
        for obj, mat in zip(objects, (sclera, irises[side], pupil)):
            obj.data.materials.clear()
            obj.data.materials.append(mat)
    return {'objects': [obj.name for objects in eyes.values() for obj in objects],
            'materials': [sclera.name, pupil.name] + [m.name for m in irises.values()],
            'iris_nodes': {side: len(mat.node_tree.nodes) for side, mat in irises.items()},
            'geometry_changed': False, 'external_textures': 0,
            'reflection': 'Existing lighting through Principled BSDF and smooth coat'}
