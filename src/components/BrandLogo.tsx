import { asset } from '../config'

type BrandLogoVariant = 'stacked' | 'horizontal' | 'app-mark' | 'wordmark'

const FILES: Record<BrandLogoVariant, string> = {
  stacked: 'brand/velvet-logo-stacked.svg',
  horizontal: 'brand/velvet-logo-horizontal.svg',
  'app-mark': 'brand/velvet-app-mark.svg',
  wordmark: 'brand/velvet-wordmark.svg',
}

// Same logos with the silver "VELVET" lettering in dark ink, for light screens.
// The app mark is a self-contained tile and works on either background.
const INK_FILES: Partial<Record<BrandLogoVariant, string>> = {
  stacked: 'brand/velvet-logo-stacked-ink.svg',
  horizontal: 'brand/velvet-logo-horizontal-ink.svg',
  wordmark: 'brand/velvet-wordmark-ink.svg',
}

interface BrandLogoProps {
  variant: BrandLogoVariant
  className?: string
  /** Pass "" when the logo sits next to another logo part that already names the brand. */
  alt?: string
  /** Use the dark-lettering version (white and light-grey backgrounds). */
  onLight?: boolean
}

/** Brand SVGs are used through <img> to avoid internal SVG id collisions. */
export function BrandLogo({ variant, className, alt = 'VELVET FX', onLight = false }: BrandLogoProps) {
  const file = (onLight && INK_FILES[variant]) || FILES[variant]
  return <img className={className} src={asset(file)} alt={alt} draggable={false} />
}
