"""Relax the saved FULL body hands; coordinates are baked world-space metres.

The source axes come from feline_paws and its +/-1.06 radian Y pose.
Apply once to the source snapshot; head collections are intentionally excluded.
"""
import numpy as np


# PalmPad's measured centroid plus its authored offset from the palm origin.
PALM = np.array((.440137, .04678, .952836))
POSE = 1.06
DIGIT_U = np.array((-.0528, -.018, .018, .0516))
DIGIT_LENGTH = np.array((.057, .074, .078, .064))
SOURCE_Q = (0., .013 / .066, .028 / .066, .044 / .066, .057 / .066, 1.)
SOURCE_V = np.array((-.002, .003, .010, .021, .034, .041)) * 1.15


def _smooth(lo, hi, value):
    q = np.clip((value - lo) / (hi - lo), 0., 1.)
    return q * q * (3. - 2. * q)


def _local(co):
    dx, dz = np.abs(co[:, 0]) - PALM[0], co[:, 2] - PALM[2]
    c, s = np.cos(POSE), np.sin(POSE)
    return dx * c - dz * s, dx * s + dz * c, PALM[1] - co[:, 1]


def deform(co):
    """Return an independent Nx3 array; points outside the wrists/hands are exact copies."""
    co = np.asarray(co, dtype=np.float64)
    if co.ndim != 2 or co.shape[1] != 3:
        raise ValueError('Expected an Nx3 world-coordinate array')
    out = co.copy()
    t, u, v = _local(co)
    weight = _smooth(-.085, -.025, t) * (1. - _smooth(.145, .185, t))
    weight *= 1. - _smooth(.110, .200, np.abs(u))
    weight *= 1. - _smooth(.100, .180, np.abs(v))
    active = weight > 0.
    if not np.any(active):
        return out
    t, u, v, w = t[active], u[active], v[active], weight[active]
    # The short, lateral thumb is separate from the four longitudinal digits.
    thumb = _smooth(.055, .071, -u) * (1. - _smooth(.040, .065, t))
    finger = _smooth(.024, .054, t) * (1. - thumb)
    length = np.interp(u, DIGIT_U, DIGIT_LENGTH)
    q = np.clip((t - .027) / length, 0., 1.)
    old_v = np.interp(q, SOURCE_Q, SOURCE_V)
    # Unbend the authored paw centreline and replace it with a relaxed 37-degree arc.
    arc, bend = length * 1.38, .65
    target_t = .027 + arc * np.sin(bend * q) / bend
    target_t += (t - .027 - length * q) * 1.20
    target_v = SOURCE_V[0] + arc * (1. - np.cos(bend * q)) / bend
    target_v += (v - old_v) * .78
    # Smooth centre assignment thins fingers without discontinuities between digits.
    proximity = np.exp(-((u[:, None] - DIGIT_U) / .013) ** 2)
    centre = (proximity @ DIGIT_U) / proximity.sum(axis=1)
    shaped_t = t + finger * (target_t - t) + .008 * thumb
    shaped_u = (u + .25 * finger * (centre - u)) * .84 + .006 * thumb
    shaped_v = (v + finger * (target_v - v)) * .88 + .008 * thumb
    t += w * (shaped_t - t)
    u += w * (shaped_u - u)
    v += w * (shaped_v - v)
    # Rotate the palmar normal towards the torso, then let the hand hang straighter.
    twist = 1.20 * w
    across = u * np.cos(twist) - v * np.sin(twist)
    palmar = u * np.sin(twist) + v * np.cos(twist)
    angle = np.pi / 2. - POSE - .27 * w
    wrist_t = -.070
    px = PALM[0] + wrist_t * np.cos(POSE)
    pz = PALM[2] - wrist_t * np.sin(POSE)
    sign = np.where(co[active, 0] < 0., -1., 1.)
    out[active, 0] = sign * (px + (t - wrist_t) * np.sin(angle) + across * np.cos(angle))
    out[active, 1] = PALM[1] - palmar
    out[active, 2] = pz - (t - wrist_t) * np.cos(angle) + across * np.sin(angle)
    return out


def deform_accessory(co, name):
    """Shorten exposed hand claws at their proximal root before the common field."""
    co = np.asarray(co, dtype=np.float64)
    if name.startswith(('FULL_Body_Master_Claw_', 'FULL_Body_Master_ThumbClaw_')) and len(co):
        t = _local(co)[0]
        root = co[t <= t.min() + .15 * np.ptp(t)].mean(axis=0)
        co = root + .48 * (co - root)
    return deform(co)


def apply():
    """Update only FULL_After direct meshes; preflight transforms before any mutation."""
    import bpy

    meshes = [obj for obj in bpy.data.collections['FULL_After'].objects if obj.type == 'MESH']
    for obj in meshes:
        if not np.allclose(np.array(obj.matrix_world), np.eye(4), atol=1e-7, rtol=0.):
            raise ValueError('Expected baked identity transform: ' + obj.name)
    report = []
    for obj in meshes:
        co = np.empty((len(obj.data.vertices), 3), dtype=np.float32)
        obj.data.vertices.foreach_get('co', co.ravel())
        changed = deform_accessory(co, obj.name)
        distance = np.linalg.norm(changed - co, axis=1)
        if np.any(distance > 0.):
            obj.data.vertices.foreach_set('co', changed.astype(np.float32).ravel())
            obj.data.update()
        report.append({'object': obj.name, 'moved_vertices': int(np.sum(distance > 1e-6)),
                       'max_displacement_m': float(distance.max()) if len(distance) else 0.})
    return report
