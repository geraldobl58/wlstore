import { CategoryMenu } from '@wlstore/catalog';
import { MicrofrontendNav, QueryProvider } from '@wlstore/ui';
import { fontVariables } from '@wlstore/ui/lib/fonts';
import './global.css';

export const metadata = {
  title: 'Preços | WLStore',
  description: 'Microfrontend de preços',
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
          <MicrofrontendNav active="pricing" />
          <CategoryMenu />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
