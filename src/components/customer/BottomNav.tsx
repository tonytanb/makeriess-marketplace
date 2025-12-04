'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, Heart, Video } from 'lucide-react';

const navItems = [
  { href: '/discover', label: 'Discover', icon: Home },
  { href: '/map', label: 'Map', icon: Map },
  { href: '/reels', label: 'Reels', icon: Video },
  { href: '/favorites', label: 'Favorites', icon: Heart },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
