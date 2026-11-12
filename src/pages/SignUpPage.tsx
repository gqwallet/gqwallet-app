/**
 * Sign-up screen (02, 02.1, 02.2): email, password and mandatory consent.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { AuthLayout } from '@/components/layout';
import { AuthHeading } from '@/components/auth';
import { Button, Callout, TextField, TextLink, Toggle } from '@/components/ui';
import { useSignUp } from '@/hooks/useAuthActions';
import { PATHS } from '@/navigation/paths';
import { isEmail, isStrongPassword } from '@/utils/parse';

const PASSWORD_HELP = 'Mínimo 8 caracteres, con letras y números.';
const CONSENT_ERROR = 'Debes aceptar los términos y la política de privacidad para crear tu cuenta.';

/**
 * Creates the account through {@link useSignUp} and continues to the initial setup.
 *
 * @example
 * ```tsx
 * <Route path="/crear-cuenta" element={<SignUpPage />} />
 * ```
 */
export function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, isSubmitting, errors } = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState(false);

  const emailError = touched && !isEmail(email) ? 'Ingresa un correo válido.' : errors.email;
  const passwordError = touched && !isStrongPassword(password) ? PASSWORD_HELP : null;
  const consentError = touched && !consent ? CONSENT_ERROR : null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!isEmail(email) || !isStrongPassword(password) || !consent) return;
    if (await signUp({ email: email.trim(), password, consentAccepted: consent })) navigate(PATHS.onboarding, { replace: true });
  };

  return (
    <AuthLayout>
      <AuthHeading title="Crea tu cuenta" />
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errors.general && <Callout tone="danger" text={errors.general} />}
        <TextField label="Correo" type="email" autoComplete="email" value={email} onChange={setEmail} error={emailError} />
        <TextField label="Contraseña" type="password" autoComplete="new-password" value={password} onChange={setPassword} helper={PASSWORD_HELP} error={passwordError} />
        <Toggle label="Acepto los términos y la política de privacidad" description="Necesario para crear tu cuenta." error={consentError} isOn={consent} onChange={setConsent} />
        <Button type="submit" label="Crear cuenta" isLoading={isSubmitting} isBlock />
        <TextLink label="¿Ya tienes cuenta? Inicia sesión" to={PATHS.signIn} className="self-start" />
      </form>
    </AuthLayout>
  );
}
