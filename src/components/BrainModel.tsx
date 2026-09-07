import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { RotateCcw, Plus, Minus, Move, Maximize2, Loader2 } from 'lucide-react';
import { matchesRegion, palette, partCategory, partName, type AtlasPart, type Hemisphere, type Layer } from '@/data/anatomy';

interface Props {
  selectedRegion: string | null; selectedPart: string | null; activeRegions: string[];
  layer: Layer; hemisphere: Hemisphere; isolated: boolean; split: number;
  onSelectPart: (part: AtlasPart) => void; onLoaded: () => void;
}
type CameraAction = {kind: 'reset' | 'in' | 'out'; sequence: number};
const initialCamera: [number,number,number] = [-6.7, 2.6, 5.5];

function CameraControls({action,isolated,selectedPart,selectedRegion,hemisphere,split}: {action: CameraAction} & Pick<Props,'isolated'|'selectedPart'|'selectedRegion'|'hemisphere'|'split'>) {
  const controls = useRef<OrbitControlsImpl>(null);
  const {camera, invalidate} = useThree();
  const {scene} = useGLTF('/models/human-brain.glb');
  const wasIsolated = useRef(false);
  useEffect(()=>{
    if (!controls.current) return;
    if (!isolated && !wasIsolated.current) return;
    wasIsolated.current = isolated;
    if (!isolated) {
      controls.current.target.set(0,0,0);
      camera.position.set(...initialCamera);
    } else {
      const bounds = new THREE.Box3();
      scene.traverse(object=>{
        if (!(object instanceof THREE.Mesh)) return;
        const part = object.userData as AtlasPart;
        if (hemisphere!=='both' && part.hemisphere!=='midline' && part.hemisphere!==hemisphere) return;
        if (selectedPart ? part.name!==selectedPart : !matchesRegion(part.name,selectedRegion)) return;
        object.geometry.computeBoundingBox();
        const box = object.geometry.boundingBox.clone();
        box.translate(new THREE.Vector3(part.hemisphere==='left'?-split:part.hemisphere==='right'?split:0,0,0));
        bounds.union(box);
      });
      if (!bounds.isEmpty()) {
        const center = bounds.getCenter(new THREE.Vector3());
        const radius = bounds.getBoundingSphere(new THREE.Sphere()).radius;
        const distance = THREE.MathUtils.clamp(radius*3.8,0.65,13);
        const direction = camera.position.clone().sub(controls.current.target).normalize();
        controls.current.target.copy(center);camera.position.copy(center).addScaledVector(direction,distance);
      }
    }
    controls.current.update(); invalidate();
  },[isolated,selectedPart,selectedRegion,hemisphere,split,scene,camera,invalidate]);
  useEffect(()=>{
    if (!controls.current) return;
    if (action.kind === 'reset') {
      camera.position.set(...initialCamera); controls.current.target.set(0,0,0);
    } else {
      const offset = camera.position.clone().sub(controls.current.target);
      offset.setLength(THREE.MathUtils.clamp(offset.length()*(action.kind==='in'?0.8:1.25),0.45,16));
      camera.position.copy(controls.current.target).add(offset);
    }
    controls.current.update(); invalidate();
  },[action,camera,invalidate]);
  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.12} minDistance={0.45} maxDistance={16} enablePan screenSpacePanning rotateSpeed={0.7} />;
}

function Anatomy(props: Props & {onHover: (name: string | null)=>void}) {
  const {scene} = useGLTF('/models/human-brain.glb');
  const meshes = useMemo(()=>{
    const result: {geometry: THREE.BufferGeometry; part: AtlasPart}[] = [];
    scene.traverse(object=>{
      if (object instanceof THREE.Mesh) result.push({geometry:object.geometry,part:object.userData as AtlasPart});
    });
    return result;
  },[scene]);
  const onLoaded = props.onLoaded;
  useEffect(()=>onLoaded(),[onLoaded]);
  const [hovered,setHovered] = useState<string|null>(null);
  const {selectedRegion,selectedPart,layer,hemisphere,isolated,split,activeRegions} = props;
  return <group dispose={null}>{meshes.map(({geometry,part})=>{
    const selected = selectedPart ? selectedPart===part.name : matchesRegion(part.name,selectedRegion);
    const active = activeRegions.some(id=>matchesRegion(part.name,id));
    const auxiliary = /White-Matter|Ventricle|Lat-Vent|\.unknown/.test(part.name);
    if (hemisphere !== 'both' && part.hemisphere !== 'midline' && part.hemisphere !== hemisphere) return null;
    if (isolated && !selected) return null;
    if (!isolated && !selected && (auxiliary || (layer==='deep' && part.cortical))) return null;
    const transparent = !isolated && layer==='transparent' && part.cortical && !selected;
    const color = palette[partCategory(part.name)];
    const x = part.hemisphere==='left' ? -split : part.hemisphere==='right' ? split : 0;
    function select(event: ThreeEvent<MouseEvent>) {
      if (event.delta > 5 || transparent) return;
      event.stopPropagation(); props.onSelectPart(part);
    }
    return <mesh key={part.name} name={part.name} geometry={geometry} position={[x,0,0]}
      onClick={select} raycast={transparent?()=>null:undefined}
      onPointerOver={event=>{if(transparent)return; event.stopPropagation(); setHovered(part.name);props.onHover(`${part.hemisphere==='midline'?'':part.hemisphere+' · '}${partName(part.name)}`);}}
      onPointerOut={()=>{setHovered(null);props.onHover(null);}}>
      <meshStandardMaterial color={selected?'#d97953':color} roughness={0.78} metalness={0}
        emissive={selected?'#a34d29':hovered===part.name?'#9f8465':active?'#705d44':'#000000'}
        emissiveIntensity={selected?0.22:hovered===part.name?0.16:0.1}
        transparent={transparent} opacity={transparent?0.09:1} depthWrite={!transparent} side={THREE.DoubleSide} />
    </mesh>;
  })}</group>;
}

class ModelBoundary extends Component<{children:ReactNode}, {failed:boolean}> {
  state = {failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed ? <div className="model-message" role="alert"><p>The 3D model couldn’t load.</p><span>You can still explore the region guide below.</span><button onClick={()=>window.location.reload()}>Try again</button></div> : this.props.children;}
}

export default function BrainModel(props: Props) {
  const [hovered,setHovered] = useState<string|null>(null);
  const [action,setAction] = useState<CameraAction>({kind:'reset',sequence:0});
  const actionButton = (kind: CameraAction['kind']) => setAction(previous=>({kind,sequence:previous.sequence+1}));
  return <div className={`brain-viewport ${hovered?'is-hovering':''}`}>
    <ModelBoundary>
      <Canvas frameloop="demand" dpr={[1,1.75]} camera={{position:initialCamera,fov:39,near:0.1,far:60}}
        gl={{antialias:true,alpha:true,powerPreference:'high-performance'}}
        fallback={<div className="model-message">Your browser doesn’t support 3D. You can still read and search the anatomical guide.</div>}>
        <ambientLight intensity={0.85} />
        <hemisphereLight args={['#fff8ed','#827365',1.2]} />
        <directionalLight position={[-4,6,5]} intensity={2.2} color="#fff4e7" />
        <directionalLight position={[5,1,-3]} intensity={1.3} color="#d6e4eb" />
        <Suspense fallback={<Html center><div className="model-loading"><Loader2 className="animate-spin" size={22}/><span>Loading human anatomy…</span><small>Detailed 3D model · 17 MB</small></div></Html>}>
          <Anatomy {...props} onHover={setHovered}/>
          <CameraControls action={action} isolated={props.isolated} selectedPart={props.selectedPart} selectedRegion={props.selectedRegion} hemisphere={props.hemisphere} split={props.split}/>
        </Suspense>
      </Canvas>
    </ModelBoundary>
    <div className="view-caption"><span className="status-dot"/> MRI-derived anatomy <span className="view-caption-detail">· Original left & right sides</span></div>
    <div className="hover-label" aria-live="polite">{hovered || (props.isolated?'Isolated selection':props.layer==='deep'?'Deep structures':props.layer==='transparent'?'Transparent cortex':'Cortical surface')}</div>
    <div className="camera-tools" aria-label="Camera controls">
      <button onClick={()=>actionButton('in')} aria-label="Zoom in" title="Zoom in"><Plus size={19}/></button>
      <button onClick={()=>actionButton('out')} aria-label="Zoom out" title="Zoom out"><Minus size={19}/></button><span/>
      <button onClick={()=>actionButton('reset')} aria-label="Reset view" title="Reset view"><RotateCcw size={18}/></button>
    </div>
    <div className="gesture-help"><span><Move size={14}/> Drag to rotate</span><span><Maximize2 size={14}/> Scroll or pinch to zoom</span></div>
  </div>;
}
