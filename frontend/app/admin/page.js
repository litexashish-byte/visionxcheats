'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="loading-spinner w-10 h-10" />
    </div>
  );
}