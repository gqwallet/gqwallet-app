/**
 * Profile editor state, validation and save actions (FR-003, FR-014, FR-037).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useProfileForm } from '@/hooks/useProfileForm';
import type { Currency } from '@/types/api';
import { formatAmount, todayIso } from '@/utils/format';
import { parseAmount } from '@/utils/parse';

/**
 * Owns personal and financial form edits while preserving the other section on save.
 *
 * @returns Field values, setters, validation errors and submission handlers.
 * @example
 * ```ts
 * const { firstName, setFirstName, handlePersonal } = useProfileEditor();
 * ```
 */
export function useProfileEditor() {
  const { user } = useAuth();
  const { notify } = useToast();
  const { profile, save, isSaving, error } = useProfileForm();
  const [firstName, setFirstName] = useState(profile?.firstName ?? '');
  const [lastName, setLastName] = useState(profile?.lastName ?? '');
  const [countryCode, setCountryCode] = useState(profile?.countryCode ?? 'PE');
  const [birthDate, setBirthDate] = useState(profile?.birthDate ?? '');
  const [currency, setCurrency] = useState<Currency>(profile?.preferredCurrency ?? 'PEN');
  const [income, setIncome] = useState(profile?.monthlyIncome != null ? formatAmount(profile.monthlyIncome) : '');
  const [cushion, setCushion] = useState(profile?.lifeCushion != null ? formatAmount(profile.lifeCushion) : '');
  const [debt, setDebt] = useState(String(profile?.debtLoadThreshold ?? 7));
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; birthDate?: string; income?: string; cushion?: string; debt?: string }>({});

  const validateNames = (given: string, family: string): typeof errors => ({
    ...(!given.trim() || given.trim().length > 150 ? { firstName: 'Ingresa tu nombre (máximo 150 caracteres).' } : {}),
    ...(!family.trim() || family.trim().length > 150 ? { lastName: 'Ingresa tu apellido (máximo 150 caracteres).' } : {}),
  });

  const handlePersonal = async (event: FormEvent) => {
    event.preventDefault();
    const next = validateNames(firstName, lastName);
    if (birthDate && birthDate >= todayIso()) next.birthDate = 'La fecha de nacimiento debe ser anterior a hoy.';
    setErrors(next);
    if (Object.keys(next).length) return;
    const hasFinancials = profile?.monthlyIncome != null && profile?.lifeCushion != null;
    const saved = await save({
      firstName, lastName, countryCode, birthDate: birthDate || null,
      preferredCurrency: hasFinancials ? profile.preferredCurrency : null,
      monthlyIncome: hasFinancials ? profile.monthlyIncome : null, lifeCushion: hasFinancials ? profile.lifeCushion : null,
    });
    if (saved) notify({ title: 'Cambios guardados', detail: 'Tu perfil está actualizado.' });
  };

  const handleParameters = async (event: FormEvent) => {
    event.preventDefault();
    const incomeValue = income.trim() ? parseAmount(income) : null;
    const cushionValue = cushion.trim() ? parseAmount(cushion) : null;
    const debtValue = parseAmount(debt);
    const next = validateNames(profile?.firstName ?? '', profile?.lastName ?? '');
    if (!income.trim() && !cushion.trim()) next.cushion = 'Ingresa tu ingreso mensual y tu colchón de vida.';
    if (income.trim() && (incomeValue === null || incomeValue <= 0)) next.income = 'Ingresa un monto mayor a cero.';
    if (cushion.trim() && (cushionValue === null || cushionValue < 0)) next.cushion = 'Ingresa un monto mayor o igual a cero.';
    if ((incomeValue === null) !== (cushionValue === null)) next.cushion = 'Ingresa tu ingreso mensual y tu colchón de vida juntos.';
    if (incomeValue !== null && cushionValue !== null && cushionValue > incomeValue) next.cushion = 'El colchón de vida no puede ser mayor a tu ingreso mensual.';
    if (debtValue === null || debtValue < 0.01 || debtValue > 100) next.debt = 'Ingresa un porcentaje entre 0.01 % y 100 %.';
    setErrors(next);
    if (Object.keys(next).length) return;
    const saved = await save({
      firstName: profile?.firstName ?? '', lastName: profile?.lastName ?? '', countryCode: profile?.countryCode ?? 'PE',
      preferredCurrency: currency, monthlyIncome: incomeValue, lifeCushion: cushionValue,
      birthDate: profile?.birthDate ?? null, debtLoadThreshold: debtValue,
    });
    if (saved) notify({ title: 'Cambios guardados', detail: 'Tu perfil está actualizado.' });
  };

  const hasErrors = Object.keys(errors).length > 0 || Boolean(error);
  return {
    email: user?.email ?? '', firstName, setFirstName, lastName, setLastName,
    birthDate, setBirthDate, countryCode, setCountryCode, currency, setCurrency, income, setIncome,
    cushion, setCushion, debt, setDebt, errors, hasErrors, isSaving,
    handlePersonal, handleParameters,
  };
}
