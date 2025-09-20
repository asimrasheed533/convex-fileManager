'use client';

import { ModeToggle } from './theme-toggle';

export default function Header() {
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 border-b bg-background">
      <div className="text-xl font-bold">File Manager</div>
      <div className="flex gap-2">
        <ModeToggle />
      </div>
    </header>
  );
}
