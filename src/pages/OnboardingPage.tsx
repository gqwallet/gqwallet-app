/**
 * Initial setup (04, 04.1): main currency, names, reference income and life cushion.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { AuthLayout } from '@/components/layout';
import { AuthHeading } from '@/components/auth';
import { Button, ChipGroup, TextField, SelectField } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useProfileForm } from '@/hooks/useProfileForm';
import { PATHS } from '@/navigation/paths';
import type { Currency } from '@/types/api';
import { currencySymbol } from '@/utils/format';
import { COUNTRY_OPTIONS } from '@/utils/countries';
import { CURRENCY_OPTIONS } from '@/utils/options';
import { parseAmount } from '@/utils/parse';

const CUSHION_HELP = 'Monto que quieres conservar siempre disponible. No puede superar tu ingreso mensual.';
const CUSHION_ERROR = 'El colchón de vida no puede ser mayor a tu ingreso mensual. No guardamos los cambios.';

/**
 * Saves names and financial preferences through {@link useProfileForm}; skipping keeps PEN.
 *
 * @example
 * ```tsx
 * <Route path="/configuracion-inicial" element={<OnboardingPage />} />
 * ```
 */
export function OnboardingPage() {
  const navigate = useNavigate();
  const { profile, save, isSaving, error } = useProfileForm();
  const { finishSetup } = useAuth();
  const [countryCode, setCountryCode] = useState(profile?.countryCode ?? 'PE');
  const [currency, setCurrency] = useState<Currency>(profile?.preferredCurrency ?? 'PEN');
  const [firstName, setFirstName] = useState(profile?.firstName ?? '');
  const [lastName, setLastName] = useState(profile?.lastName ?? '');
  const [nameErrors, setNameErrors] = useState<{ firstName?: string; lastName?: string }>({});
  const [income, setIncome] = useState('');
  const [cushion, setCushion] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextNames = {
      ...(!firstName.trim() || firstName.trim().length > 150 ? { firstName: 'Ingresa tu nombre (máximo 150 caracteres).' } : {}),
      ...(!lastName.trim() || lastName.trim().length > 150 ? { lastName: 'Ingresa tu apellido (máximo 150 caracteres).' } : {}),
    };
    setNameErrors(nextNames);
    if (Object.keys(nextNames).length) return;
    const incomeValue = parseAmount(income);
    const cushionValue = parseAmount(cushion);
    if (incomeValue === null || cushionValue === null || incomeValue <= 0 || cushionValue <= 0) {
      setFieldError('Ingresa tu ingreso mensual y tu colchón de vida, ambos mayores a cero.');
      return;
    }
    if (incomeValue !== null && cushionValue !== null && cushionValue > incomeValue) {
      setFieldError(CUSHION_ERROR);
      return;
    }
    setFieldError(null);
    const saved = await save({
      firstName,
      countryCode,
      lastName,
      birthDate: profile?.birthDate ?? null,
      preferredCurrency: currency,
      monthlyIncome: incomeValue,
      lifeCushion: cushionValue,
    });
    if (saved) {
      finishSetup();
      navigate(PATHS.dashboard, { replace: true });
    }
  };

  return (
    <AuthLayout>
      <AuthHeading
        title="Configura tu billetera"
        description="Usaremos estos datos como valores por defecto en tus registros y en tu dashboard. Puedes cambiarlos luego en tu perfil."
      />
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-label text-content-secondary">Moneda principal</span>
          <ChipGroup label="Moneda principal" options={CURRENCY_OPTIONS} value={currency} onChange={setCurrency} />
        </div>
        <SelectField label="País" value={countryCode} options={COUNTRY_OPTIONS} onChange={setCountryCode} />
        <TextField label="Nombre" autoComplete="given-name" required maxLength={150} value={firstName} onChange={setFirstName} error={nameErrors.firstName} />
        <TextField label="Apellido" autoComplete="family-name" required maxLength={150} value={lastName} onChange={setLastName} error={nameErrors.lastName} />
        <TextField label="Ingreso mensual de referencia" required inputMode="decimal" prefix={currencySymbol(currency)} value={income} onChange={setIncome} />
        <TextField label="Colchón de vida" required inputMode="decimal" prefix={currencySymbol(currency)} value={cushion} onChange={setCushion} helper={CUSHION_HELP} error={fieldError ?? error} />
        <Button type="submit" label="Guardar y continuar" isLoading={isSaving} isBlock />
        <Button label="Omitir por ahora" variant="ghost" className="self-start" onClick={() => {
          finishSetup();
          navigate(PATHS.dashboard, { replace: true });
        }} />
      </form>
    </AuthLayout>
  );
}
