import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'wouter'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Tooltip } from '@radix-ui/themes'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import {
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  CornersInIcon,
  CornersOutIcon,
  InfoIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react'
import { SplatRenderer } from '../modules/splat/SplatRenderer'
import { LogoMark } from './LogoMark'
import { findProject, resolveAssetUrl, type GalleryProject } from './projects'

/**
 * Interior-friendly default: eye height just inside the capture, orbiting a
 * target near the room center so the camera stays inside the splat shell.
 * Override per project with `camera` in src/gallery/projects.ts.
 */
const DEFAULT_CAMERA = {
  position: [0, 1.55, -0.2] as [number, number, number],
  target: [-0.2, 1.15, -2] as [number, number, number],
  fov: 70,
}

type LoadStatus = 'loading' | 'ready' | 'error'

export function ViewerPage({ params }: { params: { slug: string } }) {
  const project = findProject(params.slug)
  if (!project) return <ProjectNotFound slug={params.slug} />
  return <SplatViewer project={project} />
}

function SplatViewer({ project }: { project: GalleryProject }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [loadedBytes, setLoadedBytes] = useState(0)
  const [totalBytes, setTotalBytes] = useState<number | undefined>(undefined)
  const [retryToken, setRetryToken] = useState(0)
  const [resetToken, setResetToken] = useState(0)
  const [autoOrbit, setAutoOrbit] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  const camera = project.camera ?? DEFAULT_CAMERA
  const splatUrl = resolveAssetUrl(project.splat.url)
  const flipY = project.splat.flipY ?? true
  const metricScaleFactor = project.splat.metricScaleFactor ?? 1
  const groundPlaneOffset = project.splat.groundPlaneOffset ?? 0

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void containerRef.current?.requestFullscreen?.()
    }
  }, [])

  const resetView = useCallback(() => {
    setResetToken((token) => token + 1)
    setAutoOrbit(true)
  }, [])

  const retry = useCallback(() => {
    setStatus('loading')
    setLoadedBytes(0)
    setTotalBytes(undefined)
    setRetryToken((token) => token + 1)
  }, [])

  const percent = totalBytes ? Math.min(100, Math.round((loadedBytes / totalBytes) * 100)) : undefined

  return (
    <div ref={containerRef} className="relative h-screen w-screen overflow-hidden bg-[#070707]">
      <Canvas
        camera={{ fov: camera.fov ?? 70, near: 0.05, far: 500, position: camera.position }}
        gl={{ antialias: false }}
        className="h-full w-full"
      >
        <color attach="background" args={['#070707']} />
        <SplatRenderer
          key={retryToken}
          url={splatUrl}
          flipY={flipY}
          metricScaleFactor={metricScaleFactor}
          groundPlaneOffset={groundPlaneOffset}
          enableDof={false}
          onProgress={(event) => {
            setLoadedBytes(event.loaded)
            if (event.lengthComputable && event.total > 0) setTotalBytes(event.total)
          }}
          onLoad={() => setStatus('ready')}
          onError={(error) => {
            console.error(`Failed to load splat for "${project.slug}"`, error)
            setStatus('error')
          }}
        />
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.7}
          minDistance={0.15}
          maxDistance={30}
          target={camera.target}
          autoRotate={autoOrbit && status === 'ready'}
          autoRotateSpeed={0.45}
          onStart={() => setAutoOrbit(false)}
        />
        <CameraReset resetToken={resetToken} position={camera.position} target={camera.target} controlsRef={controlsRef} />
      </Canvas>

      {/* legibility gradients */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

      {/* top chrome */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4 md:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <Tooltip content="Back to gallery" side="bottom" delayDuration={0}>
            <Link
              href="/"
              aria-label="Back to gallery"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur transition hover:bg-white/15"
            >
              <ArrowLeftIcon size={17} />
            </Link>
          </Tooltip>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-medium text-white">{project.title}</h1>
            <p className="truncate text-[11px] text-white/50">
              {project.category}
              {project.location ? ` · ${project.location}` : ''}
            </p>
          </div>
        </div>
        <Link href="/" className="hidden items-center gap-2 text-white/70 transition hover:text-white md:flex" aria-label="Image Blaster home">
          <LogoMark size={18} />
          <span className="text-xs font-semibold tracking-wide">Image Blaster</span>
        </Link>
      </div>

      {/* interaction hint */}
      {status === 'ready' && autoOrbit && (
        <div className="pointer-events-none absolute bottom-20 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-[11px] text-white/60 backdrop-blur">
          drag to orbit · scroll to zoom · two fingers to pan
        </div>
      )}

      {/* centered bottom controls */}
      {status === 'ready' && (
        <div className="absolute inset-x-0 bottom-5 z-20 flex justify-center">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/50 p-1.5 backdrop-blur">
            <ViewerControl label="Reset view" onClick={resetView}>
              <ArrowCounterClockwiseIcon size={16} />
            </ViewerControl>
            {project.description && (
              <ViewerControl label="About this project" active={infoOpen} onClick={() => setInfoOpen((open) => !open)}>
                <InfoIcon size={16} />
              </ViewerControl>
            )}
            <ViewerControl label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={toggleFullscreen}>
              {isFullscreen ? <CornersInIcon size={16} /> : <CornersOutIcon size={16} />}
            </ViewerControl>
          </div>
        </div>
      )}

      {/* description panel */}
      {infoOpen && project.description && status === 'ready' && (
        <div className="absolute bottom-20 left-1/2 z-20 w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-md">
          <h2 className="text-sm font-medium text-white">{project.title}</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-white/60">{project.description}</p>
        </div>
      )}

      {/* loading overlay */}
      <div
        className={`absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-[#070707] transition-opacity duration-700 ${
          status === 'loading' ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={status !== 'loading'}
      >
        <LogoMark size={34} className="animate-pulse text-white" />
        <div className="text-center">
          <p className="text-sm font-medium text-white">{project.title}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/40">
            Loading capture
          </p>
        </div>
        <div className="w-52">
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            {percent === undefined ? (
              <div className="gallery-indeterminate h-full w-1/3 rounded-full bg-white/80" />
            ) : (
              <div
                className="h-full rounded-full bg-white/80 transition-[width] duration-300"
                style={{ width: `${percent}%` }}
              />
            )}
          </div>
          <p className="mt-2 text-center text-[11px] tabular-nums text-white/40">
            {percent !== undefined ? `${percent}%` : formatBytes(loadedBytes)}
          </p>
        </div>
      </div>

      {/* error overlay */}
      {status === 'error' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#070707] px-6">
          <div className="gallery-fade-up flex max-w-sm flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/50">
              <WarningCircleIcon size={22} />
            </div>
            <h2 className="mt-5 text-base font-medium text-white">This scene could not load</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/45">
              The splat asset was unreachable or invalid. Check the URL for this project in{' '}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] text-white/70">
                src/gallery/projects.ts
              </code>
              .
            </p>
            <p className="mt-3 max-w-full truncate text-[11px] text-white/30">{splatUrl}</p>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={retry}
                className="rounded-full bg-white px-5 py-2 text-xs font-medium text-black transition hover:bg-white/90"
              >
                Try again
              </button>
              <Link
                href="/"
                className="rounded-full border border-white/15 px-5 py-2 text-xs text-white/70 transition hover:border-white/35 hover:text-white"
              >
                Back to gallery
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ViewerControl({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip content={label} side="top" delayDuration={0}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/15 hover:text-white ${
          active ? 'bg-white/15 text-white' : 'text-white/70'
        }`}
      >
        {children}
      </button>
    </Tooltip>
  )
}

/** Snaps the camera and orbit target back to the project preset when resetToken changes. */
function CameraReset({
  resetToken,
  position,
  target,
  controlsRef,
}: {
  resetToken: number
  position: [number, number, number]
  target: [number, number, number]
  controlsRef: React.RefObject<OrbitControlsImpl | null>
}) {
  const camera = useThree((state) => state.camera)

  useEffect(() => {
    if (resetToken === 0) return
    camera.position.set(...position)
    const controls = controlsRef.current
    if (controls) {
      controls.target.set(...target)
      controls.update()
    }
  }, [resetToken, camera, controlsRef, position, target])

  return null
}

function ProjectNotFound({ slug }: { slug: string }) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#070707] px-6">
      <div className="gallery-fade-up flex max-w-sm flex-col items-center text-center">
        <LogoMark size={30} className="text-white/30" />
        <h1 className="mt-5 text-base font-medium text-white">Project not found</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/45">
          No project with the slug{' '}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] text-white/70">{slug}</code>{' '}
          exists in the gallery.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-white px-5 py-2 text-xs font-medium text-black transition hover:bg-white/90"
        >
          Back to gallery
        </Link>
      </div>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return 'Starting…'
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
