import { DiscountBadge } from '../../../pricing/components/DiscountBadge';
import { PriceTag } from '../../../pricing/components/PriceTag';
import { StarIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Product } from '../../types';
import { isNewProduct, productHref } from '../../utils/is-new-product';
import { ProductImage } from '../ProductImage';

interface ProductCardProps {
  product: Product;
  /**
   * Espaços para outros times: o botão de favoritar (conta) e o de adicionar
   * ao carrinho (checkout) entram aqui sem o catálogo depender deles.
   */
  imageAction?: ReactNode;
  footer?: ReactNode;
}

/**
 * Card de produto, usado nas vitrines e nas listagens. O link cobre o card
 * inteiro; os espaços de ação ficam por cima.
 */
export function ProductCard({
  product,
  imageAction,
  footer,
}: ProductCardProps) {
  const image =
    product.images.find((img) => img.primaryImage) ?? product.images[0];
  const isNew = isNewProduct(product.createdAt);

  return (
    <article className="relative flex h-full flex-col gap-4 rounded-xl border bg-card p-3 shadow-sm transition-shadow duration-180 hover:shadow-md">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
        <ProductImage src={image?.url} alt={image?.altText || product.title} />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.priceFromCents !== null && (
            <DiscountBadge
              priceCents={product.priceFromCents}
              originalPriceCents={product.originalPriceFromCents}
            />
          )}
          {isNew && (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-500 px-2 py-0.5 text-xs font-semibold text-ink-on-accent">
              <StarIcon aria-hidden className="size-3" />
              Novo
            </span>
          )}
        </div>
        {imageAction && (
          <div className="absolute top-3 right-3 z-10">{imageAction}</div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 px-1">
        <p className="text-xs font-medium tracking-wider text-text-2 uppercase">
          {product.brand}
        </p>
        <h3 className="line-clamp-2 min-h-12 font-sans text-base font-semibold text-text">
          <a
            href={productHref(product.id)}
            className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus"
          >
            {product.title}
          </a>
        </h3>
        <div className="mt-auto pt-2">
          {product.priceFromCents !== null ? (
            <PriceTag
              priceCents={product.priceFromCents}
              originalPriceCents={product.originalPriceFromCents}
            />
          ) : (
            <p className="text-sm text-text-2">Preço indisponível</p>
          )}
        </div>
      </div>

      {footer && <div className="relative z-10 px-1">{footer}</div>}
    </article>
  );
}
