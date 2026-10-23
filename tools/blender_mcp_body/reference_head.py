"""Rework the existing closed head surface and its actual eyeballs."""
import bpy,math
import numpy as np
from mathutils import Matrix,Vector
from reference_shape import smooth

ORIGIN=Vector((0,-.013679907657206059,1.676700704574585))

def shape(co):
    x,y,z=co.T;ax=np.abs(x);out=co.copy();front=smooth((-y-.03)/.09)
    muzzle=np.exp(-((ax-.041)/.035)**2-((z+.067)/.031)**2)*front
    out[:,1]-=.027*muzzle
    out[:,2]-=.005*muzzle
    chin=np.exp(-(x/.065)**2-((z+.122)/.025)**2)*front
    out[:,1]-=.009*chin
    # Pull the cheek silhouette out into three subtle fur masses.
    cheek=np.exp(-((ax-.175)/.031)**2)*smooth((.12-y)/.18)
    ridge=sum(a*np.exp(-((z-c)/w)**2) for c,w,a in [(.002,.014,.016),(-.032,.014,.018),(-.069,.014,.012)])
    out[:,0]+=np.sign(x)*cheek*ridge
    out[:,0]*=1.13
    ears=smooth((z-.145)/.07)
    out[:,2]+=.025*ears
    out[:,0]+=np.sign(x)*.007*ears
    return out

def recess(co):
    x,y,z=co.T;delta=np.zeros(len(co))
    for side in (-1,1):
        dx=x-side*.083;dz=z-.029
        a=math.radians(side*8);u=dx*math.cos(a)+dz*math.sin(a);v=-dx*math.sin(a)+dz*math.cos(a)
        e=(u/.060)**2+(v/np.where(v>0,.050,.042))**2
        weight=smooth((1-e)/.22)*smooth((-.088-y)/.008)
        target=-.088-np.sqrt(np.maximum(.070**2-dx*dx-dz*dz,0))+.003
        delta=np.maximum(delta,np.maximum(target-y,0)*weight)
    co[:,1]+=delta

def build():
    col=bpy.data.collections['FULL_RefinedHead'];names=[]
    for obj in col.objects:
        if obj.hide_render or obj.type not in {'MESH','CURVE'}:continue
        source=bpy.data.objects.get('BEFORE_REFERENCE_'+obj.name)
        if source is None:continue
        if obj.name.startswith(('AFTER_TrueEyeball','AFTER_SphericalIris','AFTER_SphericalPupil')):
            side=1 if obj.name.endswith('1') and not obj.name.endswith('-1') else -1
            c=Vector((side*.083,-.088,.029));scale=Matrix.Diagonal((1.13,1,1,1))
            obj.matrix_world=Matrix.Translation(ORIGIN)@scale@Matrix.Translation(c)@Matrix.Scale(1.12,4)@Matrix.Translation(-c)
            continue
        if obj.type=='MESH':
            co=np.empty((len(source.data.vertices),3),np.float32);source.data.vertices.foreach_get('co',co.ravel())
            if obj.name=='AFTER_Skin':recess(co)
            new=shape(co);obj.data.vertices.foreach_set('co',new.ravel());obj.data.update()
        else:
            for src,dst in zip(source.data.splines,obj.data.splines):
                if src.type=='BEZIER':
                    for a,b in zip(src.bezier_points,dst.bezier_points):
                        b.co=shape(np.array([a.co]))[0]
                        b.handle_left=shape(np.array([a.handle_left]))[0]
                        b.handle_right=shape(np.array([a.handle_right]))[0]
                else:
                    for a,b in zip(src.points,dst.points):b.co=(*shape(np.array([a.co[:3]]))[0],a.co[3])
        obj.matrix_world=Matrix.Translation(ORIGIN);names.append(obj.name)
    bpy.context.scene['FULL_head_origin']=list(ORIGIN)
    return {'head_parts':names,'eye_radius':.070,'head_width_scale':1.13,'origin':list(ORIGIN)}

def lids():
    from extract_head import material
    skin=bpy.data.objects['AFTER_Skin'];col=bpy.data.collections['FULL_RefinedHead']
    mat=material('REFERENCE_LidRim',(.028,.022,.022),.64)
    for side in (-1,1):
        name='AFTER_ReferenceLid'+str(side)
        if bpy.data.objects.get(name):bpy.data.objects.remove(bpy.data.objects[name],do_unlink=True)
        data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.bevel_depth=.0017;data.bevel_resolution=3
        spline=data.splines.new('POLY');spline.points.add(127);spline.use_cyclic_u=True
        for i,p in enumerate(spline.points):
            a=math.tau*i/128;u=.060*math.cos(a);v=(.050 if math.sin(a)>0 else .042)*math.sin(a)
            angle=math.radians(side*8);x=side*.083+u*math.cos(angle)-v*math.sin(angle)
            z=.029+u*math.sin(angle)+v*math.cos(angle)
            x*=1.13;hit,loc,normal,index=skin.ray_cast(Vector((x,-.6,z)),Vector((0,1,0)))
            if not hit:raise RuntimeError('Eyelid point misses head')
            p.co=(x,loc.y-.0009,z,1);p.radius=.6+.7*max(math.sin(a),0)
        obj=bpy.data.objects.new(name,data);col.objects.link(obj);obj.matrix_world=Matrix.Translation(ORIGIN)
        data.materials.append(mat)
    return {'lid_rims':2}
