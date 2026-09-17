import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { loginSchema, LoginFormValues } from '../lib/validation';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ROUTES } from '../routes';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      toast.success('Welcome back!');
      const redirectTo = (location.state as { from?: Location })?.from?.pathname || ROUTES.explore;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to log in. Please check your credentials.');
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <LogIn className="h-6 w-6" />
        </div>
        <h1 className="text-display mt-4 text-ink-primary">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-secondary">Log in to browse, save, and manage your Staywise account.</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-surface-border bg-white p-6 shadow-subtle"
      >
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-secondary">
        New to Staywise?{' '}
        <Link to={ROUTES.register} className="font-semibold text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
