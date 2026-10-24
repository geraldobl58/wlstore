import { TagIcon } from 'lucide-react';
import { discountPercent } from '../../utils/price';

interface DiscountBadgeProps {
  priceCents: number;
  originalPriceCents?: number | null;
}

/** Selo "-12 %" sobre a foto. Não renderiza nada sem desconto. */
export function DiscountBadge({ priceCents, originalPriceCents }: DiscountBadgeProps) {
  const percent = discountPercent(priceCents, originalPriceCents);
  if (percent === null) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-coral-500 px-2 py-0.5 text-xs font-semibold text-ink-on-accent">
      <TagIcon aria-hidden className="size-3" />-{percent} %
    </span>
  );
}
