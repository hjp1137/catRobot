"""Reference-directed silhouette fields in the current Z-up model space."""
import bpy
import numpy as np

OLD_TAIL=np.array([(0,.111,.881),(0,.154,.855),(0,.224,.804),(.033,.304,.777),
    (.109,.395,.787),(.200,.460,.825),(.280,.482,.884),(.332,.473,.959),
    (.352,.445,1.026),(.354,.427,1.064)])
NEW_TAIL=np.array([(0,.111,.881),(0,.154,.855),(0,.224,.780),(.040,.330,.660),
    (.130,.440,.570),(.240,.520,.540),(.360,.530,.550),(.460,.480,.600),
    (.520,.400,.690),(.540,.350,.730)])

def smooth(x):
    x=np.clip(x,0,1);return x*x*(3-2*x)

def tail_map(co):
    out=co.copy();mask=(co[:,1]>.14)&(co[:,2]<1.17)
    p=co[mask];a=OLD_TAIL[:-1];d=np.diff(OLD_TAIL,axis=0)
    t=np.clip(np.einsum('nsi,si->ns',p[:,None]-a,d)/(d*d).sum(axis=1),0,1)
    near=a+t[:,:,None]*d
    seg=np.argmin(((p[:,None]-near)**2).sum(axis=2),axis=1);tt=t[np.arange(len(p)),seg]
    center=near[np.arange(len(p)),seg];rad=p-center
    old=d[seg]/np.linalg.norm(d[seg],axis=1)[:,None]
    nd=np.diff(NEW_TAIL,axis=0)[seg];new=nd/np.linalg.norm(nd,axis=1)[:,None]
    axis=np.cross(old,new);c=(old*new).sum(axis=1)
    # Rodrigues' minimal rotation keeps the old section oriented to the new path.
    rotated=rad+np.cross(axis,rad)+np.cross(axis,np.cross(axis,rad))/(1+c[:,None])
    factors=np.array([1,1.1,1.4,1.75,2.,2.3,2.7,3.,3.4,4.5])
    factor=factors[seg]*(1-tt)+factors[seg+1]*tt
    target=NEW_TAIL[seg]+tt[:,None]*nd+rotated*factor[:,None]
    w=smooth((p[:,1]-.14)/.075)
    out[mask]=p+(target-p)*w[:,None]
    return out

def body_map(co):
    x,y,z=co.T;ax=np.abs(x);out=co.copy();front=smooth((.03-y)/.13)
    trunk=np.exp(-(ax/.235)**8)
    neck=np.exp(-((z-1.50)/.09)**2)*trunk
    out[:,0]-=x*.20*neck;out[:,1]-=y*.08*neck
    shoulder=np.exp(-((ax-.22)/.105)**4-((z-1.44)/.14)**4)
    shoulder*=smooth((z-1.28)/.12)
    out[:,2]-=.055*shoulder
    waist=np.exp(-((z-1.08)/.14)**2)*trunk
    out[:,0]-=.022*np.sign(x)*smooth(ax/.12)*waist
    out[:,1]+=.018*waist*front
    pec=np.exp(-((ax-.105)/.075)**2-((z-1.33)/.085)**2)*front
    out[:,1]-=.026*pec
    haunch=np.exp(-((ax-.115)/.09)**4-((z-.72)/.16)**2)*(1-smooth((y-.14)/.06))
    out[:,0]+=.012*np.sign(x)*haunch
    out[:,1]-=.012*haunch*front
    knee=np.exp(-((ax-.106)/.052)**2-((z-.445)/.055)**2)*front
    out[:,1]-=.009*knee
    foot=np.exp(-((ax-.104)/.10)**8)*smooth((.17-z)/.06)
    out[:,1]-=.018*foot*smooth((-y+.01)/.12)
    out[:,2]+=.010*foot*smooth((z-.006)/.025)
    tail=tail_map(co);w=smooth((y-.14)/.07)*smooth((1.15-z)/.05)
    return out*(1-w[:,None])+tail*w[:,None]

def build():
    report=[]
    for obj in bpy.data.collections['FULL_After'].objects:
        if obj.type!='MESH':continue
        co=np.empty((len(obj.data.vertices),3),np.float32);obj.data.vertices.foreach_get('co',co.ravel())
        new=body_map(co);obj.data.vertices.foreach_set('co',new.ravel());obj.data.update()
        report.append({'object':obj.name,'max_move':float(np.linalg.norm(new-co,axis=1).max())})
    return report
