<img width="960" height="540" alt="image-blaster-1" src="https://github.com/user-attachments/assets/d294e420-eb48-4f00-b6a8-13005442d1a8" />

## `image-blaster`
Creates 3D environments, SFX, and meshes from a single image using Claude skills, World Labs, and FAL. 

Can take you from an image to a fully meshed 3D environment in < 5 minutes, great for jumpstarting 3D work. Go full blast.


## Quickstart

1. Open a Terminal, enter `git clone https://github.com/neilsonnn/image-blaster`
2. Enter the directory with `cd image-blaster`
3. Run `claude` (install with `curl -fsSL https://claude.ai/install.sh | bash`)
4. Say hello to Claude, and give them your API key for [World Labs](https://platform.worldlabs.ai/) and [FAL](https://fal.ai/).
5. Put an image into `input/` directory and ask Claude to `blast it and confirm each step with me`.

### Description

By default `image-blaster` will use your input image to create:

1. 3D models (`.glb`, `.obj`) of all *dynamic* objects
2. Gaussian splat (`.spz`) of the *static* environment,
3. Ambient looping sound and object specific physics SFX (`.mp3`)

### Extensions

You can embed `image-blaster` under the assets of *any game engine, DCC software, or web app*.

1. Unity, Unreal, or Godot game engine
2. Blender, 3DS Max, or Maya or other DCC software
3. Three.js web app or Electron app

## Advanced

IMAGE-BLASTER uses a few generation models:

- `marble-1.1` - World Labs Marble model creates the explorable environment.
- `nano-banana` - default image edit preference for source cleanup, clean plates, and object reference images.
- `gpt-image-2` - alternate image edit provider when the edit skill is asked to prefer it.
- `hunyuan-3d` - Hunyuan 3D model creates 3D object models through FAL.
- `elevenlabs-sfx` - ElevenLabs sound effects model creates ambient and object-specific sounds.

3D model creation supports these Hunyuan parameters:

- `--face-count <40000-1500000>`: target face count. IMAGE-BLASTER defaults to `50000`; Hunyuan's API default is `500000`.
- `--enable-pbr true|false`: enable PBR material generation. Defaults to `true`.
- `--generate-type Normal|LowPoly|Geometry`: `Normal` creates a textured model, `LowPoly` applies polygon reduction, and `Geometry` creates a white geometry-only model. Defaults to `Normal`.
- `--polygon-type triangle|quadrilateral`: polygon type for `LowPoly`. Defaults to `triangle`.

### Examples

- Video game level concepts? `IMAGE-BLAST` it.
- Your childhood bedroom? `IMAGE-BLAST` it.
- Need an environment for a robot? `IMAGE-BLAST` it.
- A film location scout? `IMAGE-BLAST` it.
- An architectural rendering? `IMAGE-BLAST` it.

## Client Gallery Website

The app now ships with a public-facing gallery for showcasing Gaussian splat captures:

- `/` — dark, image-first gallery landing page with search and category filters.
- `/view/<slug>` — full-screen interactive splat viewer (orbit, reset view, fullscreen, loading progress, graceful error screen).
- `/<world-slug>` and `/<world-slug>/edit` — the original Image Blaster world editor, unchanged.

### Run locally

```bash
bun install && bun run dev      # or: npm install --prefix app && npm run dev --prefix app
```

Then open `http://localhost:5173/`.

### Add a project to the gallery

All gallery content lives in one typed file: [`app/src/gallery/projects.ts`](app/src/gallery/projects.ts).
Add an entry to `GALLERY_PROJECTS`:

```ts
{
  slug: 'client-loft',                     // viewer route: /view/client-loft
  title: 'Client Loft',
  description: 'Shown in the viewer info panel.',
  category: 'Interiors',                   // Architecture | Interiors | Products | Landscapes
  location: 'Cape Town, ZA',               // optional card subtitle
  thumbnailUrl: '/thumbnails/client-loft.webp',
  aspect: 4 / 3,                           // card aspect ratio in the masonry grid
  splat: {
    url: 'https://cdn.example.com/splats/client-loft.spz',
    metricScaleFactor: 0.69,               // from the World Labs semantics metadata
    groundPlaneOffset: 1.57,
    flipY: true,
  },
  camera: {                                // optional initial framing
    position: [0, 1.55, -0.2],
    target: [-0.2, 1.15, -2],
  },
}
```

Where files go:

- **Thumbnails** — `app/public/thumbnails/` (referenced as `/thumbnails/<file>`), or reuse a
  generated world thumbnail like `/worlds/<slug>/output/world/0-world-thumbnail.webp`.
  Entries without a thumbnail get a tasteful generated gradient placeholder.
- **Splat assets** (`.spz`) — during development, world files in `worlds/` are served at
  `/worlds/...` automatically. For small local demos you can also put files in `app/public/`.
- Projects have a `visibility` field reserved for future password-protected/private client
  projects; nothing is gated yet.

### Deploy the gallery publicly

```bash
bun run build                              # outputs app/dist/
```

`app/dist/` is a static site — host it on Netlify, Vercel, Cloudflare Pages, or any static
host.

**Vercel (zero config)**: the root [`vercel.json`](vercel.json) already sets the install/build
commands, output directory, and SPA rewrites — import the GitHub repo at
[vercel.com/new](https://vercel.com/new) and deploy with all defaults.

For other hosts, two things to configure:

1. **SPA fallback**: rewrite all routes to `/index.html` (e.g. Netlify `/_redirects`:
   `/*  /index.html  200`) so `/view/<slug>` deep links work.
2. **Splat hosting**: serve large `.spz` files from CDN/object storage (Cloudflare R2, S3 +
   CloudFront, Bunny, etc.), **not** bundled into the repo or build — they are tens of
   megabytes each. Use absolute URLs in `projects.ts`, or set `VITE_ASSET_BASE_URL` in `.env`
   to prefix every relative asset URL with your CDN origin at build time. Make sure the
   bucket sends permissive CORS headers (`Access-Control-Allow-Origin`) for your site.

Anything placed in `app/public/` (thumbnails, small demo splats) is copied into the build
as-is. The dev-only `/worlds/...` middleware does not exist in production, so worlds you
want public must be uploaded to your CDN (or copied into `app/public/worlds/...`).

### Development

- remove `/app` from the `.claudeignore` file to give Claude the ability to change the React viewer.
