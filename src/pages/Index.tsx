import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Brain, Moon, Sun, Search, ArrowUpRight, X, Layers3, CircleDot, Scan, ChevronDown } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Slider } from '@/components/ui/slider';
import SearchBar from '@/components/SearchBar';
import RegionInfo from '@/components/RegionInfo';
import { brainRegions } from '@/data/brainRegions';
import { deepRegions, palette, partName, regionForPart, type AtlasManifest, type AtlasPart, type Hemisphere, type Layer } from '@/data/anatomy';
import { useAIBrainAnalysis } from '@/hooks/useAIBrainAnalysis';
const BrainModel = lazy(()=>import('@/components/BrainModel'));

export default function Index() {
  const [dark,setDark] = useState(false);
  const [selectedRegion,setSelectedRegion] = useState<string|null>('prefrontal');
  const [selectedPart,setSelectedPart] = useState<AtlasPart|null>(null);
  const [layer,setLayer] = useState<Layer>('surface');
  const [hemisphere,setHemisphere] = useState<Hemisphere>('both');
  const [isolated,setIsolated] = useState(false);
  const [split,setSplit] = useState(0);
  const [filter,setFilter] = useState('');
  const [atlasFilter,setAtlasFilter] = useState('');
  const [manifest,setManifest] = useState<AtlasManifest|null>(null);
  const [atlasError,setAtlasError] = useState(false);
  const [loaded,setLoaded] = useState(false);
  const {analyze,isAnalyzing,result,error,reset} = useAIBrainAnalysis();
  const onLoaded = useCallback(()=>setLoaded(true),[]);
  function showExplorer() {
    document.getElementById('brain-explorer')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  }
  useEffect(()=>{document.documentElement.classList.toggle('dark',dark);},[dark]);
  useEffect(()=>{
    const controller = new AbortController();
    fetch('/models/manifest.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(setManifest).catch(e=>{if(e.name!=='AbortError')setAtlasError(true);});
    return ()=>controller.abort();
  },[]);
  function selectRegion(id:string) {
    setSelectedRegion(id);setSelectedPart(null);setIsolated(false);setSplit(0);setHemisphere('both');
    setLayer(deepRegions.has(id)?'transparent':'surface');
    if(id==='auditory')setIsolated(true);
  }
  function selectPart(part:AtlasPart) {
    setSelectedPart(part);setSelectedRegion(regionForPart(part.name));setIsolated(false);
    setHemisphere('both');setLayer(part.cortical?'surface':'transparent');
    // Buried atlas parcels need an unobstructed view when selected from the list.
    if(/White-Matter|Ventricle|Lat-Vent|\.unknown|insula|transversetemporal/.test(part.name))setIsolated(true);
  }
  async function searchActivity(query:string) {
    const response = await analyze(query);
    const first = response?.regions.find(id=>brainRegions.some(r=>r.id===id));
    if(first) selectRegion(first);
  }
  const filtered = brainRegions.filter(r=>`${r.name} ${r.category} ${r.functions.join(' ')}`.toLowerCase().includes(filter.toLowerCase()));
  const activeRegions = (result?.regions || []).filter(id=>brainRegions.some(r=>r.id===id));
  return <main className="app-shell">
    <header className="site-header">
      <a href="/" className="wordmark" aria-label="Brain Side home"><img src="/favicon.ico" alt="Brain Side" className="brand-logo"/></a>
      <div className="header-right"><span className="edition-label">A field guide to you</span><button className="theme-button" aria-label={dark?'Switch to light mode':'Switch to dark mode'} onClick={()=>setDark(!dark)}>{dark?<Sun size={19}/>:<Moon size={19}/>}</button></div>
    </header>
    <section className="intro"><div><p className="eyebrow">THE HUMAN BRAIN, A LITTLE CLOSER</p><h1>A world inside <em>your mind.</em></h1></div><p>Turn it. Explore it. Get to know the<br className="desktop-break"/> remarkable parts that make you, you.</p></section>
    <div className="explorer-layout">
      <section id="brain-explorer" className="explorer" aria-label="Interactive human brain">
        <div className="explorer-toolbar">
          <ToggleGroup type="single" value={layer} onValueChange={(value:Layer)=>{if(value){setLayer(value);setIsolated(false);if(value==='deep' && !deepRegions.has(selectedRegion || '') && selectedPart?.cortical!==false){setSelectedRegion(null);setSelectedPart(null);}}}} aria-label="Anatomical layer" className="segment-control">
            <ToggleGroupItem value="surface"><CircleDot size={15}/>Surface</ToggleGroupItem>
            <ToggleGroupItem value="transparent"><Scan size={15}/>See through</ToggleGroupItem>
            <ToggleGroupItem value="deep"><Layers3 size={15}/>Inside</ToggleGroupItem>
          </ToggleGroup>
          <span className="model-tag">3D ATLAS</span>
        </div>
        <Suspense fallback={<div className="brain-viewport model-message">Preparing your brain explorer…</div>}>
          <BrainModel selectedRegion={selectedRegion} selectedPart={selectedPart?.name || null} activeRegions={activeRegions} layer={layer} hemisphere={hemisphere} isolated={isolated} split={split} onSelectPart={selectPart} onLoaded={onLoaded}/>
        </Suspense>
        <div className="explorer-bottom">
          <div className="hemisphere-control"><span>Hemisphere</span><ToggleGroup type="single" value={hemisphere} onValueChange={(value:Hemisphere)=>{if(value){setHemisphere(value);if(value==='right' && ['broca','wernicke'].includes(selectedRegion || '')){setSelectedRegion(null);setIsolated(false);}if(selectedPart && value!=='both' && selectedPart.hemisphere!=='midline' && selectedPart.hemisphere!==value){setSelectedPart(null);setSelectedRegion(null);setIsolated(false);}}}} aria-label="Hemisphere" className="hemisphere-buttons"><ToggleGroupItem value="both">Both</ToggleGroupItem><ToggleGroupItem value="left">Left</ToggleGroupItem><ToggleGroupItem value="right">Right</ToggleGroupItem></ToggleGroup></div>
          <div className="split-control"><label id="split-label">Separate sides</label><Slider aria-labelledby="split-label" value={[split]} min={0} max={1.2} step={0.05} disabled={hemisphere!=='both'} onValueChange={([v])=>setSplit(v)}/></div>
        </div>
        <div className="color-legend" aria-label="Anatomical color key">{Object.entries(palette).filter(([key])=>['Frontal','Parietal','Temporal','Occipital','Cerebellum'].includes(key)).map(([name,color])=><span key={name}><i style={{background:color}}/>{name}</span>)}<span><i style={{background:'#d97953'}}/>Selected</span></div>
      </section>
      <RegionInfo regionId={selectedRegion} part={selectedPart} isolated={isolated} onIsolate={()=>setIsolated(!isolated)}/>
    </div>
    <section className="curiosity-section" aria-labelledby="activity-title"><div className="section-heading"><div><p className="eyebrow">MAKE A CONNECTION</p><h2 id="activity-title">What’s on your mind?</h2></div><p>Explore the regions that may help with an everyday activity.</p></div><SearchBar onSearch={searchActivity} isLoading={isAnalyzing}/>
      {isAnalyzing && <p role="status" className="analysis-status">Finding connections across the brain…</p>}
      {error && <p role="alert" className="inline-error">We couldn’t explore that activity right now. You can try again or browse the atlas below.</p>}
      {result && <div className="activity-result"><div><span className="eyebrow">AI-GENERATED EXPLANATION</span><button className="theme-button" aria-label="Clear activity result" onClick={reset}><X size={17}/></button></div><p>{result.description}</p><div className="activity-regions">{activeRegions.map(id=><button key={id} onClick={()=>{selectRegion(id);showExplorer();}}>{brainRegions.find(r=>r.id===id)?.name}<ArrowUpRight size={14}/></button>)}</div><small>Suggested associations, not measured brain activity. Most activities involve many regions working together.</small></div>}
    </section>
    <section className="region-guide" aria-labelledby="guide-title"><div className="section-heading"><div><p className="eyebrow">FOLLOW YOUR CURIOSITY</p><h2 id="guide-title">One brain. Many little wonders.</h2></div><label className="region-filter"><Search size={17}/><input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Find a region or function" aria-label="Find a brain region"/></label></div>
      <div className="region-grid">{filtered.map((region,index)=><button key={region.id} className={`region-row ${selectedRegion===region.id && !selectedPart?'is-selected':''}`} onClick={()=>{selectRegion(region.id);showExplorer();}} aria-pressed={selectedRegion===region.id && !selectedPart}><span className="region-number">{String(index+1).padStart(2,'0')}</span><span><strong>{region.name}</strong><small>{region.category}</small></span><ArrowUpRight size={18}/></button>)}</div>
      {!filtered.length && <p className="empty-state">No regions found. Try “memory”, “motor”, or “temporal”.</p>}
      <details className="full-atlas"><summary><span>Explore every anatomical part <small>{manifest?`${manifest.parts.length} MRI-derived meshes`:'Full atlas'}</small></span><ChevronDown size={19}/></summary><label className="region-filter"><Search size={17}/><input placeholder="Search the full atlas" aria-label="Search all anatomical parts" value={atlasFilter} onChange={e=>setAtlasFilter(e.target.value)}/></label><div className="atlas-list">{manifest?.parts.filter(p=>`${partName(p.name)} ${p.hemisphere}`.toLowerCase().includes(atlasFilter.toLowerCase())).map(p=><button key={p.name} onClick={()=>{selectPart(p);showExplorer();}} aria-pressed={selectedPart?.name===p.name}><span>{partName(p.name)}</span><small>{p.hemisphere}</small></button>)}</div>{atlasError && <p role="alert">The full atlas list couldn’t load. Reload the page to retry.</p>}{manifest && !manifest.parts.some(p=>`${partName(p.name)} ${p.hemisphere}`.toLowerCase().includes(atlasFilter.toLowerCase())) && <p>No anatomical parts match that search.</p>}</details>
    </section>
    <footer><span className="footer-brand"><Brain size={18}/> A little more understanding. A little more wonder.</span><p>Human MRI meshes by <a href="https://brainder.org/research/brain-for-blender/" target="_blank" rel="noreferrer">Anderson Winkler / Brainder</a> · <a href="/models/ATTRIBUTION.md" target="_blank" rel="noreferrer">CC BY-SA 3.0 & model notes</a>{loaded && manifest && <span> · {(manifest.triangles/1000).toFixed(0)}k triangles</span>}</p><p>One individual’s anatomy. Illustrative colors. Functional highlights are approximate.</p></footer>
  </main>;
}
