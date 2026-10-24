import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';

// Fontes do design system WLStore. Cada app aplica `fontVariables` no <html>;
// o globals.css lê as variáveis em font-sans, font-heading e font-mono.
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-plus-jakarta' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

export const fontVariables = [inter.variable, plusJakarta.variable, jetbrainsMono.variable].join(' ');
