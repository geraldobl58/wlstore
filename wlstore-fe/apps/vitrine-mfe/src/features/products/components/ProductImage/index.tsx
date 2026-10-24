'use client';

import { PackageIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ProductImageProps {
  src?: string;
  alt: string;
}

/**
 * Foto do produto em fundo neutro, 1:1. Sem imagem, ou se ela não carregar,
 * mostra um ícone no lugar em vez da imagem quebrada do navegador.
 */
export function ProductImage({ src, alt }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // A <img> vem no HTML do servidor e pode falhar antes da hidratação, quando
  // o onError ainda não existe. Ao montar, confere se ela já terminou sem
  // conteúdo.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (!src || failed) {
    return (
      <div role="img" aria-label={alt} className="grid size-full place-items-center text-text-3">
        <PackageIcon aria-hidden className="size-12" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    // <img> e não next/image: as fotos vêm de qualquer domínio do lojista, e
    // o next/image exigiria cadastrar cada host em cada app.
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="size-full object-contain p-6"
    />
  );
}
