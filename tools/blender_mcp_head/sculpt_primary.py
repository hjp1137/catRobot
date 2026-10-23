"""Primary-form changes only; keeps the source cage and untouched before objects.

Uses Sculptor.move_feature and crease_line from Scenario Labs bx_sculpt (MIT).
The installed skill retains its original LICENSE and implementation; no Scenario MCP is used.
"""
import bpy
import sys

SKILL = 'E:/dev-cache/catRobot-blender-mcp-20261023/skills/scenario-blender-sculpting/scripts'

def build():
    if SKILL not in sys.path: sys.path.insert(0, SKILL)
    import bx_sculpt as S
    obj = bpy.data.objects['AFTER_Skin']
    sc = S.Sculptor(obj, symmetry_x=True, front_faces_only=True)
    # Wide cheek plane remains the largest facial width; the jaw tapers behind it.
    cheek = sc.on_surface((.144, -.3, -.046), view=(0, 1, 0))
    sc.move_feature(cheek, .080, translate=(.008, -.001, .003), blur=2)
    jaw = sc.on_surface((.110, -.3, -.112), view=(0, 1, 0))
    sc.move_feature(jaw, .079, translate=(-.015, .007, .004), blur=2)
    # Paired pads are frontal masses, rather than a flat cream-colored patch.
    pad = sc.on_surface((.040, -.3, -.078), view=(0, 1, 0))
    sc.move_feature(pad, .046, translate=(-.001, -.009, .002), blur=2)
    sc.symmetry_x = False
    lip = sc.on_surface((0, -.3, -.113), view=(0, 1, 0))
    sc.move_feature(lip, .039, translate=(0, -.004, .003), blur=2)
    sc.crease_line([(0, -.3, -.067), (0, -.3, -.078), (0, -.3, -.093)],
                   radius=.008, depth=.004, pinch=.2, project=(0, 1, 0))
    sc.crease_line([(-.043, -.3, -.090), (-.020, -.3, -.102),
                    (0, -.3, -.103), (.020, -.3, -.102), (.043, -.3, -.090)],
                   radius=.007, depth=.0028, pinch=.15, project=(0, 1, 0))
    sc.commit(remember_mask=False)
    obj['primary_form_edits'] = 'wide cheeks; tapering jaw; paired projecting pads; philtrum; lower lip'
    obj['algorithm_attribution'] = 'Scenario Labs bx_sculpt, MIT; local algorithm via actual Blender MCP'
    bpy.context.scene['CATHEAD_stage'] = 'primary_forms'
    return {'object': obj.name, 'vertices': len(obj.data.vertices), 'polygons': len(obj.data.polygons)}
