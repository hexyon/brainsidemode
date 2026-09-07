import { describe, expect, it } from 'vitest';
import { matchesRegion, regionForPart, regionNotes } from '@/data/anatomy';

describe('anatomical highlighting safeguards',()=>{
  it('includes primary somatosensory cortex in the parietal lobe',()=>{
    expect(matchesRegion('lh.postcentral','parietal')).toBe(true);
    expect(matchesRegion('rh.postcentral','sensory')).toBe(true);
    expect(matchesRegion('lh.precentral','parietal')).toBe(false);
  });
  it('uses transverse temporal cortex for primary auditory anatomy, not the thalamus',()=>{
    expect(matchesRegion('lh.transversetemporal','auditory')).toBe(true);
    expect(matchesRegion('rh.transversetemporal','auditory')).toBe(true);
    expect(matchesRegion('Left-Thalamus-Proper','auditory')).toBe(false);
  });
  it('keeps left language proxies separate from their right homologues',()=>{
    expect(matchesRegion('lh.parsopercularis','broca')).toBe(true);
    expect(matchesRegion('rh.parsopercularis','broca')).toBe(false);
    expect(matchesRegion('lh.superiortemporal','wernicke')).toBe(true);
    expect(matchesRegion('rh.superiortemporal','wernicke')).toBe(false);
    expect(regionNotes.wernicke).toContain('broader');
  });
  it('does not confuse hippocampus, amygdala, and thalamus',()=>{
    expect(regionForPart('Left-Hippocampus')).toBe('hippocampus');
    expect(regionForPart('Right-Amygdala')).toBe('amygdala');
    expect(matchesRegion('Left-Thalamus-Proper','hippocampus')).toBe(false);
  });
  it('discloses that ventral diencephalon is only hypothalamus context',()=>{
    expect(matchesRegion('Left-VentralDC','hypothalamus')).toBe(true);
    expect(regionNotes.hypothalamus).toContain('does not provide a separate hypothalamus mesh');
  });
});
