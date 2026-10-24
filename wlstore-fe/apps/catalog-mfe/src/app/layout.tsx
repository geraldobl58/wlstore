import { CategoryMenu } from '@wlstore/catalog';
import { MicrofrontendNav, QueryProvider } from '@wlstore/ui';
import { fontVariables } from '@wlstore/ui/lib/fonts';
import './global.css';

export const metadata = {
  title: 'Catálogo | WLStore',
  description: 'Microfrontend de catálogo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={fontVariables}>
      <body>
        <QueryProvider>
          <MicrofrontendNav active="catalog" />
          <CategoryMenu />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
