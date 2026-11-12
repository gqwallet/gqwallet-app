/**
 * New savings goal (15.1, 15.7).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/layout';
import { Button, Callout, Card, SelectField, TextField, Toggle } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useCreateGoal } from '@/hooks/useGoals';
import { PATHS } from '@/navigation/paths';
import type { Currency } from '@/types/api';
import { CURRENCY_OPTIONS } from '@/utils/options';
import { parseAmount } from '@/utils/parse';
import { MIN_DATE } from '@/utils/dateLimits';

/**
 * Creates a goal through {@link useCreateGoal}; a repeated emergency fund shows the danger callout.
 *
 * @example
 * ```tsx
 * <Route path="/metas/nueva" element={<NewGoalPage />} />
 * ```
 */
export function NewGoalPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { notify } = useToast();
  const { create, isSaving, isDuplicateFund, error } = useCreateGoal();
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<Currency>(profile?.preferredCurrency ?? 'PEN');
  const [target, setTarget] = useState('');
  const [date, setDate] = useState('');
  const [isFund, setIsFund] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; target?: string }>({});

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const value = parseAmount(target);
    const next: { name?: string; target?: string } = {};
    if (!name.trim()) next.name = 'Ingresa un nombre.';
    if (value === null || value <= 0) next.target = 'Ingresa un importe objetivo mayor a cero.';
    setErrors(next);
    if (Object.keys(next).length || value === null) return;
    if (await create({ name: name.trim(), currency, target: value, targetDate: date || null, emergencyFund: isFund })) {
      notify({ title: 'Meta creada', detail: `${name.trim()} ya recibe aportes desde tus cuentas en ${currency}.` });
      navigate(PATHS.goals);
    }
  };

  return (
    <>
      <PageHeader breadcrumb="Metas / Nueva" title="Nueva meta"  />
      <form noValidate onSubmit={handleSubmit} className="lg:max-w-160">
        <Card title="Datos de la meta">
          <div className="flex flex-col gap-4">
            <TextField label="Nombre" value={name} onChange={setName} error={errors.name} />
            <SelectField label="Moneda" value={currency} options={CURRENCY_OPTIONS} onChange={(value) => setCurrency(value as Currency)} />
            <TextField label="Importe objetivo" inputMode="decimal" placeholder="0.00" value={target} onChange={setTarget} error={errors.target} />
            <TextField label="Fecha objetivo" type="date" min={MIN_DATE} value={date} onChange={setDate} helper="Opcional." />
            <Toggle label="Usar como fondo de emergencia" description="Su saldo se usa para calcular cuántos meses de pagos fijos cubres." isOn={isFund} onChange={setIsFund} />
            {isDuplicateFund && (
              <Callout
                tone="danger"
                title={`Ya tienes un fondo de emergencia en ${currency === 'PEN' ? 'soles' : 'dólares'}`}
                text="Esa meta ya cumple ese rol. Desmarca esta opción o crea la meta en otra moneda."
              />
            )}
            {error && <Callout tone="danger" text={error} />}
          </div>
        </Card>
        <div className="mt-4 flex flex-col-reverse gap-2 lg:mt-6 lg:flex-row lg:justify-end">
          <Button label="Cancelar" variant="secondary" onClick={() => navigate(PATHS.goals)} />
          <Button type="submit" label="Crear meta" icon="check" isLoading={isSaving} />
        </div>
      </form>
    </>
  );
}
