"""Small continuous regional deformations; apply the same field to paw accessories."""
import bpy
import numpy as np


def displacement(co):
    x,y,z=co.T;ax=np.abs(x);sign=np.sign(x);out=np.zeros_like(co)
    # Lower the upper deltoid bulge while preserving arm width and the neck attachment.
    shoulder=np.exp(-((ax-.215)/.075)**2-((y-.055)/.16)**2-((z-1.475)/.13)**2)
    shoulder*=np.clip((z-1.30)/.10,0,1)
    out[:,2]-=.030*shoulder
    # Preserve the rib cage; introduce a soft front/side waist transition.
    waist=np.exp(-((z-1.09)/.125)**2)*np.exp(-(ax/.21)**6)
    front=np.clip((.03-y)/.15,0,1)
    out[:,1]+=.0065*waist*front
    out[:,0]-=.005*sign*waist*np.clip(ax/.11,0,1)
    # Thin the dorsal palm mound, leaving the forward pad surface almost unchanged.
    palm=np.exp(-((ax-.44)/.055)**4-((z-.952)/.065)**4)
    dorsal=np.clip((y-.012)/.045,0,1)
    out[:,1]-=.0038*palm*dorsal
    # Taper the foot's upper arch into its short toes while retaining the sole plane.
    foot=np.exp(-((ax-.104)/.072)**4-((y+.052)/.065)**4)
    foot*=np.exp(-((z-.075)/.04)**2)*np.clip((z-.018)/.045,0,1)
    out[:,2]-=.0038*foot
    edge=np.exp(-((y+.08)/.05)**2-((z-.05)/.035)**2)
    edge*=np.exp(-((ax-.104)/.095)**8)*np.clip((z-.008)/.03,0,1)
    out[:,0]-=.0023*np.sign(ax-.104)*sign*edge*np.clip(abs(ax-.104)/.045,0,1)
    return out


def build():
    report=[]
    for obj in bpy.data.collections['FULL_After'].objects:
        if obj.type!='MESH':continue
        co=np.empty((len(obj.data.vertices),3),np.float32);obj.data.vertices.foreach_get('co',co.ravel())
        delta=displacement(co);co+=delta
        obj.data.vertices.foreach_set('co',co.ravel());obj.data.update()
        report.append({'object':obj.name,'moved_vertices':int(np.sum(np.linalg.norm(delta,axis=1)>1e-6)),
            'max_displacement_m':float(np.linalg.norm(delta,axis=1).max())})
    bpy.context.scene['FULL_stage']='shoulder_waist_paw_shape_refined'
    return report
