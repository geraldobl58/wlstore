import { MicrofrontendNav } from '@my-workspace/ui';
import './global.css';

export const metadata = {
  title: 'Preços | my-workspace',
  description: 'Microfrontend de preços',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <MicrofrontendNav active="pricing" />
        {children}
      </body>
    </html>
  );
}
