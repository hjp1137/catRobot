"""Original UV/PBR short fur. All raster sources are authored here, offline."""
import bpy
import numpy as np
from mathutils import Vector


def image_map(name, values, cache, data=False):
    h,w=values.shape[:2]
    image=bpy.data.images.new(name,width=w,height=h,alpha=False)
    image.colorspace_settings.name='Non-Color' if data else 'sRGB'
    rgba=np.ones((h,w,4),dtype=np.float32)
    if values.ndim==2: rgba[:,:,:3]=values[:,:,None]
    else: rgba[:,:,:3]=values[:,:,:3]
    if not data:
        srgb=rgba[:,:,:3]
        rgba[:,:,:3]=np.where(srgb<=.04045,srgb/12.92,((srgb+.055)/1.055)**2.4)
    image.pixels.foreach_set(rgba.reshape(-1))
    image.filepath_raw=str(cache/(name+'.png'))
    image.file_format='PNG'
    image.save()
    image.pack()
    return image


def fur_maps(name, cache, head=False, cream=False, torso=False):
    w,h=(2048,1024) if head else (1024,1024)
    u,v=np.meshgrid((np.arange(w)+.5)/w,(np.arange(h)+.5)/h)
    rng=np.random.default_rng(1847 if head else 3981)
    noise=rng.random((h,w))
    cell=np.sin(np.floor(u*720)*12.9898+np.floor(v*190)*78.233)*43758.5453
    cell=cell-np.floor(cell)
    fibers=np.sin(u*1400*np.pi+np.sin(v*90*np.pi)*.7+cell*.7)
    fibers*=.45+.55*np.sin(v*260*np.pi+cell*6.28)**2
    grain=(noise-.5)*.025+fibers*.025+(cell-.5)*.036
    base=np.array([.49,.505,.49]) if not cream else np.array([.86,.845,.795])
    color=np.broadcast_to(base,(h,w,3)).copy()
    if head:
        theta=(u-.5)*2*np.pi
        phi=(v-.5)*np.pi
        x,y,z=np.sin(theta)*np.cos(phi),np.sin(phi),np.cos(theta)*np.cos(phi)
        left=np.exp(-(((x-.20)/.34)**2+((y+.36)/.25)**2))
        right=np.exp(-(((x+.20)/.34)**2+((y+.36)/.25)**2))
        mask=np.clip((left+right)*.90,0,1)*(z>.15)
        color=color*(1-mask[:,:,None])+np.array([.88,.865,.815])*mask[:,:,None]
        front=np.clip((z-.05)*3,0,1)
        brow=np.clip((y-.24)*6,0,1)*np.clip((.98-y)*10,0,1)
        marks=np.exp(-(x/.041)**2)*np.clip((y-.53)*8,0,1)
        for location,width in [(.08+.28*(y-.24),.038),(.43-.16*(y-.25),.041)]:
            marks+=np.exp(-((np.abs(x)-location)/width)**2)*brow
        cheek=(np.exp(-((y+.07+.17*np.sin(np.abs(x)*5))/.042)**2)+
               np.exp(-((y+.32+.12*np.sin(np.abs(x)*5))/.040)**2))*(np.abs(x)>.54)
        marks=np.clip((marks+cheek*.8)*front,0,1)
        color*=1-marks[:,:,None]*.63
        nose_bridge=np.exp(-((x/.14)**2+((y-.02)/.38)**2))*front
        color*=1-nose_bridge[:,:,None]*.10
    elif not cream:
        bands=np.clip((np.sin(v*18*np.pi+np.sin(u*9*np.pi)*.6)-.55)*2.2,0,1)
        color*=1-bands[:,:,None]*.26
        if torso:
            mask=np.exp(-(((u-.5)/.105)**4+((v-.515)/.105)**4))
            color=color*(1-mask[:,:,None])+np.array([.85,.84,.79])*mask[:,:,None]
    color=np.clip(color+grain[:,:,None],.015,1)
    rough=np.clip(.78+fibers*.025+(noise-.5)*.08,.65,.91)
    height=fibers*.003+(cell-.5)*.002
    dy,dx=np.gradient(height)
    normal=np.stack((-dx*37,-dy*37,np.ones_like(dx)),axis=2)
    normal/=np.linalg.norm(normal,axis=2)[:,:,None]
    return [image_map(name+'_Albedo',color,cache),image_map(name+'_Roughness',rough,cache,True),
            image_map(name+'_Normal',normal*.5+.5,cache,True)]


def connect_maps(mat, maps):
    nodes,links=mat.node_tree.nodes,mat.node_tree.links
    shader=nodes.get('Principled BSDF')
    for image,socket in zip(maps,['Base Color','Roughness','Normal']):
        tex=nodes.new('ShaderNodeTexImage')
        tex.image=image
        tex.label=image.name
        if socket=='Normal':
            normal=nodes.new('ShaderNodeNormalMap')
            normal.inputs['Strength'].default_value=.34
            links.new(tex.outputs['Color'],normal.inputs['Color'])
            links.new(normal.outputs['Normal'],shader.inputs[socket])
        else: links.new(tex.outputs['Color'],shader.inputs[socket])
    shader.inputs['Specular IOR Level'].default_value=.26


def assign_fur_uv(obj, center, radii, cylindrical=False):
    """Rest-space UVs survive native glTF export and offline joins."""
    uv=obj.data.uv_layers.active or obj.data.uv_layers.new(name='UVMap')
    coords=[]
    for vert in obj.data.vertices:
        q=obj.matrix_world@vert.co
        q=Vector((q.x,q.z,-q.y))-Vector(center)
        x,y,z=[q[i]/radii[i] for i in range(3)]
        u=np.arctan2(x,z)/(2*np.pi)+.5
        t=(y*.5+.5) if cylindrical else np.arcsin(np.clip(y/max(np.sqrt(x*x+y*y+z*z),1e-5),-1,1))/np.pi+.5
        coords.append((float(u),float(t)))
    for polygon in obj.data.polygons:
        values=[coords[obj.data.loops[i].vertex_index] for i in polygon.loop_indices]
        seam=max(u for u,v in values)-min(u for u,v in values)>.5
        for i,(u,v) in zip(polygon.loop_indices,values):
            uv.data[i].uv=(u+1 if seam and u<.5 else u,v)


def prepare_fur(mats, cache):
    cache.mkdir(parents=True,exist_ok=True)
    for key,head,cream in [('Fur',False,False),('FurTorso',False,False),('FurHead',True,False),('Cream',False,True)]:
        connect_maps(mats[key],fur_maps('Cat_'+key,cache,head,cream,key=='FurTorso'))
    # Radial iris fibers are painted into an original UV image too.
    w=512
    x,y=np.meshgrid((np.arange(w)+.5)/w*2-1,(np.arange(w)+.5)/w*2-1)
    r=np.sqrt(x*x+y*y)
    a=np.arctan2(y,x)
    grain=.5+.25*np.sin(a*86+r*22)+.15*np.sin(a*153-r*33)
    glow=np.clip(1-r,.0,1)
    color=np.stack((.12+grain*.14+glow*.06,.48+grain*.25,.48+grain*.24),axis=2)
    color*=np.clip((1.07-r)*7,.40,1)[:,:,None]
    image=image_map('Cat_Iris_Albedo',np.clip(color,0,1),cache)
    mat=mats['Eye']
    nodes,links=mat.node_tree.nodes,mat.node_tree.links
    tex=nodes.new('ShaderNodeTexImage')
    tex.image=image
    shader=nodes.get('Principled BSDF')
    links.new(tex.outputs['Color'],shader.inputs['Base Color'])
    shader.inputs['Coat Weight'].default_value=.08
    shader.inputs['Coat Roughness'].default_value=.30
    shader.inputs['Specular IOR Level'].default_value=.28
    mats['Pupil'].node_tree.nodes.get('Principled BSDF').inputs['Specular IOR Level'].default_value=0


def prepare_metals(materials,cache):
    """Subtle original brushed roughness, packed by the native glTF exporter."""
    w=512
    u,v=np.meshgrid((np.arange(w)+.5)/w,(np.arange(w)+.5)/w)
    rng=np.random.default_rng(7251)
    grains=rng.random((w,w))-.5
    brush=np.sin(u*490*np.pi+np.sin(v*33)*.2)
    for tier,mats in materials.items():
        for role in ['ArmorShell','ArmorEdge','ArmorTrim']:
            mat=mats[role]
            shader=mat.node_tree.nodes.get('Principled BSDF')
            mean=.34 if tier=='gold' else (.38 if tier=='blackiron' else .33)
            if tier=='astral': mean=.38 if role=='ArmorShell' else .29
            if role=='ArmorEdge': mean-=.025
            pixels=np.clip(mean+grains*.055+brush*.014,.20,.48)
            image=image_map(tier+'_'+role+'_Roughness',pixels,cache,True)
            tex=mat.node_tree.nodes.new('ShaderNodeTexImage')
            tex.image=image
            mat.node_tree.links.new(tex.outputs['Color'],shader.inputs['Roughness'])
            if tier=='astral' and role=='ArmorShell':
                shader.inputs['Metallic'].default_value=.52
                shader.inputs['Coat Weight'].default_value=.22
                shader.inputs['Coat Roughness'].default_value=.24


def assign_axis_uv(obj,start,end,radius,repeat=.42,offset=0):
    """Lay individual short hairs along the actual limb or tail axis."""
    start,end=Vector(start),Vector(end)
    axis=(end-start).normalized()
    front=Vector((0,0,1))
    if abs(front.dot(axis))>.96: front=Vector((0,1,0))
    right=axis.cross(front).normalized()
    front=right.cross(axis).normalized()
    uv=obj.data.uv_layers.active or obj.data.uv_layers.new(name='UVMap')
    coords=[]
    for vert in obj.data.vertices:
        q=obj.matrix_world@vert.co
        q=Vector((q.x,q.z,-q.y))-start
        along=q.dot(axis)
        radial=q-axis*along
        u=np.arctan2(radial.dot(right),radial.dot(front))/(2*np.pi)+.5
        coords.append((float(u),float(along/(end-start).length*repeat+offset)))
    for polygon in obj.data.polygons:
        values=[coords[obj.data.loops[i].vertex_index] for i in polygon.loop_indices]
        seam=max(u for u,v in values)-min(u for u,v in values)>.5
        for i,(u,v) in zip(polygon.loop_indices,values):
            uv.data[i].uv=(u+1 if seam and u<.5 else u,v)
