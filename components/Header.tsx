'use client';

import { useAuth } from '@/hooks/use-auth';
import { ModeToggle } from './theme-toggle';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 border-b bg-background">
      <div className="text-xl font-bold">WhiteBoard Pro</div>
      <div className="flex gap-2">
        <ModeToggle />
        {isLoading ? null : user ? (
          <Button onClick={logout} className="cursor-pointer" variant="destructive">
            LogOut
          </Button>
        ) : (
          <Button onClick={() => router.push('/')} className="cursor-pointer" variant="default">
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
