/**
 * Welcome screen (01) with the privacy promise and the entry actions.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useNavigate } from 'react-router';
import { AuthLayout } from '@/components/layout';
import { AuthHeading } from '@/components/auth';
import { Button, Callout } from '@/components/ui';
import { PATHS } from '@/navigation/paths';

/**
 * Shows the welcome copy and routes to sign-up or sign-in; it needs no data.
 *
 * @example
 * ```tsx
 * <Route path="/" element={<WelcomePage />} />
 * ```
 */
export function WelcomePage() {
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <AuthHeading title="Bienvenido a GQWallet" />
      <Callout
        icon="lock"
        title="Tus datos son solo tuyos"
        text="No vinculas cuentas bancarias: registras lo que necesitas y nadie más ve tu información."
        className="mb-6"
      />
      <div className="grid grid-cols-2 gap-3">
        <Button label="Crear cuenta" onClick={() => navigate(PATHS.signUp)} />
        <Button label="Iniciar sesión" variant="secondary" onClick={() => navigate(PATHS.signIn)} />
      </div>
    </AuthLayout>
  );
}
