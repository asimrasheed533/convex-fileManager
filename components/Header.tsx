'use client';

import useAuth from '@/hooks/use-auth';
import { ModeToggle } from './theme-toggle';
import { Button } from './ui/button';
import { clearToken } from '@/actions/clearToken';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function Header() {
  const user = useAuth();
  const router = useRouter();

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
        <Button
          variant="outline"
          onClick={() => {
            toast('Redirecting to chat...');
            router.push('/dashboard/chat');
          }}
        >
          Chat
        </Button>
      </div>
    </header>
  );
}
