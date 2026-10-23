"""Read and preserve the existing licensed UAL glTF skeleton exactly."""
import json, struct
import numpy as np

def read_glb(path):
    data = open(path, 'rb').read()
    size = struct.unpack_from('<I', data, 12)[0]
    doc = json.loads(data[20:20 + size])
    start = 20 + size
    blob = data[start + 8:] if start < len(data) else b''
    return doc, blob

def write_glb(path, doc, blob):
    blob += b'\0' * (-len(blob) % 4)
    doc['buffers'] = [{'byteLength': len(blob)}]
    encoded = json.dumps(doc, separators=(',', ':')).encode()
    encoded += b' ' * (-len(encoded) % 4)
    header = struct.pack('<III', 0x46546c67, 2, 28 + len(encoded) + len(blob))
    open(path, 'wb').write(header + struct.pack('<II', len(encoded), 0x4e4f534a)
                           + encoded + struct.pack('<II', len(blob), 0x004e4942) + blob)

def local_matrix(node):
    if 'matrix' in node:
        return np.array(node['matrix']).reshape(4, 4).T
    x, y, z, w = node.get('rotation', [0, 0, 0, 1])
    m = np.eye(4)
    m[:3, :3] = [[1-2*y*y-2*z*z, 2*x*y-2*z*w, 2*x*z+2*y*w],
                  [2*x*y+2*z*w, 1-2*x*x-2*z*z, 2*y*z-2*x*w],
                  [2*x*z-2*y*w, 2*y*z+2*x*w, 1-2*x*x-2*y*y]]
    m[:3, :3] = m[:3, :3] @ np.diag(node.get('scale', [1, 1, 1]))
    m[:3, 3] = node.get('translation', [0, 0, 0])
    return m

def global_matrices(doc):
    parents = {c: i for i, n in enumerate(doc['nodes']) for c in n.get('children', [])}
    cache = {}
    def at(i):
        if i not in cache:
            cache[i] = (at(parents[i]) if i in parents else np.eye(4)) @ local_matrix(doc['nodes'][i])
        return cache[i]
    return [at(i) for i in range(len(doc['nodes']))]

def source_points(path):
    doc, _ = read_glb(path)
    matrices = global_matrices(doc)
    return {n.get('name', str(i)): matrices[i][:3, 3].tolist() for i, n in enumerate(doc['nodes'])}

if __name__ == '__main__':
    import sys
    p = source_points(sys.argv[1])
    for name in ['pelvis', 'spine_01', 'spine_03', 'neck_01', 'Head', 'upperarm_l',
                 'lowerarm_l', 'hand_l', 'thigh_l', 'calf_l', 'foot_l', 'ball_l']:
        print(name, [round(v, 5) for v in p[name]])
