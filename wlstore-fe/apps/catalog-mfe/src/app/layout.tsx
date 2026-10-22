import { MicrofrontendNav } from '@my-workspace/ui';
import './global.css';

export const metadata = {
  title: 'Catálogo | my-workspace',
  description: 'Microfrontend de catálogo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <MicrofrontendNav active="catalog" />
        {children}
      </body>
    </html>
  );
}
