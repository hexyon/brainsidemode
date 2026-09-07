export type Layer = 'surface' | 'transparent' | 'deep';
export type Hemisphere = 'both' | 'left' | 'right';
export interface AtlasPart {
  name: string;
  cortical: boolean;
  hemisphere: 'left' | 'right' | 'midline';
  vertices: number;
  triangles: number;
  center: [number, number, number];
}
export interface AtlasManifest { parts: AtlasPart[]; triangles: number; }

const frontal = ['rostralmiddlefrontal','caudalmiddlefrontal','superiorfrontal','lateralorbitofrontal','medialorbitofrontal','frontalpole','parsorbitalis'];
const parietal = ['postcentral','superiorparietal','inferiorparietal','supramarginal','precuneus'];
const temporal = ['superiortemporal','middletemporal','inferiortemporal','transversetemporal','temporalpole','bankssts','fusiform','entorhinal','parahippocampal'];
const visual = ['lateraloccipital','cuneus','pericalcarine','lingual'];
export const regionParcels: Record<string,string[]> = {
  prefrontal: frontal, motor: ['precentral'], sensory: ['postcentral'], visual,
  auditory: ['transversetemporal'], broca: ['lh.parsopercularis','lh.parstriangularis'],
  wernicke: ['lh.superiortemporal','lh.bankssts'], parietal, temporal,
  hippocampus: ['Hippocampus'], amygdala: ['Amygdala'], cerebellum: ['Cerebellum-Cortex'],
  thalamus: ['Thalamus-Proper'], hypothalamus: ['VentralDC'], brainstem: ['Brain-Stem'],
};
export const parcelKey = (name: string) => name.replace(/^(lh\.|rh\.|Left-|Right-)/,'');
export function matchesRegion(name: string, id: string | null) {
  return !!id && (regionParcels[id] || []).some(key => key === name || key === parcelKey(name));
}
export const deepRegions = new Set(['hippocampus','amygdala','thalamus','hypothalamus']);
export const palette: Record<string,string> = {
  Frontal: '#cb967f', Parietal: '#a4b49c', Temporal: '#c4abc2', Occipital: '#91aeba',
  Limbic: '#d4b77c', Cerebellum: '#b1a6c4', Brainstem: '#bb9b80', Other: '#c9bfb0',
};
export function partCategory(name: string) {
  const key = parcelKey(name);
  if (frontal.includes(key) || ['precentral','paracentral','parsopercularis','parstriangularis'].includes(key)) return 'Frontal';
  if (parietal.includes(key)) return 'Parietal';
  if (temporal.includes(key)) return 'Temporal';
  if (visual.includes(key)) return 'Occipital';
  if (key.includes('Cerebellum')) return 'Cerebellum';
  if (key === 'Brain-Stem') return 'Brainstem';
  if (/cingulate|Hippocampus|Amygdala/.test(key)) return 'Limbic';
  return 'Other';
}
const names: Record<string,string> = {
  bankssts: 'Banks of the superior temporal sulcus', caudalanteriorcingulate: 'Caudal anterior cingulate',
  caudalmiddlefrontal: 'Caudal middle frontal gyrus', cuneus:'Cuneus', entorhinal:'Entorhinal cortex',
  frontalpole:'Frontal pole', fusiform:'Fusiform gyrus', inferiorparietal:'Inferior parietal cortex',
  inferiortemporal:'Inferior temporal gyrus', insula:'Insula', isthmuscingulate:'Isthmus of cingulate gyrus',
  lateraloccipital:'Lateral occipital cortex', lateralorbitofrontal:'Lateral orbitofrontal cortex',
  lingual:'Lingual gyrus', medialorbitofrontal:'Medial orbitofrontal cortex', middletemporal:'Middle temporal gyrus',
  paracentral:'Paracentral lobule', parahippocampal:'Parahippocampal gyrus', parsopercularis:'Pars opercularis',
  parsorbitalis:'Pars orbitalis', parstriangularis:'Pars triangularis', pericalcarine:'Pericalcarine cortex',
  postcentral:'Postcentral gyrus', posteriorcingulate:'Posterior cingulate cortex', precentral:'Precentral gyrus',
  precuneus:'Precuneus', rostralanteriorcingulate:'Rostral anterior cingulate', rostralmiddlefrontal:'Rostral middle frontal gyrus',
  superiorfrontal:'Superior frontal gyrus', superiorparietal:'Superior parietal cortex', superiortemporal:'Superior temporal gyrus',
  supramarginal:'Supramarginal gyrus', temporalpole:'Temporal pole', transversetemporal:'Transverse temporal cortex (Heschl’s gyri)',
  unknown:'Unassigned medial surface', 'VentralDC':'Ventral diencephalon', 'Thalamus-Proper':'Thalamus',
  'Accumbens-area':'Nucleus accumbens', 'Inf-Lat-Vent':'Inferior lateral ventricle',
  CC_Anterior:'Corpus callosum · anterior', CC_Central:'Corpus callosum · central',
  CC_Mid_Anterior:'Corpus callosum · mid-anterior', CC_Mid_Posterior:'Corpus callosum · mid-posterior', CC_Posterior:'Corpus callosum · posterior',
};
export function partName(name: string) {
  const key = parcelKey(name);
  return names[key] || key.replace(/-/g,' ');
}
export function regionForPart(name: string) {
  return ['motor','sensory','auditory','broca','wernicke','prefrontal','visual','hippocampus','amygdala','cerebellum','thalamus','hypothalamus','brainstem','parietal','temporal'].find(id=>matchesRegion(name,id)) || null;
}
export const regionNotes: Record<string,string> = {
  prefrontal:'Highlight: a grouping of frontal anatomical parcels. Functional prefrontal boundaries do not precisely follow this atlas.',
  motor:'The precentral gyrus approximates primary motor cortex. Premotor and supplementary motor areas are not included in this highlight.',
  sensory:'The postcentral gyrus approximates primary somatosensory cortex. Other somatosensory areas also contribute.',
  visual:'Several occipital parcels are shown. Primary visual cortex is mainly on the medial surface around the calcarine sulcus; choose one hemisphere to look inside.',
  auditory:'The transverse temporal parcel approximates primary auditory cortex. It is tucked inside the lateral sulcus, so isolate this part for a closer look.',
  broca:'Left pars opercularis and pars triangularis approximate the classical Broca region. Language dominance and functional boundaries vary between people.',
  wernicke:'Approximate context: left superior temporal cortex and banks of the superior temporal sulcus. This atlas does not isolate the classical posterior language area; the highlight is broader.',
  hypothalamus:'Surrounding context only: the ventral diencephalon contains the hypothalamus and other structures. This dataset does not provide a separate hypothalamus mesh.',
  parietal:'Includes the postcentral gyrus, superior and inferior parietal cortex, supramarginal gyrus, and precuneus.',
  cerebellum:'Reconstructed from a volumetric segmentation. Its overall shape is preserved, but the finest cerebellar folds are not resolved.',
};
