import { CategoryMenu } from '@wlstore/catalog';
import { MicrofrontendNav, QueryProvider } from '@wlstore/ui';
import { fontVariables } from '@wlstore/ui/lib/fonts';
import './global.css';

export const metadata = {
  title: 'Shell | WLStore',
  description: 'Host dos microfrontends',
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
          <MicrofrontendNav active="shell" />
          <CategoryMenu />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
