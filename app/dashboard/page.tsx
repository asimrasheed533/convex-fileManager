import FileManager from '@/components/file-manager';
import { cookies } from 'next/headers';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { redirect } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import AuthProvider from '@/providers/auth';
import Header from '@/components/header';

export default async function Dashboard() {
  const cookie = await cookies();

  const token = cookie.get('token')?.value;

  if (!token) {
    return redirect('/');
  }

  const user = await fetchQuery(api.user.getCurrentUser, { userId: token as Id<'users'> });

  if (!user) {
    return redirect('/');
  }

  return (
    <AuthProvider user={user}>
      <Header />
      <FileManager />
    </AuthProvider>
  );
}
