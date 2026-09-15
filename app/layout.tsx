import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import './frame.css';
import './(auth)/auth.css';
import { AuthModalProvider } from '@/components/auth/auth-modal-context';
import AuthModal from '@/components/auth/auth-modal';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Apexa — AI Creative Studio',
  description:
    'Explore, generate images, videos, and storyboards in the Apexa creative studio.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthModalProvider>
          {children}
          <AuthModal />
        </AuthModalProvider>
      </body>
    </html>
  );
}
