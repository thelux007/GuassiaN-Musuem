/**
 * Original Image Blaster logo mark: a four-petal "splat" burst around a core,
 * echoing an anisotropic gaussian. Drawn inline so it needs no asset files.
 */
export function LogoMark({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="12" cy="5.6" rx="2.1" ry="3.4" fill="currentColor" opacity="0.55" />
      <ellipse cx="12" cy="18.4" rx="2.1" ry="3.4" fill="currentColor" opacity="0.55" />
      <ellipse cx="5.6" cy="12" rx="3.4" ry="2.1" fill="currentColor" opacity="0.55" />
      <ellipse cx="18.4" cy="12" rx="3.4" ry="2.1" fill="currentColor" opacity="0.55" />
      <circle cx="12" cy="12" r="3.1" fill="currentColor" />
    </svg>
  )
}
