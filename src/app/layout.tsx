import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/app-shell';
import NextAuthSessionProvider from '@/components/auth/session-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Biklan AI',
  description: 'AI-powered ad/content generation system.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <NextAuthSessionProvider>
          <AppShell>
            {children}
          </AppShell>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
