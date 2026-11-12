/**
 * Profile: personal data and financial parameters (19 to 19.2, FR-003, FR-014, FR-037).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { PageHeader } from '@/components/layout';
import { Button, Callout, Card, ChipGroup, TextField, SelectField } from '@/components/ui';
import { useProfileEditor } from '@/hooks/useProfileEditor';
import { currencySymbol, todayIso } from '@/utils/format';
import { COUNTRY_OPTIONS } from '@/utils/countries';
import { CURRENCY_OPTIONS } from '@/utils/options';

/**
 * Edits the profile through {@link useProfileEditor}.
 *
 * @example
 * ```tsx
 * <Route path="/perfil" element={<ProfilePage />} />
 * ```
 */
export function ProfilePage() {
  const {
    countryCode, setCountryCode, email, firstName, setFirstName, lastName, setLastName, birthDate, setBirthDate,
    currency, setCurrency, income, setIncome, cushion, setCushion, debt, setDebt,
    errors, hasErrors, isSaving, handlePersonal, handleParameters,
  } = useProfileEditor();
  return (
    <>
      <PageHeader title="Perfil"  />
      {hasErrors && <Callout tone="danger" title="No guardamos los cambios" text="Revisa el campo marcado; tu información anterior se conserva." className="mb-4" />}
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <form noValidate onSubmit={handlePersonal}>
          <Card title="Datos personales">
            <div className="flex flex-col gap-4">
              <SelectField label="País" value={countryCode} options={COUNTRY_OPTIONS} onChange={setCountryCode} />
        <TextField label="Nombre" autoComplete="given-name" required maxLength={150} value={firstName} onChange={setFirstName} error={errors.firstName} />
              <TextField label="Apellido" autoComplete="family-name" required maxLength={150} value={lastName} onChange={setLastName} error={errors.lastName} />
              <TextField label="Correo" type="email" value={email} onChange={() => undefined} readOnly helper="Es el correo con el que inicias sesión." />
              <TextField label="Fecha de nacimiento (opcional)" type="date" autoComplete="bday" max={todayIso()} value={birthDate} onChange={setBirthDate} error={errors.birthDate} />
              <Button type="submit" label="Guardar datos" icon="check" isLoading={isSaving} className="self-start" />
            </div>
          </Card>
        </form>
        <form noValidate onSubmit={handleParameters}>
          <Card title="Parámetros financieros">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-label text-content-secondary">Moneda principal</span>
                <ChipGroup label="Moneda principal" options={CURRENCY_OPTIONS} value={currency} onChange={setCurrency} />
              </div>
              <TextField label="Ingreso mensual de referencia" inputMode="decimal" prefix={currencySymbol(currency)} value={income} onChange={setIncome} error={errors.income} />
              <TextField label="Colchón de vida" inputMode="decimal" prefix={currencySymbol(currency)} value={cushion} onChange={setCushion} helper="No puede superar tu ingreso mensual." error={errors.cushion} />
              <TextField label="Umbral de carga de deuda" inputMode="decimal" value={debt} onChange={setDebt} helper="Por defecto 7 %. Se usa en tu serie de carga de deuda." error={errors.debt} trailingIcon="percent" />
              <Button type="submit" label="Guardar parámetros" icon="check" isLoading={isSaving} className="self-start" />
            </div>
          </Card>
        </form>
      </div>
    </>
  );
}
