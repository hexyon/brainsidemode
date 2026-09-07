// Convert the original MRI-derived OBJ parcels to one indexed, full-resolution GLB.
// No mirroring, smoothing, decimation, or invented anatomical geometry.
// Download the two archives documented in public/models/ATTRIBUTION.md first.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import * as THREE from 'three';

const root = process.cwd();
const chunks = [], bufferViews = [], accessors = [], meshes = [], nodes = [], parts = [];
let byteLength = 0;
const bounds = new THREE.Box3();
const inputs = ['pial_DK_obj', 'subcortical_obj'].flatMap(folder =>
  fs.readdirSync(path.join(root, '.mesh-cache', folder)).filter(f => f.endsWith('.obj')).sort()
    .map(file => ({ file, folder })));
const parsed = inputs.map(({file, folder}) => {
  const positions = [], indices = [];
  for (const line of fs.readFileSync(path.join(root, '.mesh-cache', folder, file), 'utf8').split(/\r?\n/)) {
    const fields = line.trim().split(/\s+/);
    if (fields[0] === 'v') {
      // FreeSurfer RAS -> Three.js: right +X, superior +Y, anterior +Z.
      // This swap reverses handedness, so reverse triangle winding below.
      const [x,y,z] = fields.slice(1,4).map(Number);
      positions.push(x,z,y);
      bounds.expandByPoint(new THREE.Vector3(x,z,y));
    } else if (fields[0] === 'f') {
      const face = fields.slice(1).map(v => Number(v.split('/')[0]) - 1);
      for (let i=1; i<face.length-1; i++) indices.push(face[0],face[i+1],face[i]);
    }
  }
  return {file, folder, positions, indices};
});
const center = bounds.getCenter(new THREE.Vector3());
const scale = 4.6 / Math.max(...bounds.getSize(new THREE.Vector3()).toArray());
function append(array, target, type, componentType, min, max) {
  const bytes = Buffer.from(array.buffer, array.byteOffset, array.byteLength);
  const padded = Buffer.alloc(Math.ceil(bytes.length/4)*4); bytes.copy(padded);
  const view = bufferViews.push({buffer:0,byteOffset:byteLength,byteLength:bytes.length,target})-1;
  chunks.push(padded); byteLength += padded.length;
  return accessors.push({bufferView:view,componentType,count:array.length/(type==='VEC3'?3:1),type,...(min?{min,max}:{})})-1;
}
for (const item of parsed) {
  const geo = new THREE.BufferGeometry();
  for(let i=0;i<item.positions.length;i+=3) {
    item.positions[i] = (item.positions[i]-center.x)*scale;
    item.positions[i+1] = (item.positions[i+1]-center.y)*scale;
    item.positions[i+2] = (item.positions[i+2]-center.z)*scale;
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(item.positions,3));
  geo.setIndex(item.indices); geo.computeVertexNormals(); geo.computeBoundingBox();
  const name = item.file.replace('.obj','').replace('.pial.DK.','.');
  const cortical = item.folder === 'pial_DK_obj';
  const hemisphere = /^(lh\.|Left-)/.test(name) ? 'left' : /^(rh\.|Right-)/.test(name) ? 'right' : 'midline';
  const pos = geo.attributes.position.array;
  const p = append(pos,34962,'VEC3',5126,geo.boundingBox.min.toArray(),geo.boundingBox.max.toArray());
  const n = append(geo.attributes.normal.array,34962,'VEC3',5126);
  const indices = pos.length/3 > 65535 ? new Uint32Array(item.indices) : new Uint16Array(item.indices);
  const index = append(indices,34963,'SCALAR',indices instanceof Uint32Array?5125:5123);
  const part = {name,cortical,hemisphere,vertices:pos.length/3,triangles:indices.length/3,center:geo.boundingBox.getCenter(new THREE.Vector3()).toArray()};
  meshes.push({name,primitives:[{attributes:{POSITION:p,NORMAL:n},indices:index,material:0}]});
  nodes.push({name,mesh:meshes.length-1,extras:part}); parts.push(part); geo.dispose();
}
const gltf = {asset:{version:'2.0',generator:'Brain Side MRI mesh converter',copyright:'Anderson M. Winkler / Brainder.org — CC BY-SA 3.0'},scene:0,scenes:[{nodes:nodes.map((_,i)=>i)}],nodes,meshes,materials:[{name:'Anatomical tissue',pbrMetallicRoughness:{baseColorFactor:[0.72,0.54,0.48,1],metallicFactor:0,roughnessFactor:0.78}}],buffers:[{byteLength}],bufferViews,accessors};
const json = Buffer.from(JSON.stringify(gltf));
const paddedJson = Buffer.alloc(Math.ceil(json.length/4)*4,0x20); json.copy(paddedJson);
const binary = Buffer.concat(chunks);
const header = Buffer.alloc(12); header.writeUInt32LE(0x46546c67,0); header.writeUInt32LE(2,4); header.writeUInt32LE(12+8+paddedJson.length+8+binary.length,8);
const jh = Buffer.alloc(8); jh.writeUInt32LE(paddedJson.length,0); jh.writeUInt32LE(0x4e4f534a,4);
const bh = Buffer.alloc(8); bh.writeUInt32LE(binary.length,0); bh.writeUInt32LE(0x004e4942,4);
const output = path.join(root,'public/models'); fs.mkdirSync(output,{recursive:true});
const glb = Buffer.concat([header,jh,paddedJson,bh,binary]);
fs.writeFileSync(path.join(output,'human-brain.glb'),glb);
fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify({source:'https://brainder.org/research/brain-for-blender/',license:'CC BY-SA 3.0',sha256:crypto.createHash('sha256').update(glb).digest('hex'),parts,triangles:parts.reduce((s,p)=>s+p.triangles,0)},null,2));
console.log(`${parts.length} original anatomical meshes; ${parts.reduce((s,p)=>s+p.triangles,0).toLocaleString()} triangles; ${(glb.length/1024/1024).toFixed(1)} MB`);
