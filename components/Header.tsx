'use client';
import { useRouter } from 'next/navigation';
import { ModeToggle } from './theme-toggle';
import { Button } from './ui/button';

export default function Header() {
  const router = useRouter();
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 border-b bg-background">
      <div className="text-xl font-bold">File Manager</div>
      <div className="flex gap-2">
        <ModeToggle />
        <Button onClick={() => router.push('/chat')}>chat</Button>
      </div>
    </header>
  );
}
