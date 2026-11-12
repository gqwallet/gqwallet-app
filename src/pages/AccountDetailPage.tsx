/**
 * Account detail (10.3, 10.4): balance breakdown, recent activity, edition and deactivation.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { AccountForm } from '@/components/accounts';
import { useBanks } from '@/hooks/useBanks';
import { PageHeader } from '@/components/layout';
import { BreakdownRow, Button, Card, EmptyState, ListRow, Modal, Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useAccountDetail } from '@/hooks/useAccountDetail';
import { PATHS, withId } from '@/navigation/paths';
import type { RegisterAccountInput } from '@/types/account';
import { categoryIcon } from '@/utils/categoryIcons';
import { formatMoney, formatShortDate, formatSignedMoney, todayIso } from '@/utils/format';
import { ACCOUNT_TYPE_LABEL } from '@/utils/options';

const FORM_ID = 'edit-account';

/**
 * Shows an account from {@link useAccountDetail} and lets the user edit or deactivate it.
 *
 * @example
 * ```tsx
 * <Route path="/cuentas/:id" element={<AccountDetailPage />} />
 * ```
 */
export function AccountDetailPage() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const returnPath = `${PATHS.accounts}${params.get('estado') === 'desactivadas' ? '?estado=desactivadas' : ''}`;
  const navigate = useNavigate();
  const { profile } = useAuth();
  const banks = useBanks(profile?.countryCode);
  const { notify } = useToast();
  const { data, isLoading, error, update, deactivate, isSaving, saveError } = useAccountDetail(id);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  if (isLoading && !data) return <Spinner />;
  if (error || !data) return <EmptyState icon="error" title="No encontramos esta cuenta" action={<Button label="Volver a cuentas" onClick={() => navigate(returnPath)} />} />;

  const { account, breakdown, recent } = data;
  const money = (value: number) => formatMoney(value, account.currency);
  const isActive = account.status === 'ACTIVE';
  const handleSave = async (input: RegisterAccountInput) => {
    if (await update({ alias: input.alias, bankId: input.bankId, customBankName: input.customBankName, openingBalance: input.openingBalance, openingBalanceAsOf: input.openingBalanceAsOf })) {
      notify({ title: 'Cambios guardados', detail: `${input.alias} se actualizó.` });
    }
  };
  const handleDeactivate = async () => {
    if (await deactivate()) {
      notify({ title: 'Cuenta desactivada', detail: `${account.alias} ya no aparecerá en nuevos registros.` });
      navigate(returnPath);
    }
  };

  return (
    <>
      <PageHeader
        breadcrumb={`Cuentas / ${account.alias}`}
        title={account.alias}
        subtitle={`${ACCOUNT_TYPE_LABEL[account.type]} · ${account.bankName ?? 'Efectivo'} · ${account.currency}${isActive ? '' : ' · desactivada'}`}
        onBack={() => navigate(returnPath)}
        actions={
          isActive
            ? [
                <Button key="off" label="Desactivar" icon="block" variant="secondary" onClick={() => setIsDeactivateOpen(true)} />,
                <Button key="transfer" label="Nueva transferencia" icon="swap_horiz" onClick={() => navigate(PATHS.newTransfer)} />,
              ]
            : undefined
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_436px] lg:gap-6">
        <div className="flex flex-col gap-4 lg:gap-6">
          <Card informationTopic="Saldo en cuentas" title={`Saldo calculado al ${formatShortDate(todayIso(), true)}`}>
            <BreakdownRow label={`Saldo inicial · ${formatShortDate(account.openingBalanceAsOf, true)}`} value={money(breakdown.opening)} />
            <BreakdownRow label="Ingresos a la cuenta" value={`+ ${money(breakdown.incomes)}`} tone="income" />
            <BreakdownRow label="Gastos con la cuenta" value={`− ${money(breakdown.expenses)}`} />
            <BreakdownRow label="Transferencias salientes" value={`− ${money(breakdown.transfersOut)}`} />
            <BreakdownRow label="Transferencias entrantes" value={`+ ${money(breakdown.transfersIn)}`} />
            <BreakdownRow label="Saldo calculado" value={money(breakdown.balance)} tone="total" />
          </Card>
          <Card title="Movimientos recientes" action={<Button label="Ver todos" variant="ghost" onClick={() => navigate(PATHS.transactions)} />}>
            {recent.length === 0 ? (
              <p className="text-body text-content-secondary">Aún no hay movimientos en esta cuenta.</p>
            ) : (
              recent.map((item) => (
                <ListRow
                  key={`${item.type}-${item.id}`}
                  icon={item.type === 'transfer' ? 'swap_horiz' : categoryIcon(item.title)}
                  title={item.title}
                  detail={[item.detail, formatShortDate(item.date)].filter(Boolean).join(' · ')}
                  amount={formatSignedMoney(Math.abs(item.signedAmount), account.currency, item.signedAmount > 0)}
                  amountTone={item.type === 'transfer' ? 'neutral' : item.signedAmount > 0 ? 'income' : 'expense'}
                  onClick={item.type === 'transaction' ? () => navigate(withId(PATHS.transaction, item.id)) : undefined}
                />
              ))
            )}
          </Card>
        </div>
        <Card title="Datos de la cuenta">
          <AccountForm banks={banks.data ?? []} id={FORM_ID} initial={account} defaultCurrency={account.currency} today={todayIso()} aliasError={saveError} onSubmit={handleSave} />
          {isActive && <Button type="submit" form={FORM_ID} label="Guardar cambios" icon="check" isLoading={isSaving && !isDeactivateOpen} className="mt-4" />}
        </Card>
      </div>
      <Modal
        isOpen={isDeactivateOpen}
        icon="block"
        title={`¿Desactivar ${account.alias}?`}
        description={`Dejará de ofrecerse en nuevos registros. Sus ${data.movementCount} movimientos se conservan en tu historial y en tus reportes.`}
        onClose={() => setIsDeactivateOpen(false)}
        footer={
          <>
            <Button label="Cancelar" variant="secondary" onClick={() => setIsDeactivateOpen(false)} />
            <Button label="Desactivar cuenta" variant="danger" isLoading={isSaving} onClick={handleDeactivate} />
          </>
        }
      />
    </>
  );
}
