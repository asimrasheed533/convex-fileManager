'use client';

import useAuth from '@/hooks/use-auth';
import { ModeToggle } from './theme-toggle';
import { Button } from './ui/button';
import { clearToken } from '@/actions/clearToken';
import { toast } from 'sonner';

export default function Header() {
  const user = useAuth();

  const handleLogout = async () => {
    try {
      await clearToken();
      toast('logout successfully');
    } catch (error) {
      console.log(error);
      toast.error('Failed to logout');
    }
  };
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 border-b bg-background">
      <div className="text-xl font-bold">{user?.name}</div>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={handleLogout}>
          LogOut
        </Button>
        <ModeToggle />
      </div>
    </header>
  );
}
