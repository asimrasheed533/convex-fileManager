import { LoginForm } from '@/components/login-form';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-background from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">WhiteBoard Pro</h1>
          <p className="text-slate-600">Collaborative whiteBoarding for software teams</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
