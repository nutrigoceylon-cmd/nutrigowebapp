type BrandLogoProps = {
  className?: string
  imageClassName?: string
  alt?: string
}

export function BrandLogo({
  className = '',
  imageClassName = 'h-10 w-auto',
  alt = 'NutriGo Ceylon',
}: BrandLogoProps) {
  return (
    <div className={className}>
      <img src="/Nutrigologo.png" alt={alt} className={imageClassName} />
    </div>
  )
}
