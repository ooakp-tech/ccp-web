import { asset } from '../config'

interface PictureProps {
  /** Path under /assets without extension, e.g. "landing/landing-hero". */
  name: string
  alt: string
  className?: string
  loading?: 'eager' | 'lazy'
}

/** Photo with AVIF first and WebP fallback, as required by the asset pack. */
export function Picture({ name, alt, className, loading = 'lazy' }: PictureProps) {
  return (
    <picture>
      <source type="image/avif" srcSet={asset(`${name}.avif`)} />
      <img className={className} src={asset(`${name}.webp`)} alt={alt} loading={loading} decoding="async" />
    </picture>
  )
}
