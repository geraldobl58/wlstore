import { cn } from '@wlstore/ui/lib/utils';
import { discountPercent, formatBRL, installments, type InstallmentRule } from '../../utils/price';

interface PriceTagProps {
  priceCents: number;
  originalPriceCents?: number | null;
  rule?: InstallmentRule;
  className?: string;
}

/**
 * Preço atual, preço "de" riscado e parcelamento. Não busca nada: quem usa
 * passa os centavos (na listagem vêm da cópia no catálogo; no detalhe, do
 * pricing-service).
 */
export function PriceTag({ priceCents, originalPriceCents, rule, className }: PriceTagProps) {
  const onSale = discountPercent(priceCents, originalPriceCents) !== null;
  const plan = installments(priceCents, rule);

  return (
    <div className={cn('flex flex-col gap-0.5 tabular-nums', className)}>
      <div className="flex flex-wrap items-baseline gap-x-2">
        {onSale && originalPriceCents && (
          <s className="text-sm text-text-2">
            <span className="sr-only">De </span>
            {formatBRL(originalPriceCents)}
          </s>
        )}
        <span className={cn('font-heading text-2xl font-bold', onSale ? 'text-coral-text' : 'text-text')}>
          {onSale && <span className="sr-only">Por </span>}
          {formatBRL(priceCents)}
        </span>
      </div>
      {plan && (
        <span className="text-sm text-text-2">
          {plan.count}x de {formatBRL(plan.valueCents)} sem juros
        </span>
      )}
    </div>
  );
}
