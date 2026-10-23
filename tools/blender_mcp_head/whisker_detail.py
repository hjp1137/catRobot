"""Six gently curved, tapered native whiskers, rooted at the existing face contacts."""
import bpy
from mathutils import Vector
from extract_head import material


def build():
    col=bpy.data.collections['CATHEAD_After']
    mat=material('REFINED_Whiskers',(.63,.61,.55),.58)
    names=[]
    for old in list(col.objects):
        if not old.name.startswith('AFTER_Body_Whisker'):continue
        vs=[v.co for v in old.data.vertices];nearest=min(abs(v.x) for v in vs)
        root=sum((v for v in vs if abs(v.x)<nearest+.002),Vector())/sum(abs(v.x)<nearest+.002 for v in vs)
        tip=max(vs,key=lambda v:abs(v.x)).copy()
        curve=bpy.data.curves.new('REFINED_'+old.name,'CURVE')
        curve.dimensions='3D';curve.resolution_u=16;curve.bevel_depth=.00032;curve.bevel_resolution=2
        spline=curve.splines.new('BEZIER');spline.bezier_points.add(3)
        for i,p in enumerate(spline.bezier_points):
            t=i/3;p.co=root.lerp(tip,t)+Vector((0,-.008*4*t*(1-t),.003*4*t*(1-t)))
            p.handle_left_type=p.handle_right_type='AUTO';p.radius=max(.035,(1-t)**.7)
        obj=bpy.data.objects.new('AFTER_CurvedWhisker_'+old.name.split('Whisker')[-1],curve)
        col.objects.link(obj);curve.materials.append(mat);names.append(obj.name)
        old.hide_render=True;old.hide_set(True)
    return {'curved_whiskers':names}
