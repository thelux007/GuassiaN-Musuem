import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'wouter'
import { Tooltip } from '@radix-ui/themes'
import {
  ArrowUpRightIcon,
  CubeIcon,
  ImagesIcon,
  MagnifyingGlassIcon,
  SquaresFourIcon,
  XIcon,
} from '@phosphor-icons/react'
import { LogoMark } from './LogoMark'
import {
  GALLERY_CATEGORIES,
  visibleProjects,
  type GalleryCategory,
  type GalleryProject,
} from './projects'

type CategoryFilter = 'All Projects' | GalleryCategory
const FILTERS: CategoryFilter[] = ['All Projects', ...GALLERY_CATEGORIES]

export function GalleryPage() {
  const projects = useMemo(() => visibleProjects(), [])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<CategoryFilter>('All Projects')
  const [booting, setBooting] = useState(true)
  const searchRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Brief skeleton pass so the grid settles in instead of popping.
  useEffect(() => {
    const timeout = window.setTimeout(() => setBooting(false), 350)
    return () => window.clearTimeout(timeout)
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return projects.filter((project) => {
      if (filter !== 'All Projects' && project.category !== filter) return false
      if (!needle) return true
      return [project.title, project.location, project.description, project.category]
        .filter(Boolean)
        .some((text) => String(text).toLowerCase().includes(needle))
    })
  }, [projects, query, filter])

  const clearFilters = () => {
    setQuery('')
    setFilter('All Projects')
  }

  return (
    <div
      ref={scrollRef}
      className="h-screen w-screen overflow-y-auto overflow-x-hidden bg-[#070707] text-neutral-200 select-text"
    >
      <NavRail
        onHome={() => {
          clearFilters()
          scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onSearch={() => searchRef.current?.focus()}
      />
      <MobileHeader />

      <main className="md:pl-16">
        {/* hero */}
        <header className="mx-auto max-w-2xl px-6 pb-10 pt-14 text-center md:pt-24 gallery-fade-up">
          <div className="mb-5 hidden items-center justify-center gap-2 md:flex">
            <LogoMark size={26} className="text-white" />
            <span className="text-sm font-semibold tracking-wide text-white">Image Blaster</span>
          </div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/40">
            Gaussian splat gallery
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-[2.6rem] md:leading-[1.1]">
            Real spaces, explorable
            <br className="hidden md:block" /> in your browser.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/50">
            A curated collection of photoreal 3D captures. Open any project and move through it
            like you are standing there.
          </p>

          {/* search */}
          <div className="relative mx-auto mt-8 max-w-md">
            <MagnifyingGlassIcon
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
            />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              placeholder="Search projects…"
              aria-label="Search projects"
              className="h-11 w-full rounded-full border border-white/10 bg-white/[0.04] pl-10 pr-10 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-white/25 focus:bg-white/[0.07] [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
              >
                <XIcon size={14} />
              </button>
            )}
          </div>

          {/* category chips */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {FILTERS.map((option) => {
              const active = option === filter
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  aria-pressed={active}
                  className={
                    active
                      ? 'rounded-full bg-white px-4 py-1.5 text-xs font-medium text-black transition'
                      : 'rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs text-white/60 transition hover:border-white/25 hover:text-white'
                  }
                >
                  {option}
                </button>
              )
            })}
          </div>
        </header>

        {/* gallery */}
        <section className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
          {booting ? (
            <SkeletonGrid />
          ) : projects.length === 0 ? (
            <EmptyState />
          ) : filtered.length === 0 ? (
            <NoResults onClear={clearFilters} />
          ) : (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
              {filtered.map((project, index) => (
                <ProjectCard key={project.slug} project={project} index={index} />
              ))}
            </div>
          )}
        </section>

        <footer className="border-t border-white/[0.06] px-6 py-8 md:pl-16">
          <div className="mx-auto flex max-w-7xl items-center justify-between text-[11px] text-white/30">
            <span className="flex items-center gap-2">
              <LogoMark size={14} /> Image Blaster
            </span>
            <span>Gaussian splats, rendered live with Spark</span>
          </div>
        </footer>
      </main>
    </div>
  )
}

function NavRail({ onHome, onSearch }: { onHome: () => void; onSearch: () => void }) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-y-0 left-0 z-40 hidden w-16 flex-col items-center border-r border-white/[0.06] bg-[#0a0a0a]/90 py-5 backdrop-blur md:flex"
    >
      <Tooltip content="Image Blaster" side="right" delayDuration={0}>
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition hover:bg-white/10"
          aria-label="Image Blaster home"
        >
          <LogoMark size={22} />
        </Link>
      </Tooltip>

      <div className="mt-6 flex flex-col items-center gap-2">
        <RailButton label="Gallery" onClick={onHome} active>
          <SquaresFourIcon size={19} />
        </RailButton>
        <RailButton label="Search projects" onClick={onSearch}>
          <MagnifyingGlassIcon size={19} />
        </RailButton>
      </div>

      <div className="mt-auto flex flex-col items-center gap-2">
        <Tooltip content="World editor" side="right" delayDuration={0}>
          <Link
            href="/led-room"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white/45 transition hover:bg-white/10 hover:text-white"
            aria-label="Open world editor"
          >
            <CubeIcon size={19} />
          </Link>
        </Tooltip>
      </div>
    </nav>
  )
}

function RailButton({
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
    <Tooltip content={label} side="right" delayDuration={0}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-white/10 hover:text-white ${
          active ? 'bg-white/[0.07] text-white' : 'text-white/45'
        }`}
      >
        {children}
      </button>
    </Tooltip>
  )
}

function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#070707]/85 px-4 backdrop-blur md:hidden">
      <Link href="/" className="flex items-center gap-2 text-white" aria-label="Image Blaster home">
        <LogoMark size={20} />
        <span className="text-sm font-semibold tracking-wide">Image Blaster</span>
      </Link>
      <Link
        href="/led-room"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
        aria-label="Open world editor"
      >
        <CubeIcon size={18} />
      </Link>
    </header>
  )
}

function ProjectCard({ project, index }: { project: GalleryProject; index: number }) {
  const aspect = project.aspect ?? 4 / 3
  return (
    <Link
      href={`/view/${project.slug}`}
      className="group mb-4 block break-inside-avoid gallery-fade-up"
      style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}
    >
      <article className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#101010] transition-colors duration-300 group-hover:border-white/20">
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: String(aspect) }}>
          <CardImage project={project} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="pointer-events-none absolute bottom-3 right-3 flex h-8 w-8 translate-y-1 items-center justify-center rounded-full bg-white text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRightIcon size={15} weight="bold" />
          </div>
        </div>
        <div className="flex items-start justify-between gap-3 p-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium text-white">{project.title}</h3>
            {project.location && (
              <p className="mt-0.5 truncate text-xs text-white/40">{project.location}</p>
            )}
          </div>
          <span className="mt-0.5 shrink-0 text-[10px] font-medium uppercase tracking-[0.14em] text-white/35">
            {project.category}
          </span>
        </div>
      </article>
    </Link>
  )
}

function CardImage({ project }: { project: GalleryProject }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  if (!project.thumbnailUrl || failed) return <GradientThumb slug={project.slug} />

  return (
    <>
      {!loaded && <div className="absolute inset-0 gallery-shimmer" />}
      <img
        src={project.thumbnailUrl}
        alt={`${project.title} preview`}
        loading="lazy"
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.04] ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  )
}

/** Deterministic placeholder for projects without a thumbnail yet. */
function GradientThumb({ slug }: { slug: string }) {
  let hash = 0
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  const hue = hash % 360
  return (
    <div
      className="flex h-full w-full items-center justify-center transition duration-500 group-hover:scale-[1.04]"
      style={{
        background: `
          radial-gradient(120% 90% at 20% 10%, hsl(${hue} 35% 22%) 0%, transparent 60%),
          radial-gradient(120% 100% at 85% 90%, hsl(${(hue + 40) % 360} 40% 14%) 0%, transparent 65%),
          #0d0d0f`,
      }}
    >
      <LogoMark size={30} className="text-white/20" />
    </div>
  )
}

function SkeletonGrid() {
  const aspects = ['4 / 3', '3 / 4', '1 / 1', '16 / 10', '4 / 5', '4 / 3']
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4" aria-hidden="true">
      {aspects.map((aspect, index) => (
        <div
          key={index}
          className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-white/[0.05] bg-[#101010]"
        >
          <div className="gallery-shimmer w-full" style={{ aspectRatio: aspect }} />
          <div className="space-y-2 p-4">
            <div className="gallery-shimmer h-3 w-1/2 rounded" />
            <div className="gallery-shimmer h-2.5 w-1/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="gallery-fade-up mx-auto flex max-w-sm flex-col items-center py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/40">
        <MagnifyingGlassIcon size={20} />
      </div>
      <h2 className="mt-5 text-base font-medium text-white">No projects match</h2>
      <p className="mt-2 text-sm text-white/45">
        Try a different search term, or browse every project in the collection.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-6 rounded-full bg-white px-5 py-2 text-xs font-medium text-black transition hover:bg-white/90"
      >
        Clear search &amp; filters
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="gallery-fade-up mx-auto flex max-w-sm flex-col items-center py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/40">
        <ImagesIcon size={20} />
      </div>
      <h2 className="mt-5 text-base font-medium text-white">The gallery is empty</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/45">
        Add your first project in{' '}
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] text-white/70">
          src/gallery/projects.ts
        </code>{' '}
        and it will appear here.
      </p>
    </div>
  )
}
