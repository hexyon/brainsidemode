# Brain Side

An interactive, MRI-derived human brain atlas built with React, Three.js, React Three Fiber, and Vite. The model contains 102 original meshes and 923,667 triangles. Both hemispheres use their original anatomy, not mirrored copies.

## Run locally

```sh
npm ci
npm run dev
```

The anatomical explorer works from local assets. Activity explanations use the existing Supabase `analyze-brain-activity` function; configure the public client environment variables from `.env.example` for that feature. Never commit `.env`.

## Validation

```sh
node node_modules/typescript/bin/tsc --noEmit -p tsconfig.app.json
npm test
node scripts/verify-brain.mjs
npm run build
```

## Anatomy and licensing

Mesh source: Anderson M. Winkler's [Brain for Blender](https://brainder.org/research/brain-for-blender/), licensed CC BY-SA 3.0. See [model attribution and reproduction instructions](public/models/ATTRIBUTION.md). The converted model keeps the source mesh resolution. Fine cerebellar folia are limited by the source segmentation.

Desikan–Killiany parcels are anatomical, not precise functional maps. Broca's and Wernicke's groupings are clearly labeled approximations. The hypothalamus is not independently segmented; surrounding ventral diencephalon is explicitly identified as context. Colors are illustrative. The interface offers surface, transparent, deep, hemisphere separation, selection isolation, and a keyboard-accessible list of every atlas part.
