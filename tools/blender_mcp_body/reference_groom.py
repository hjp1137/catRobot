"""Regenerate static native hair on the modified local surfaces."""
import bpy
import numpy as np
from mathutils import Matrix
from fur_detail import _unit,_write
import reference_coat as coat
from reference_shape import NEW_TAIL,smooth

def sample(obj,count,rng,head=False,ear=False):
    me=obj.data;me.calc_loop_triangles()
    co=np.empty((len(me.vertices),3),np.float32);me.vertices.foreach_get('co',co.ravel())
    no=np.empty_like(co);me.vertex_normals.foreach_get('vector',no.ravel())
    tri=np.empty((len(me.loop_triangles),3),np.int32);me.loop_triangles.foreach_get('vertices',tri.ravel())
    f=co[tri];area=np.linalg.norm(np.cross(f[:,1]-f[:,0],f[:,2]-f[:,0]),axis=1)
    ids=rng.choice(len(tri),count*3,p=area/area.sum());s=np.sqrt(rng.random(len(ids)));t=rng.random(len(ids))
    bary=np.column_stack((1-s,s*(1-t),s*t))
    p=np.einsum('ni,nij->nj',bary,f[ids]);n=_unit(np.einsum('ni,nij->nj',bary,no[tri[ids]]))
    x,y,z=p.T
    if head:
        keep=np.ones(len(p),bool)
        for side in (-1,1):
            a=np.radians(side*8);dx=x/1.13-side*.083;dz=z-.029
            u=dx*np.cos(a)+dz*np.sin(a);v=-dx*np.sin(a)+dz*np.cos(a)
            keep&=~((y<-.065)&((u/.065)**2+(v/.056)**2<1.1))
        keep&=~((y<-.12)&(abs(x)<.031)&(z>-.095)&(z<-.043))
    elif ear:keep=n[:,1]<-.15
    else:keep=(z>.075)&~((abs(x)>.38)&(z<.98))
    p=p[keep][:count];n=n[keep][:count]
    if len(p)!=count:raise RuntimeError('Not enough valid hair roots: '+obj.name)
    return p,n

def build_region(name,obj,count,head=False,ear=False):
    rng=np.random.default_rng(231024+count);p,n=sample(obj,count,rng,head,ear)
    x,y,z=p.T;side=np.sign(x)
    if head:
        front=smooth((-y-.01)/.10)
        d=np.column_stack((side*.6,np.full(count,.25),np.full(count,-.5)))
        brow=z>.06;d[brow,2]=.9;d[brow,0]=side[brow]*.4
        length=rng.uniform(.005,.009,count)
        cheek=smooth((abs(x)-.145)/.06)*np.exp(-((z+.025)/.08)**2)
        length+=.012*cheek;d[:,0]+=side*cheek
        colors=coat.head_colors(p)
    else:
        d=np.column_stack((side*.30,np.full(count,.13),np.full(count,-1.)))
        length=rng.uniform(.006,.010,count)
        chest=(z>1.12)&(z<1.45)&(y<-.08)
        d[chest,0]=-side[chest]*.6;length[chest]*=1.35
        tail=(y>.18)&(z<1.15)
        if tail.any():
            q=p[tail];delta=np.diff(NEW_TAIL,axis=0)
            t=np.clip(np.einsum('nsi,si->ns',q[:,None]-NEW_TAIL[:-1],delta)/(delta*delta).sum(axis=1),0,1)
            near=NEW_TAIL[:-1]+t[:,:,None]*delta
            seg=np.argmin(((q[:,None]-near)**2).sum(axis=2),axis=1)
            d[tail]=delta[seg];length[tail]=rng.uniform(.016,.024,tail.sum())
        colors=coat.body_colors(p)
    if ear:
        d=np.column_stack((-side,np.zeros(count),np.full(count,.4)))
        length=rng.uniform(.008,.017,count);colors=np.tile((*coat.WHITE,1),(count,1))
    tangent=_unit(d-n*(d*n).sum(axis=1)[:,None]);across=_unit(np.cross(n,tangent))
    t=np.linspace(0,1,5)[None,:,None]
    pos=p[:,None]+n[:,None]*.00004+length[:,None,None]*(n[:,None]*(.48*t-.25*t*t)+tangent[:,None]*(.6*t+.4*t*t))
    pos+=across[:,None]*rng.normal(0,.035,count)[:,None,None]*length[:,None,None]*np.sin(t*np.pi)
    radius=rng.uniform(.000075,.00014,count)[:,None]*(1-t[0,:,0])**.8+.000004
    col='FULL_RefinedHead' if head or ear else 'FULL_After'
    mat=bpy.data.materials['AFTER_CatHead_Fur_Material']
    hair=_write(name,obj,pos,radius,colors.astype('float32'),mat,collection=col)
    hair.matrix_world=obj.matrix_world.copy();hair.hide_render=False
    return {'object':name,'strands':count,'surface':obj.name,'local_sample':True}

def build():
    result=[build_region('FULL_BodyFur',bpy.data.objects['FULL_Body_Master_ContinuousHigh'],100000),
            build_region('AFTER_Fur_Coat',bpy.data.objects['AFTER_Skin'],40000,head=True)]
    ears=sorted((o for o in bpy.data.collections['FULL_RefinedHead'].objects if o.name.startswith('AFTER_Body_Master_EarInner')),key=lambda o:o.name)
    for i,obj in enumerate(ears):result.append(build_region('AFTER_Fur_EarInner_'+str(i),obj,1200,ear=True))
    bpy.context.scene.render.hair_type='STRIP';bpy.context.scene.render.hair_subdiv=1
    return result
