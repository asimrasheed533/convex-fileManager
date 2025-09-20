'use client';

import useAuth from '@/hooks/use-auth';
import { ModeToggle } from './theme-toggle';

export default function Header() {
  const user = useAuth();
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 border-b bg-background">
      <div className="text-xl font-bold">{user?.name}</div>
      <div className="flex gap-2">
        <ModeToggle />
      </div>
    </header>
  );
}
