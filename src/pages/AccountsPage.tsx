/**
 * Accounts by currency with their calculated balance (10, 10.5, 09.2).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { Fragment } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { PageHeader } from '@/components/layout';
import { Badge, Button, ChipGroup, Callout, Card, EmptyState, ListRow, Overline, Spinner } from '@/components/ui';
import { useAccounts, type AccountSummary } from '@/hooks/useAccounts';
import { PATHS, withId } from '@/navigation/paths';
import { formatMoney } from '@/utils/format';
import { ACCOUNT_TYPE_LABEL } from '@/utils/options';

const ICON: Record<AccountSummary['type'], string> = { DEBIT: 'account_balance', SAVINGS: 'savings', CASH: 'payments' };

/**
 * Shows the accounts from {@link useAccounts} grouped by currency and status.
 *
 * @example
 * ```tsx
 * <Route path="/cuentas" element={<AccountsPage />} />
 * ```
 */
export function AccountsPage() {
  const navigate = useNavigate();
  const { accounts, isLoading, error, refetch } = useAccounts();
  const [params, setParams] = useSearchParams();
  const status = params.get("estado") === "desactivadas" ? "INACTIVE" : "ACTIVE";
  const groups = [
    { label: 'Soles (PEN)', items: accounts?.filter((account) => account.status === status && account.currency === 'PEN') ?? [] },
    { label: 'Dólares (USD)', items: accounts?.filter((account) => account.status === status && account.currency === 'USD') ?? [] },
  ].filter((group) => group.items.length > 0);
  const negatives = accounts?.filter((account) => account.status === 'ACTIVE' && account.isNegative) ?? [];

  return (
    <>
      <PageHeader informationTopic="Cuentas"
        title="Cuentas"
        actions={[
          <Button key="transfer" label="Nueva transferencia" icon="swap_horiz" variant="secondary" onClick={() => navigate(PATHS.newTransfer)} />,
          <Button key="new" label="Nueva cuenta" icon="add" onClick={() => navigate(PATHS.newAccount)} />,
        ]}
      />
      <ChipGroup label="Estado de cuentas" options={[{ value: 'ACTIVE', label: 'Activas' }, { value: 'INACTIVE', label: 'Desactivadas' }]} value={status} onChange={(value) => setParams(value === 'INACTIVE' ? { estado: 'desactivadas' } : {})} className="mb-4 lg:mb-6" />
      <Card className="mb-4 lg:mb-6">
        {isLoading && !accounts && <Spinner />}
        {error && <EmptyState icon="error" title="No pudimos cargar tus cuentas" action={<Button label="Reintentar" onClick={refetch} />} />}
        {accounts && groups.length === 0 && (
          <EmptyState
            icon="account_balance"
            title={status === "ACTIVE" ? "No tienes cuentas activas" : "No tienes cuentas desactivadas"}
            text="Registra tus cuentas de débito, ahorro o efectivo para ver su saldo calculado."
            action={status === "ACTIVE" ? <Button label="Nueva cuenta" icon="add" onClick={() => navigate(PATHS.newAccount)} /> : undefined}
          />
        )}
        {groups.map((group) => (
          <Fragment key={group.label}>
            <Overline label={group.label} className="mt-3 mb-1 px-1 first:mt-0" />
            {group.items.map((account) => {
              const isInactive = account.status === 'INACTIVE';
              return (
                <ListRow
                  key={account.id}
                  icon={ICON[account.type]}
                  title={account.alias}
                  detail={
                    isInactive
                      ? `${ACCOUNT_TYPE_LABEL[account.type]} · ${account.currency} · no se ofrece en nuevos registros`
                      : account.type === 'CASH'
                        ? 'Efectivo'
                        : `${ACCOUNT_TYPE_LABEL[account.type]} · ${account.bankName}`
                  }
                  badge={
                    isInactive ? <span className="hidden sm:inline-flex"><Badge label="Desactivada" tone="neutral" /></span> : account.isNegative ? <span className="hidden sm:inline-flex"><Badge label="Saldo negativo" tone="danger" /></span> : undefined
                  }
                  amount={formatMoney(account.balance, account.currency)}
                  amountTone={account.isNegative && !isInactive ? 'expense' : 'neutral'}
                  meta={isInactive ? <><span className="sm:hidden">Desactivada</span><span className="hidden sm:block">Conserva {account.movementCount} movimientos</span></> : account.isNegative ? 'Saldo negativo' : 'Saldo calculado'}
                  onClick={() => navigate(`${withId(PATHS.account, account.id)}${status === "INACTIVE" ? "?estado=desactivadas" : ""}`)}
                />
              );
            })}
          </Fragment>
        ))}
      </Card>
      {(status === 'ACTIVE' ? negatives : []).map((account) => (
        <Callout
          key={account.id}
          tone="warning"
          icon="warning"
          title={`${account.alias} está en negativo`}
          text="Registraste más gastos que ingresos en esta cuenta. Revisa sus movimientos; puedes seguir registrando."
          className="mb-3"
        />
      ))}
    </>
  );
}
