import { QueryProvider, StoreFooter, StoreHeader } from '@wlstore/ui';
import { fontVariables } from '@wlstore/ui/lib/fonts';
import { CategoryMenu } from '../features/category-navigation/components/CategoryMenu';
import './global.css';

export const metadata = {
  title: 'WLStore',
  description: 'Vitrine da loja',
};

// Nome, aviso e links fixos por enquanto; depois vêm da configuração da loja
// (tenant).
const STORE_NAME = 'WLStore';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={fontVariables}>
      <body className="flex min-h-screen flex-col">
        <QueryProvider>
          <StoreHeader
            storeName={STORE_NAME}
            announcement="Frete grátis em compras acima de R$ 199 · Parcele em até 10x sem juros"
            search={{ action: '/', placeholder: 'Buscar produtos, marcas e categorias' }}
          >
            <CategoryMenu />
          </StoreHeader>
          <div className="flex-1">{children}</div>
          <StoreFooter
            storeName={STORE_NAME}
            columns={[
              {
                title: 'Comprar',
                links: [
                  { label: 'Novidades', href: '/' },
                  { label: 'Ofertas', href: '/?ofertas=true' },
                ],
              },
              {
                title: 'Para lojistas',
                links: [{ label: 'Painel do lojista', href: '/painel' }],
              },
            ]}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
