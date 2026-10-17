import { MicrofrontendNav } from '@my-workspace/ui';
import './global.css';

export const metadata = {
  title: 'Shell | my-workspace',
  description: 'Host dos microfrontends',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <MicrofrontendNav active="shell" />
        {children}
      </body>
    </html>
  );
}
