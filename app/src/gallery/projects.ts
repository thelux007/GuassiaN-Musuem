/**
 * Gallery project data source.
 *
 * This is the single place to add, remove, or edit client projects shown on
 * the public gallery. Each entry becomes a card on the landing page and an
 * interactive splat viewer at `/view/<slug>`.
 *
 * To add a client project:
 *   1. Drop the Gaussian splat file (.spz / .splat / .ply / .ksplat) somewhere
 *      the browser can reach it. For local files use `app/public/` (served from
 *      `/`), or the repo `worlds/` directory (served from `/worlds/` in dev).
 *      For production, prefer a CDN / object-storage URL — see the README.
 *   2. Drop a thumbnail image into `app/public/thumbnails/` (or reuse an
 *      existing world thumbnail). Cards without a thumbnail get a tasteful
 *      generated gradient placeholder, so this is optional to start.
 *   3. Add an entry below. Only `slug`, `title`, `category`, and `splat.url`
 *      are required.
 *
 * Asset URLs may be public-relative ("/worlds/...") or absolute
 * ("https://cdn.example.com/..."). Relative URLs are prefixed with
 * `VITE_ASSET_BASE_URL` when it is set, so you can point the whole gallery at
 * a CDN without editing every entry.
 */

export const GALLERY_CATEGORIES = [
  'Architecture',
  'Interiors',
  'Products',
  'Landscapes',
] as const

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number]

export interface GallerySplatAsset {
  /** Public-relative or absolute URL of the Gaussian splat file. */
  url: string
  /** World-units scale applied to the splat (from World Labs semantics). Default 1. */
  metricScaleFactor?: number
  /** Vertical offset so the floor sits at y=0 (from World Labs semantics). Default 0. */
  groundPlaneOffset?: number
  /** World Labs splats are exported y-flipped. Default true. */
  flipY?: boolean
}

export interface GalleryCameraPreset {
  /** Initial camera position in world units. */
  position: [number, number, number]
  /** Initial orbit target in world units. */
  target: [number, number, number]
  fov?: number
}

export interface GalleryProject {
  /** URL-safe unique id; the viewer route is `/view/<slug>`. */
  slug: string
  title: string
  description?: string
  category: GalleryCategory
  /** Optional short location line shown on the card, e.g. "Cape Town, ZA". */
  location?: string
  /** Preview image URL. Omit to show a generated gradient placeholder. */
  thumbnailUrl?: string
  /** Card aspect ratio (width / height) used by the masonry layout. Default 4/3. */
  aspect?: number
  splat: GallerySplatAsset
  /** Optional initial camera; a sensible interior default is used otherwise. */
  camera?: GalleryCameraPreset
  /**
   * Access control hook for later. Everything is 'public' today; when client
   * logins land, mark projects 'private' and gate them in `visibleProjects()`
   * plus a check in the viewer route. No auth is implemented yet.
   */
  visibility?: 'public' | 'private'
}

/** Prefix relative asset URLs with the optional CDN base. */
export function resolveAssetUrl(url: string): string {
  if (/^https?:\/\//.test(url)) return url
  const base = (import.meta.env.VITE_ASSET_BASE_URL as string | undefined) ?? ''
  return `${base.replace(/\/+$/, '')}${url.startsWith('/') ? url : `/${url}`}`
}

export const GALLERY_PROJECTS: GalleryProject[] = [
  {
    slug: 'cape-town-gate-b36',
    title: 'Cape Town Gate B36',
    description:
      'An airport departure lounge captured as a Gaussian splat — a floor-to-ceiling glass curtain wall opening onto the apron, an Airlink jet parked at the jet bridge, and the Gate B36 / Cape Town signage overhead. Generated from a single source image via Image Blaster.',
    category: 'Architecture',
    location: 'Image Blaster world',
    thumbnailUrl: '/worlds/cape-town-gate-b36/output/world/0-world-thumbnail.webp',
    aspect: 16 / 9,
    splat: {
      url: '/worlds/cape-town-gate-b36/output/world/0-world-full_res.spz',
      metricScaleFactor: 2.5501666,
      groundPlaneOffset: 1.6630319,
      flipY: true,
    },
  },

  {
    slug: 'led-room',
    title: 'LED Room',
    description:
      'A moody residential room reconstructed as a Gaussian splat — gray walls, warm LED accents, and soft ambient falloff captured from a single source image.',
    category: 'Interiors',
    location: 'Image Blaster world',
    thumbnailUrl: '/worlds/led-room/output/world/0-world-thumbnail.webp',
    aspect: 4 / 3,
    splat: {
      url: '/worlds/led-room/output/world/0-world-full_res.spz',
      metricScaleFactor: 0.6899165,
      groundPlaneOffset: 1.5678971,
      flipY: true,
    },
  },

  {
    slug: 'red-led-hall',
    title: 'Red LED Hall',
    description:
      'A deep crimson hall captured as a Gaussian splat — a glowing dot-grid light wall, a matching gridded ceiling, and a raised platform edged in light, all wrapped in haze.',
    category: 'Architecture',
    location: 'Image Blaster world',
    thumbnailUrl: '/worlds/red-led-hall/output/world/0-world-thumbnail.webp',
    aspect: 3 / 2,
    splat: {
      url: '/worlds/red-led-hall/output/world/0-world-full_res.spz',
      metricScaleFactor: 0.50195265,
      groundPlaneOffset: 0.7008745,
      flipY: true,
    },
    camera: {
      position: [0, 1.3, 0],
      target: [0, 0.95, 1.7],
    },
  },

  // ---------------------------------------------------------------------
  // DEMO ENTRIES — placeholders so the gallery has content to lay out.
  // They reuse the led-room splat; replace `splat.url` (and the metadata)
  // with each client's real asset, and set a real `thumbnailUrl`.
  // ---------------------------------------------------------------------
  {
    slug: 'concrete-atrium',
    title: 'Concrete Atrium',
    description:
      'Demo project. Swap `splat.url` in src/gallery/projects.ts with your client asset.',
    category: 'Architecture',
    location: 'Demo — replace me',
    aspect: 3 / 4,
    splat: {
      url: '/worlds/led-room/output/world/0-world-full_res.spz',
      metricScaleFactor: 0.6899165,
      groundPlaneOffset: 1.5678971,
    },
  },
  {
    slug: 'studio-vignette',
    title: 'Studio Vignette',
    description:
      'Demo project. Swap `splat.url` in src/gallery/projects.ts with your client asset.',
    category: 'Products',
    location: 'Demo — replace me',
    aspect: 1,
    splat: {
      url: '/worlds/led-room/output/world/0-world-full_res.spz',
      metricScaleFactor: 0.6899165,
      groundPlaneOffset: 1.5678971,
    },
  },
  {
    slug: 'ridge-line',
    title: 'Ridge Line',
    description:
      'Demo project. Swap `splat.url` in src/gallery/projects.ts with your client asset.',
    category: 'Landscapes',
    location: 'Demo — replace me',
    aspect: 16 / 10,
    splat: {
      url: '/worlds/led-room/output/world/0-world-full_res.spz',
      metricScaleFactor: 0.6899165,
      groundPlaneOffset: 1.5678971,
    },
  },
  {
    slug: 'quiet-lobby',
    title: 'Quiet Lobby',
    description:
      'Demo project. Swap `splat.url` in src/gallery/projects.ts with your client asset.',
    category: 'Architecture',
    location: 'Demo — replace me',
    aspect: 4 / 5,
    splat: {
      url: '/worlds/led-room/output/world/0-world-full_res.spz',
      metricScaleFactor: 0.6899165,
      groundPlaneOffset: 1.5678971,
    },
  },
]

/** Projects shown on the public gallery (future: filter out 'private' until unlocked). */
export function visibleProjects(): GalleryProject[] {
  return GALLERY_PROJECTS.filter((project) => project.visibility !== 'private')
}

export function findProject(slug: string): GalleryProject | undefined {
  return GALLERY_PROJECTS.find((project) => project.slug === slug)
}
