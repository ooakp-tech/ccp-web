import { asset } from '../config'

type BrandLogoVariant = 'stacked' | 'horizontal' | 'app-mark' | 'wordmark'

const FILES: Record<BrandLogoVariant, string> = {
  stacked: 'brand/velvet-logo-stacked.svg',
  horizontal: 'brand/velvet-logo-horizontal.svg',
  'app-mark': 'brand/velvet-app-mark.svg',
  wordmark: 'brand/velvet-wordmark.svg',
}

interface BrandLogoProps {
  variant: BrandLogoVariant
  className?: string
  /** Pass "" when the logo sits next to another logo part that already names the brand. */
  alt?: string
}

/** Brand SVGs are used through <img> to avoid internal SVG id collisions. */
export function BrandLogo({ variant, className, alt = 'VELVET FX' }: BrandLogoProps) {
  return <img className={className} src={asset(FILES[variant])} alt={alt} draggable={false} />
}
