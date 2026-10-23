"""Original silver-tabby markings shared by the skin and native hair roots."""
import bpy
import numpy as np


def smooth(v):
    t = np.clip(v, 0, 1)
    return t*t*(3-2*t)


def coat_colors(co):
    x,y,z = co.T; ax=np.abs(x)
    front=smooth((-y-.025)/.08)
    grey=np.tile((.15,.17,.20),(len(co),1))
    cream=np.array((.67,.65,.59)); dark=np.array((.032,.045,.060))
    boundary=-.025-.19*ax+.012*np.cos(ax*28)
    bib=smooth((boundary-z)/.025)*front
    blaze=np.exp(-(x/.027)**2)*smooth((.035-z)/.03)*front
    pale=np.maximum(bib,blaze*.8)
    color=grey*(1-pale[:,None])+cream*pale[:,None]
    stripe=np.zeros(len(co))
    for start,end,width in [((.018,.17),(.012,.085),.008),
                            ((.050,.165),(.031,.112),.009),
                            ((.077,.135),(.063,.075),.008),
                            ((.14,.007),(.185,.041),.010),
                            ((.148,-.028),(.195,-.006),.009)]:
        a=np.array(start); d=np.array(end)-a; p=np.column_stack((ax,z))-a
        t=np.clip((p@d)/(d@d),0,1)
        dist=np.linalg.norm(p-t[:,None]*d,axis=1)+.0007*np.sin(z*420+x*370)
        stripe=np.maximum(stripe,smooth((width-dist)/(width*.75))*front)
    # Broad bands continue across the back; no downloadable texture dependency.
    back=smooth((y+.03)/.09)
    bands=smooth((np.cos(z*71+ax*19)-.55)/.4)*back*.55
    stripe=np.maximum(stripe,bands)*(1-pale*.92)
    color=color*(1-stripe[:,None]*.8)+dark*stripe[:,None]*.8
    variation=1+.035*np.sin(x*970+np.sin(z*531))*np.sin(y*783+z*194)
    color*=variation[:,None]
    mouth_z=-.103+.014*(x/.043)**2
    mouth=np.exp(-((z-mouth_z)/.0025)**2)*smooth((.045-ax)/.007)*front
    phil=np.exp(-(x/.0022)**2)*smooth((-.063-z)/.007)*smooth((z+.105)/.005)*front
    line=np.maximum(mouth,phil)*.72
    color=color*(1-line[:,None])+np.array((.10,.075,.067))*line[:,None]
    return np.column_stack((np.clip(color,0,1),np.ones(len(co)))).astype('float32')


def apply():
    skin=bpy.data.objects['AFTER_Skin']; mesh=skin.data
    co=np.empty((len(mesh.vertices),3),dtype='float32');mesh.vertices.foreach_get('co',co.ravel())
    attr=mesh.color_attributes.get('CoatColor') or mesh.color_attributes.new('CoatColor','FLOAT_COLOR','POINT')
    attr.data.foreach_set('color',coat_colors(co).ravel())
    mat=bpy.data.materials.get('REFINED_SilverTabby') or bpy.data.materials.new('REFINED_SilverTabby')
    mat.use_nodes=True; nt=mat.node_tree;nt.nodes.clear()
    shader=nt.nodes.new('ShaderNodeBsdfPrincipled'); out=nt.nodes.new('ShaderNodeOutputMaterial')
    attrnode=nt.nodes.new('ShaderNodeAttribute');attrnode.attribute_name='CoatColor'
    nt.links.new(attrnode.outputs['Color'],shader.inputs['Base Color'])
    shader.inputs['Roughness'].default_value=.78;shader.inputs['Specular IOR Level'].default_value=.22
    shader.inputs['Sheen Weight'].default_value=.22
    noise=nt.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=460
    noise.inputs['Detail'].default_value=2
    bump=nt.nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.12
    bump.inputs['Distance'].default_value=.00022
    nt.links.new(noise.outputs['Fac'],bump.inputs['Height']);nt.links.new(bump.outputs['Normal'],shader.inputs['Normal'])
    nt.links.new(shader.outputs[0],out.inputs['Surface'])
    mesh.materials.clear();mesh.materials.append(mat)
    return {'material':mat.name,'color_points':len(co),'texture_files':0}
