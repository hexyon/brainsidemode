import { ArrowUpRight, Focus } from 'lucide-react';
import { getRegionById } from '@/data/brainRegions';
import { partName, regionNotes, type AtlasPart } from '@/data/anatomy';

interface Props {regionId:string|null; part:AtlasPart|null; isolated:boolean; onIsolate:()=>void;}
export default function RegionInfo({regionId,part,isolated,onIsolate}:Props) {
  const region = regionId ? getRegionById(regionId) : null;
  const title = part ? partName(part.name) : region?.name;
  if (!title) return <aside className="region-story"><p className="eyebrow">A little curiosity goes a long way</p><h2>Meet your mind.</h2><p>Turn the brain around and choose a part. We’ll explore what it does, where it lives, and how it works with the rest.</p><span className="story-hint">You can also choose a region from the guide below.</span></aside>;
  return <aside className="region-story" aria-live="polite" aria-atomic="true">
    <p className="eyebrow">{part ? `${part.hemisphere==='midline'?'Midline':part.hemisphere+' hemisphere'} · ${part.cortical?'Cortex':'Inner anatomy'}` : region?.category}</p>
    <h2>{title}</h2>
    {part && region && <p className="region-parent">Part of your {region.name.toLowerCase()} guide</p>}
    <p className="region-description">{region?.description || 'An individually segmented anatomical structure from the MRI-derived atlas. Explore its shape and its position relative to the surrounding brain.'}</p>
    {region && <><h3>What it helps with</h3><ul className="function-list">{region.functions.map(f=><li key={f}>{f}</li>)}</ul></>}
    <button className={`isolate-button ${isolated?'selected':''}`} onClick={onIsolate} aria-pressed={isolated}><Focus size={17}/>{isolated?'Show surrounding brain':'Isolate this selection'}</button>
    <div className="anatomy-note"><h3>About this highlight</h3><p>{regionNotes[regionId || ''] || (part ? 'This is an anatomical atlas parcel. Its shape comes from one person’s MRI; functional boundaries and individual anatomy vary.' : 'Both anatomical sides are highlighted. These structures work with distributed networks across the brain.')}</p></div>
    <a className="text-link" href="https://brainder.org/research/brain-for-blender/" target="_blank" rel="noreferrer">Explore the model’s source <ArrowUpRight size={15}/></a>
  </aside>;
}
