'use client';

import { useState, useEffect } from 'react';
import { TestTube2, Database } from 'lucide-react';
import { isDemoMode, enableDemoMode, disableDemoMode } from '@/lib/mock/api';

export function DemoModeToggle() {
  const [isDemo, setIsDemo] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDemo(isDemoMode());
  }, []);

  const toggleDemoMode = () => {
    if (isDemo) {
      disableDemoMode();
      setIsDemo(false);
    } else {
      enableDemoMode();
      setIsDemo(true);
    }
    // Reload to apply changes
    window.location.reload();
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleDemoMode}
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all ${
        isDemo
          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
          : 'bg-gray-800 text-white hover:bg-gray-900'
      }`}
      title={isDemo ? 'Using Mock Data' : 'Using Real Backend'}
    >
      {isDemo ? (
        <>
          <TestTube2 className="h-4 w-4" />
          <span className="text-sm font-medium">Demo Mode</span>
        </>
      ) : (
        <>
          <Database className="h-4 w-4" />
          <span className="text-sm font-medium">Live Mode</span>
        </>
      )}
    </button>
  );
}
