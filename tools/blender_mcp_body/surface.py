"""Silver tabby body markings in the authored body's world coordinate frame."""
import bpy
import numpy as np
from extract_head import material
from coat_detail import smooth


def colors(co):
    x,y,z=co.T;ax=np.abs(x)
    front=smooth((-y-.015)/.09)
    chest=smooth((.15-ax)/.055)*smooth((z-.82)/.10)*front
    neck=smooth((z-1.40)/.12)*front
    paw=smooth((.19-z)/.10)
    palm=smooth((ax-.39)/.06)*smooth((.82-z)/.10)*front
    cream=np.maximum.reduce((chest,neck,paw*.85,palm*.7))
    grey=np.tile((.15,.17,.20),(len(co),1));pale=np.array((.67,.65,.59))
    col=grey*(1-cream[:,None])+pale*cream[:,None]
    bands=smooth((np.cos(z*42+ax*6+.4*np.sin(y*19))-.58)/.35)
    flank=smooth((ax-.12)/.09);back=smooth((y-.015)/.09)
    stripe=bands*np.maximum(flank,back)*(1-cream*.92)*.65
    # Tail rings follow its curved centreline rather than the torso's horizontal bands.
    tail=smooth((y-.17)/.05)*smooth((1.16-z)/.05)
    phase=(y+.35*x+.4*(z-.80))*58
    stripe=stripe*(1-tail)+smooth((np.cos(phase)-.40)/.50)*.65*tail
    col=col*(1-stripe[:,None])+np.array((.032,.045,.060))*stripe[:,None]
    return np.column_stack((col,np.ones(len(co)))).astype('float32')


def apply():
    body=bpy.data.objects['FULL_Body_Master_ContinuousHigh']
    bpy.context.view_layer.objects.active=body
    mod=body.modifiers.new('Small surface relaxation','SMOOTH');mod.factor=.48;mod.iterations=12
    bpy.ops.object.modifier_apply(modifier=mod.name)
    me=body.data;co=np.empty((len(me.vertices),3),np.float32);me.vertices.foreach_get('co',co.ravel())
    attr=me.color_attributes.get('CoatColor') or me.color_attributes.new('CoatColor','FLOAT_COLOR','POINT')
    attr.data.foreach_set('color',colors(co).ravel())
    mat=bpy.data.materials['REFINED_SilverTabby'].copy();mat.name='FULL_SilverTabby'
    me.materials.clear();me.materials.append(mat)
    pads=material('FULL_SoftPads',(.34,.17,.16),.67)
    claws=material('FULL_ClawKeratin',(.52,.48,.41),.38)
    for obj in bpy.data.collections['FULL_After'].objects:
        if 'Pad' in obj.name:obj.data.materials.clear();obj.data.materials.append(pads)
        elif 'Claw' in obj.name:obj.data.materials.clear();obj.data.materials.append(claws)
    return {'body_vertices':len(co),'material':mat.name}
