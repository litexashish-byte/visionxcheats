'use client';
import Header from './Header';
import Footer from './Footer';

export default function ConditionalLayout({ children }) {
  return (
    <>
      <Header />
      <main className="flex-1 relative z-10">
        {children}
      </main>
      <Footer />
    </>
  );
}
