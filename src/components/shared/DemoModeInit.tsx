'use client';

import { useEffect } from 'react';
import { enableDemoMode } from '@/lib/mock/api';

/**
 * Automatically enables demo mode if not explicitly disabled
 * This allows the app to work out of the box without backend deployment
 */
export function DemoModeInit() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check if user has explicitly chosen a mode
    const hasChosenMode = localStorage.getItem('demoModeChosen');
    
    // If no choice has been made, enable demo mode by default
    if (!hasChosenMode) {
      enableDemoMode();
      localStorage.setItem('demoModeChosen', 'true');
    }
  }, []);

  return null;
}
