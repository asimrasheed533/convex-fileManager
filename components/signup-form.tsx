'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function SignUpForm({ className, ...props }: React.ComponentProps<'div'>) {
  const router = useRouter();

  const [isPending, startSubmit] = useTransition();

  const signUp = useMutation(api.user.signup);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const confirmPassword = formData.get('confirmPassword') as string;

    startSubmit(async () => {
      try {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }

        if (!name || !email || !password) {
          throw new Error('Missing required fields');
        }
        await signUp({
          name: name.toString(),
          email: email.toString(),
          password: password.toString(),
        });

        router.push('/');

        toast.success('Account created successfully');
      } catch (err) {
        console.log(err);
        toast.error('Failed to create account');
      }
    });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Enter your details below to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" type="text" name="name" placeholder="Full Name" required />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" name="email" placeholder="m@example.com" required />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" name="password" required />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                </div>
                <Input id="confirmPassword" type="password" name="confirmPassword" required />
              </div>
              <div className="flex flex-col gap-3">
                <Button disabled={isPending} type="submit" className="w-full">
                  {isPending ? 'Signing Up...' : 'Sign Up'}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <a href="#" className="underline underline-offset-4">
                Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
