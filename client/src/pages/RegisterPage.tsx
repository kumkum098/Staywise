import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, GraduationCap, Building2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { registerSchema, RegisterFormValues } from '../lib/validation';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { cn } from '../components/ui/cn';
import { ROUTES } from '../routes';

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRole: 'tenant' | 'owner' = searchParams.get('role') === 'owner' ? 'owner' : 'tenant';

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: preselectedRole },
  });

  const role = watch('role');

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
        role: values.role,
      });
      toast.success('Account created — welcome to Staywise!');
      navigate(values.role === 'owner' ? ROUTES.owner : ROUTES.explore, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to create your account.');
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="mb-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <UserPlus className="h-6 w-6" />
        </div>
        <h1 className="text-display mt-4 text-ink-primary">Create your account</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          Join Staywise as a tenant or renter, or list your property as an owner.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-xl border border-surface-border bg-white p-6 shadow-subtle"
      >
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink-primary">I am a...</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => field.onChange('tenant')}
                  aria-pressed={field.value === 'tenant'}
                  className={cn(
                    'relative rounded-xl border p-4 text-left transition-subtle',
                    field.value === 'tenant' ? 'border-brand-700 bg-brand-50' : 'border-surface-border hover:border-gray-300'
                  )}
                >
                  {field.value === 'tenant' && <Check className="absolute right-3 top-3 h-4 w-4 text-brand-700" />}
                  <GraduationCap className="mb-2 h-5 w-5 text-brand-700" />
                  <p className="text-sm font-semibold text-ink-primary">Tenant / Renter</p>
                  <p className="mt-0.5 text-xs text-ink-secondary">Find and book PGs, hostels &amp; rooms</p>
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange('owner')}
                  aria-pressed={field.value === 'owner'}
                  className={cn(
                    'relative rounded-xl border p-4 text-left transition-subtle',
                    field.value === 'owner' ? 'border-brand-700 bg-brand-50' : 'border-surface-border hover:border-gray-300'
                  )}
                >
                  {field.value === 'owner' && <Check className="absolute right-3 top-3 h-4 w-4 text-brand-700" />}
                  <Building2 className="mb-2 h-5 w-5 text-brand-700" />
                  <p className="text-sm font-semibold text-ink-primary">Property Owner</p>
                  <p className="mt-0.5 text-xs text-ink-secondary">List and manage your properties</p>
                </button>
              </div>
            </div>
          )}
        />

        <Input label="Full name" placeholder="Jane Doe" error={errors.name?.message} {...register('name')} />
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Phone (optional)"
          type="tel"
          placeholder="+91 98765 43210"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm password"
          type="password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Create account as {role === 'owner' ? 'Property Owner' : 'Tenant / Renter'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-secondary">
        Already have an account?{' '}
        <Link to={ROUTES.login} className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
