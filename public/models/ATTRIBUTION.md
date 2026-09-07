# Human brain model

Original meshes: **Anderson M. Winkler, Brain for Blender**, Brainder.org.
Source: https://brainder.org/research/brain-for-blender/
License for the original meshes and this derived GLB: **Creative Commons Attribution-ShareAlike 3.0 Unported** — https://creativecommons.org/licenses/by-sa/3.0/

These meshes were reconstructed with FreeSurfer 5.2 from 12 registered and averaged T1-weighted MRI acquisitions of one human brain (0.8 mm isotropic acquisition), acquired at the Research Imaging Institute, University of Texas Health Science Center at San Antonio. They represent one individual's anatomy, not a universal or clinically validated functional map.

Source archives:
- https://s3.us-east-2.amazonaws.com/brainder/software/brain4blender/smallfiles/pial_DK_obj.tar.bz2
- https://s3.us-east-2.amazonaws.com/brainder/software/brain4blender/smallfiles/subcortical_obj.tar.bz2

Changes: OBJ parcels converted to indexed GLB, coordinates uniformly scaled and centered, RAS axes converted for Three.js with winding corrected, vertex normals recomputed. Original left and right meshes retained independently; no mirroring or decimation. Viewer colors are illustrative. Conversion source: `scripts/build-brain.mjs`. To reproduce, extract each archive into `.mesh-cache/` (retaining its directory), then run `node scripts/build-brain.mjs`.

Cortical parcellation: Desikan RS et al. (2006). An automated labeling system for subdividing the human cerebral cortex on MRI scans into gyral based regions of interest. NeuroImage 31(3):968–980. https://doi.org/10.1016/j.neuroimage.2006.01.021

Functional groupings are educational approximations of anatomical parcels. Broca's grouping uses left pars opercularis and pars triangularis. Wernicke's grouping uses left superior temporal and banks of superior temporal sulcus parcels and is explicitly broader than a precise functional boundary. The atlas does not separately segment the hypothalamus; ventral diencephalon is shown only as surrounding context. Cerebellar meshes are reconstructed from volumetric segmentation and do not resolve every fine folium.
