# Asset Pipeline

HomeForge can move toward realistic assets by using glTF/GLB models.

## Recommended Source Format

- Use `.glb` for single-file models with embedded geometry, materials, and textures.
- Keep each room-scale object centered at the origin.
- Use real-world scale. In this app, 1 Three.js unit is treated as 1 meter.
- Keep the model's floor contact point at `Y = 0`.
- Face the model toward negative Z when possible, matching the current procedural assets.

## Where To Put Models

Place model files in:

```text
public/models/
```

Example:

```text
public/models/sofa-modern.glb
public/models/kitchen-fridge.glb
public/models/houseplant.glb
```

Files under `public/` are served by Vite at `/models/<filename>.glb`.

## Good Asset Sources

- Poly Haven: free CC0 textures and some models.
- Sketchfab: use only downloadable assets with a license that permits your use.
- BlenderKit: useful if you prepare assets in Blender first.
- Kenney: good lightweight game-ready assets.
- Custom Blender exports: best long-term control over scale and style.

## What To Check Before Importing

- File size: aim for under 1-3 MB per furniture item for browser performance.
- Texture size: 1K textures are usually enough for this app.
- Polygon count: low to medium poly is better for many placed objects.
- License: track attribution requirements before committing assets.

## Next Implementation Step

The app needs a `GLTFLoader` registry that maps catalog assets to model files, then falls back to the current procedural geometry when a model is missing. This lets the catalog gradually move from prototype geometry to realistic GLB assets without breaking existing saves.
