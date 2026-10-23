"""Original UV-authored tabby color layers, independent of concept imagery."""
import numpy as np
from fur_surface import image_map

def prepare_face_color(mat,cache):
    w,h=2048,1024
    u,v=np.meshgrid((np.arange(w)+.5)/w,(np.arange(h)+.5)/h)
    theta=(u-.5)*2*np.pi; phi=(v-.5)*np.pi
    x,y,z=np.sin(theta)*np.cos(phi),np.sin(phi),np.cos(theta)*np.cos(phi)
    front=np.clip((z-.12)*3,0,1)
    variation=.055*y+.035*np.sin(x*7+y*4)+.018*np.cos(theta*5)
    color=np.stack([.555+variation,.563+variation,.542+variation],axis=2)
    pads=np.zeros((h,w))
    for side in [-1,1]:
        pads+=np.exp(-(((x-side*.23)/.30)**4+((y+.40)/.195)**4))
    chin=np.exp(-((x/.30)**4+((y+.70)/.15)**4))
    cream=np.clip(pads+chin,0,1)*front
    color=color*(1-cream[:,:,None])+np.array([.91,.892,.844])*cream[:,:,None]
    stripes=np.exp(-(x/.027)**2)*np.clip((y-.53)*7,0,1)
    brow=np.clip((y-.27)*6,0,1)*np.clip((.96-y)*9,0,1)
    for location,width in [(.095+.24*(y-.27),.022),(.43-.16*(y-.27),.025)]:
        stripes+=np.exp(-((np.abs(x)-location)/width)**2)*brow
    cheek=(np.exp(-((y+.04+.14*np.sin(np.abs(x)*5))/.027)**2)+
           .75*np.exp(-((y+.28+.13*np.sin(np.abs(x)*5))/.026)**2))
    cheek*=np.clip((np.abs(x)-.53)*8,0,1)*np.clip((.93-np.abs(x))*8,0,1)
    stripes=np.clip(stripes+cheek,0,1)*front
    rng=np.random.default_rng(1023)
    grain=rng.random((h,w))-.5
    hair=np.sin(u*1440*np.pi+np.sin(v*97*np.pi)*.9+grain*.9)
    color*=1-stripes[:,:,None]*(.42+grain[:,:,None]*.12)
    color=np.clip(color+grain[:,:,None]*.023+hair[:,:,None]*.010,.02,1)
    image=image_map('Cat_FurHead_BenchmarkColor_Albedo',color,cache)
    nodes,links=mat.node_tree.nodes,mat.node_tree.links
    node=nodes.new('ShaderNodeTexImage'); node.image=image
    links.new(node.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color'])
