"""Static body short fur using the same native Curves writer as the reviewed head."""
import bpy
import numpy as np
from fur_detail import _unit,_write
from surface import colors


def build(count=60000):
    obj=bpy.data.objects['FULL_Body_Master_ContinuousHigh'];me=obj.data;me.calc_loop_triangles()
    co=np.empty((len(me.vertices),3),np.float32);me.vertices.foreach_get('co',co.ravel())
    no=np.empty_like(co);me.vertex_normals.foreach_get('vector',no.ravel())
    tri=np.empty((len(me.loop_triangles),3),np.int32);me.loop_triangles.foreach_get('vertices',tri.ravel())
    faces=co[tri];area=np.linalg.norm(np.cross(faces[:,1]-faces[:,0],faces[:,2]-faces[:,0]),axis=1)
    rng=np.random.default_rng(231023)
    index=rng.choice(len(tri),count*2,p=area/area.sum())
    s=np.sqrt(rng.random(len(index)));r=rng.random(len(index))
    bary=np.column_stack((1-s,s*(1-r),s*r))
    roots=np.einsum('ni,nij->nj',bary,faces[index])
    normals=_unit(np.einsum('ni,nij->nj',bary,no[tri[index]]))
    # Keep plantar skin and forward-facing palm pads clear of fur.
    keep=(roots[:,2]>.07)&~((np.abs(roots[:,0])>.4)&(roots[:,2]<.82)&(normals[:,1]<-.25))
    roots=roots[keep][:count];normals=normals[keep][:count]
    if len(roots)!=count:raise RuntimeError('Insufficient valid body fur roots')
    x,y,z=roots.T
    direction=np.column_stack((np.sign(x)*.25,np.full(count,.10),np.full(count,-1.)))
    shoulder=(z>1.30)&(np.abs(x)>.15)
    direction[shoulder,0]=np.sign(x[shoulder])*.8
    # Original authored tail centreline, transformed to Blender's Z-up coordinates.
    path=np.array([(0,.111,.881),(0,.154,.855),(0,.224,.804),(.033,.304,.777),
       (.109,.395,.787),(.200,.460,.825),(.280,.482,.884),(.332,.473,.959),
       (.352,.445,1.026),(.354,.427,1.064)])
    tail=(y>.18)&(z<1.12)
    if tail.any():
        p=roots[tail];starts=path[:-1];delta=np.diff(path,axis=0)
        t=np.clip(np.einsum('nsi,si->ns',p[:,None,:]-starts,delta)/np.sum(delta*delta,axis=1),0,1)
        near=starts+t[:,:,None]*delta
        seg=np.argmin(np.sum((p[:,None,:]-near)**2,axis=2),axis=1)
        direction[tail]=delta[seg]
    tangent=_unit(direction-normals*np.sum(direction*normals,axis=1)[:,None])
    across=_unit(np.cross(normals,tangent));angle=rng.normal(0,.12,count)
    tangent=tangent*np.cos(angle[:,None])+across*np.sin(angle[:,None])
    length=rng.uniform(.0035,.0065,count);length[z<.25]*=.65
    t=np.linspace(0,1,5)[None,:,None]
    pos=roots[:,None,:]+normals[:,None,:]*.00003
    pos=pos+length[:,None,None]*(normals[:,None,:]*(.6*t-.26*t*t)+tangent[:,None,:]*(.45*t+.5*t*t))
    radius=rng.uniform(.000055,.000080,count)[:,None]*(1-t[0,:,0])**.7+.000003
    mat=bpy.data.materials['AFTER_CatHead_Fur_Material']
    _write('FULL_BodyFur',obj,pos,radius,colors(roots),mat,collection='FULL_After')
    bpy.context.scene.render.hair_type='STRIP';bpy.context.scene.render.hair_subdiv=1
    return {'strands':count,'points':count*5,'source_surface':obj.name,'length_m':[float(length.min()),float(length.max())]}
