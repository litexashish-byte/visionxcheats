import { AuthProvider } from '@/context/AuthContext';
import { MaintenanceProvider } from '@/context/MaintenanceContext';
import { SiteSettingsProvider } from '@/context/SiteSettingsContext';
import MaintenanceWrapper from '@/components/MaintenanceWrapper';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';
import ParticlesBackground from '@/components/ParticlesBackground';
import SplashWrapper from '@/components/SplashWrapper';
import ClickSoundProvider from '@/components/ClickSoundProvider';
import './globals.css';

export const metadata = {
  title: 'VISION X CHEATS - Premium Digital Panels',
  description: 'Download the latest free and premium panels for your needs. VISION X CHEATS - Your trusted source for digital tools.',
  keywords: 'panels, free panels, paid panels, digital store, downloads, tools, utilities',
  openGraph: {
    title: 'VISION X CHEATS - Premium Digital Panels',
    description: 'Download the latest free and premium panels for your needs.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#a855f7" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 text-gray-900 dark:text-gray-100">
        <Toaster position="top-right" toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#1e293b',
            color: '#fff',
          },
        }} />
        <ParticlesBackground density={80} primaryColor="168,85,247" accentColor="139,92,246" />
        <AuthProvider>
          <SiteSettingsProvider>
            <MaintenanceProvider>
              <ClickSoundProvider>
                <SplashWrapper>
                  <MaintenanceWrapper>
                    <div className="flex flex-col min-h-screen relative z-10">
                      <Header />
                      <main className="flex-1 relative z-10">
                        {children}
                      </main>
                      <Footer />
                    </div>
                  </MaintenanceWrapper>
                </SplashWrapper>
              </ClickSoundProvider>
            </MaintenanceProvider>
          </SiteSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}