/**
 * New account (10.1, 10.2).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useNavigate } from 'react-router';
import { AccountForm } from '@/components/accounts';
import { useBanks } from '@/hooks/useBanks';
import { PageHeader } from '@/components/layout';
import { Button, Callout, Card } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRegisterAccount } from '@/hooks/useAccounts';
import { PATHS } from '@/navigation/paths';
import type { RegisterAccountInput } from '@/types/account';
import { todayIso } from '@/utils/format';

const FORM_ID = 'new-account';

/**
 * Registers an account through {@link useRegisterAccount}.
 *
 * @example
 * ```tsx
 * <Route path="/cuentas/nueva" element={<NewAccountPage />} />
 * ```
 */
export function NewAccountPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const banks = useBanks(profile?.countryCode);
  const { notify } = useToast();
  const { register, isSaving, aliasError, error } = useRegisterAccount();
  const handleSubmit = async (input: RegisterAccountInput) => {
    if (await register(input)) {
      notify({ title: 'Cuenta registrada', detail: `${input.alias} ya está disponible como medio de pago.` });
      navigate(PATHS.accounts);
    }
  };
  return (
    <>
      <PageHeader breadcrumb="Cuentas / Nueva" title="Nueva cuenta" subtitle="Quedará disponible como medio de pago y como origen o destino de transferencias." />
      {error && <Callout tone="danger" text={error} className="mb-4" />}
      <Card title="Datos de la cuenta" className="lg:max-w-160">
        <AccountForm banks={banks.data ?? []} id={FORM_ID} defaultCurrency={profile?.preferredCurrency ?? 'PEN'} today={todayIso()} aliasError={aliasError} onSubmit={handleSubmit} />
      </Card>
      <div className="mt-4 flex flex-col-reverse gap-2 lg:mt-6 lg:max-w-160 lg:flex-row lg:justify-end">
        <Button label="Cancelar" variant="secondary" onClick={() => navigate(PATHS.accounts)} />
        <Button type="submit" form={FORM_ID} label="Guardar cuenta" icon="check" isLoading={isSaving} />
      </div>
    </>
  );
}
