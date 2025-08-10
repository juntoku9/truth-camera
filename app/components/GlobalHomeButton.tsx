'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon } from '@heroicons/react/24/outline';

export function GlobalHomeButton() {
  const pathname = usePathname();

  if (pathname === '/') return null;

  return (
    <div className="fixed top-4 left-4 z-50">
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl tc-btn-orange text-sm shadow-lg backdrop-blur-xl"
        aria-label="Go to home"
      >
        <HomeIcon className="h-4 w-4" />
        Home
      </Link>
    </div>
  );
}


