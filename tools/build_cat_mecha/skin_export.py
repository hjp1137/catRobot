"""Attach offline meshes to exact source nodes and inverse bind matrices."""
import copy
import numpy as np
from glb_source import read_glb, write_glb

COMPONENT={5126:('<f4',4),5123:('<u2',2),5125:('<u4',4),5121:('u1',1)}
WIDTH={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}

def convex_support(vertices):
    import bmesh
    bm=bmesh.new()
    points=[bm.verts.new(point) for point in np.unique(np.array(vertices),axis=0)]
    hull=bmesh.ops.convex_hull(bm,input=points,use_existing_faces=False)
    exterior=set()
    for item in hull['geom']:
        if isinstance(item,bmesh.types.BMFace): exterior.update(item.verts)
        elif isinstance(item,bmesh.types.BMVert): exterior.add(item)
    result=sorted(tuple(float(v) for v in vertex.co) for vertex in exterior)
    bm.free()
    return result

def values(doc,blob,index):
    a=doc['accessors'][index]
    b=doc['bufferViews'][a['bufferView']]
    dtype,size=COMPONENT[a['componentType']]
    count,width=a['count'],WIDTH[a['type']]
    offset=b.get('byteOffset',0)+a.get('byteOffset',0)
    return np.ndarray((count,width),dtype=dtype,buffer=blob,offset=offset,
                      strides=(b.get('byteStride',size*width),size)).copy()

def attach_skin(source_path,mesh_path,output_path,report_path):
    source,source_blob=read_glb(source_path)
    doc,blob=read_glb(mesh_path)
    source_skin=copy.deepcopy(source['skins'][0])
    def append(array,component,kind):
        nonlocal blob
        blob+=b'\0'*(-len(blob)%4)
        view=len(doc.setdefault('bufferViews',[]))
        raw=array.tobytes()
        doc['bufferViews'].append({'buffer':0,'byteOffset':len(blob),'byteLength':len(raw)})
        blob+=raw
        index=len(doc.setdefault('accessors',[]))
        doc['accessors'].append({'bufferView':view,'componentType':component,'count':len(array),'type':kind})
        return index
    source_skin['inverseBindMatrices']=append(values(source,source_blob,source_skin['inverseBindMatrices']),5126,'MAT4')
    skeleton_nodes=copy.deepcopy(source['nodes'])
    for node in skeleton_nodes:
        node.pop('mesh',None)
        node.pop('skin',None)
    source_root=source['scenes'][source.get('scene',0)]['nodes'][0]
    skeleton_nodes[source_root]['children']=[i for i in skeleton_nodes[source_root]['children'] if i!=65]
    generated=doc['nodes']
    joint_names=[source['nodes'][i]['name'] for i in source_skin['joints']]
    report={'source_bones':len(joint_names),'source_rest_nodes_exact':True,'meshes':[],'tiers':{}}
    for node in generated:
        node.pop('children',None)
        if 'mesh' not in node: continue
        extras=node.get('extras',{})
        bone=extras['bind_bone']
        node['skin']=0
        vertices=triangles=0
        contact=[]
        for primitive in doc['meshes'][node['mesh']]['primitives']:
            pos=values(doc,blob,primitive['attributes']['POSITION'])
            count=len(pos)
            joints=np.zeros((count,4),dtype='<u2')
            weights=np.zeros((count,4),dtype='<f4')
            if bone=='TORSO':
                joints[:,:3]=[joint_names.index(k) for k in ['pelvis','spine_01','spine_03']]
                t=np.clip((pos[:,1]-.9167)/(1.0505-.9167),0,1)
                weights[:,0],weights[:,1]=1-t,t
                upper=pos[:,1]>1.0505
                t=np.clip((pos[upper,1]-1.0505)/(1.3148-1.0505),0,1)
                weights[upper,0],weights[upper,1],weights[upper,2]=0,1-t,t
            else:
                joints[:,0]=joint_names.index(bone)
                weights[:,0]=1
            primitive['attributes']['JOINTS_0']=append(joints,5123,'VEC4')
            primitive['attributes']['WEIGHTS_0']=append(weights,5126,'VEC4')
            vertices+=count
            triangles+=doc['accessors'][primitive['indices']]['count']//3
            if 'foot_side' in extras: contact.extend(pos.tolist())
        if contact: extras['contact_vertices']=convex_support(contact)
        report['meshes'].append({'name':node['name'],'vertices':vertices,'triangles':triangles,'bone':bone})
    skeleton_nodes[source_root]['children']+=list(range(len(skeleton_nodes),len(skeleton_nodes)+len(generated)))
    doc['nodes']=skeleton_nodes+generated
    doc['skins']=[source_skin]
    doc['scenes']=[{'name':'CatMechaEvolution','nodes':[source_root]}]
    doc['scene']=0
    write_glb(output_path,doc,blob)
    import json
    open(report_path,'w',encoding='utf8').write(json.dumps(report,indent=2))
    return report
