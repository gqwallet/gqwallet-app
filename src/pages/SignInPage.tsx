/**
 * Sign-in screen (03, 03.1).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { AuthLayout } from '@/components/layout';
import { AuthHeading } from '@/components/auth';
import { Button, Callout, TextField, TextLink } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useSignIn } from '@/hooks/useAuthActions';
import { PATHS } from '@/navigation/paths';

/**
 * Signs in through {@link useSignIn}; wrong credentials show the generic error callout.
 *
 * @example
 * ```tsx
 * <Route path="/iniciar-sesion" element={<SignInPage />} />
 * ```
 */
export function SignInPage() {
  const navigate = useNavigate();
  const { sessionExpired } = useAuth();
  const { signIn, isSubmitting, hasFailed } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const user = await signIn({ email: email.trim(), password });
    if (user) navigate(user.roles.includes('ADMINISTRATOR') ? PATHS.metrics : PATHS.dashboard, { replace: true });
  };

  return (
    <AuthLayout>
      <AuthHeading title="Inicia sesión" description="Ingresa con tu correo y contraseña." />
      {sessionExpired && <Callout title="Tu sesión terminó" text="Inicia sesión nuevamente." className="mb-4" />}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {hasFailed && (
          <Callout tone="danger" title="No pudimos iniciar sesión" text="El correo o la contraseña no son correctos. Revisa tus datos e inténtalo de nuevo." />
        )}
        <TextField label="Correo" type="email" autoComplete="email" required value={email} onChange={setEmail} />
        <TextField label="Contraseña" type="password" autoComplete="current-password" required value={password} onChange={setPassword} />
        <Button type="submit" label="Ingresar" isLoading={isSubmitting} isBlock className="mt-1" />
        <TextLink label="¿No tienes cuenta? Crea una" to={PATHS.signUp} className="mt-1 self-start px-4" />
      </form>
    </AuthLayout>
  );
}
