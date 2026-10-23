"""Editable supported control surfaces for the astral benchmark, offline only."""
import bpy
from mathutils import Vector
from geometry import mesh


def _collection(name):
    coll=bpy.data.collections.get(name)
    if coll is None:
        coll=bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(coll)
    return coll


def source(obj,kind):
    obj['source_only']=True
    obj['astral_source_kind']=kind
    obj.hide_render=True
    obj.hide_set(True)
    coll=_collection('Astral_'+kind+'_Source')
    for old in list(obj.users_collection): old.objects.unlink(obj)
    coll.objects.link(obj)
    return obj


def _copy(obj,name):
    out=obj.copy()
    out.data=obj.data.copy()
    out.name=name
    bpy.context.scene.collection.objects.link(out)
    out.hide_set(False)
    out.hide_render=False
    return out


def _finish(obj,level,thickness,bevel):
    bpy.context.view_layer.objects.active=obj
    for kind,name,value in [('SUBSURF','Sculpted cage limit surface',level),
                            ('SOLIDIFY','Real inward armor wall',thickness),
                            ('BEVEL','Machined edge radius',bevel)]:
        if not value: continue
        mod=obj.modifiers.new(name,kind)
        if kind=='SUBSURF': mod.levels,mod.render_levels=value,value
        if kind=='SOLIDIFY': mod.thickness,mod.offset=value,-1
        if kind=='BEVEL': mod.width,mod.segments=value,3
        bpy.ops.object.modifier_apply(modifier=mod.name)
    obj.data.update()
    return obj


def cage(name,rows,mat,bone,wall=.008,bevel=.0016,extras=None,reverse=False):
    """Quads, shoulder/chest relief rows, and explicit tight boundary support loops."""
    rows=[[Vector(p) for p in row] for row in rows]
    rows=[rows[0],[a.lerp(b,.065) for a,b in zip(rows[0],rows[1])]]+rows[1:-1]+[
          [a.lerp(b,.935) for a,b in zip(rows[-2],rows[-1])],rows[-1]]
    rows=[[r[0],r[0].lerp(r[1],.065)]+r[1:-1]+[r[-2].lerp(r[-1],.935),r[-1]] for r in rows]
    width=len(rows[0])
    faces=[(i*width+j,i*width+j+1,(i+1)*width+j+1,(i+1)*width+j)
           for i in range(len(rows)-1) for j in range(width-1)]
    if reverse: faces=[tuple(reversed(f)) for f in faces]
    control=mesh('Source_astral_Cage_'+name,[p for row in rows for p in row],faces,mat,bone,
                 smooth=True,extras=extras)
    control['cage_rows'],control['cage_columns']=len(rows),width
    control['sculpt_method']='authored quad control cage with boundary support loops'
    low=_copy(control,name)
    low['astral_bake_low']=True
    _finish(low,1,wall,bevel)
    high=_copy(control,'Source_astral_High_'+name)
    high['bake_target']=name
    _finish(high,3,wall,bevel*.72)
    source(high,'High')
    mod=control.modifiers.new('Editable limit surface preview','SUBSURF')
    mod.levels,mod.render_levels=2,3
    source(control,'Cage')
    return low


def patch(name,outline,relief,mat,bone,wall=.008,extras=None):
    """Contour-controlled curved panel with radial support rings, not a flat ngon."""
    points=[Vector(p) for p in outline]
    center=sum(points,Vector())/len(points)
    verts=[center+Vector(relief)]
    for t in [.26,.62,.88,.975,1.0]:
        verts += [center.lerp(p,t)+Vector(relief)*(1-t*t) for p in points]
    n=len(points)
    faces=[(0,1+j,1+(j+1)%n) for j in range(n)]
    for ring in range(4):
        faces += [(1+ring*n+j,1+ring*n+(j+1)%n,
                   1+(ring+1)*n+(j+1)%n,1+(ring+1)*n+j) for j in range(n)]
    control=mesh('Source_astral_Cage_'+name,verts,faces,mat,bone,smooth=True,extras=extras)
    low=_copy(control,name)
    low['astral_bake_low']=True
    _finish(low,1,wall,.0018)
    high=_copy(control,'Source_astral_High_'+name)
    high['bake_target']=name
    _finish(high,3,wall,.0011)
    source(high,'High')
    mod=control.modifiers.new('Editable contour support rings','SUBSURF')
    mod.levels,mod.render_levels=2,3
    control['sculpt_method']='authored silhouette contour and five relief support rings'
    source(control,'Cage')
    return low


def limb_grid(name,a,b,profiles,angles,mat,bone,shift=(0,0,0),wall=.007):
    """Artist-set axial widths and polygonal cross sections; each row is editable."""
    import math
    a,b,shift=Vector(a),Vector(b),Vector(shift)
    axis=(b-a).normalized()
    front=Vector((0,0,1))
    front=(front-axis*axis.dot(front)).normalized()
    right=axis.cross(front).normalized()
    rows=[]
    for t,rx,rz,sweep in profiles:
        rows.append([a.lerp(b,t+sweep*math.sin(angle))+shift+
                     right*math.sin(angle)*rx+front*math.cos(angle)*rz
                     for angle in angles])
    return cage(name,rows,mat,bone,wall,reverse=True)


def register_native(obj):
    """Retain original sole/pivot construction while adding it to the shared bake."""
    if obj.type!='MESH' or obj.get('source_only'): return obj
    obj['astral_bake_low']=True
    high=_copy(obj,'Source_astral_High_'+obj.name)
    high['bake_target']=obj.name
    source(high,'High')
    return obj


def detail_stud(name,center,normal,radius,mat,bone):
    """Actual high-only fastener relief, transferred by selected-to-active baking."""
    from geometry import tube
    normal=Vector(normal).normalized()
    center=Vector(center)
    obj=tube('Source_astral_High_Detail_'+name,center-normal*.0006,center+normal*.0014,
             [(0,radius),(.28,radius),(1,radius*.78)],mat,bone,8)
    obj['bake_detail']='geometric recessed fastener rim'
    return source(obj,'High')
