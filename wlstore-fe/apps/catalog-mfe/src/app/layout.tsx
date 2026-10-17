import { MicrofrontendNav } from '@my-workspace/ui';
import './global.css';

export const metadata = {
  title: 'Blog | my-workspace',
  description: 'Microfrontend de blog',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <MicrofrontendNav active="blog" />
        {children}
      </body>
    </html>
  );
}
