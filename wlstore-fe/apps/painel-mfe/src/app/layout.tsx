import { MicrofrontendNav, QueryProvider } from '@wlstore/ui';
import { fontVariables } from '@wlstore/ui/lib/fonts';
import './global.css';

export const metadata = {
  title: 'Painel do lojista | WLStore',
  description: 'Gestão de preços da loja',
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
          <MicrofrontendNav active="painel" />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
