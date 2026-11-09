/**
 * Recommended emergency fund by currency (15.5, 15.6, FR-039).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/layout';
import { BreakdownRow, Button, Callout, Card, EmptyState, ProgressBar, Spinner } from '@/components/ui';
import { useEmergencyFund } from '@/hooks/useEmergencyFund';
import { PATHS } from '@/navigation/paths';
import type { EmergencyFund } from '@/types/savings';
import { formatMoney, formatPercent } from '@/utils/format';

function FundCard({ fund, hasGoal, onRegisterFixed }: { fund: EmergencyFund; hasGoal: boolean; onRegisterFixed: () => void }) {
  const money = (value: number) => formatMoney(value, fund.currency);
  const word = fund.currency === 'PEN' ? 'Soles (PEN)' : 'Dólares (USD)';
  const progress = fund.minimum > 0 ? (fund.saved / fund.minimum) * 100 : 0;
  if (!fund.hasFixedPayments) {
    return (
      <Card title={word}>
        <p className="mb-3 text-body text-content-secondary">No tienes pagos fijos activos en {fund.currency}: no hay un fondo recomendado que calcular.</p>
        <Button label="Registrar pago fijo" icon="add" variant="secondary" onClick={onRegisterFixed} />
      </Card>
    );
  }
  return (
    <Card title={word}>
      <BreakdownRow label="Pagos fijos mensuales" value={money(fund.monthlyFixed)} />
      <BreakdownRow label="Mínimo recomendado · 3 meses" value={money(fund.minimum)} />
      <BreakdownRow label="Ideal · 6 meses" value={money(fund.ideal)} />
      {hasGoal && <BreakdownRow label="Saldo de tu fondo de emergencia" value={money(fund.saved)} />}
      <BreakdownRow
        label="Cobertura actual"
        value={hasGoal ? <span className="text-tertiary">{(fund.coverageMonths ?? 0).toFixed(1)} meses</span> : <span className="text-content-muted">Sin meta asignada</span>}
        tone="total"
      />
      {hasGoal ? (
        <div className="mt-3">
          <div className="mb-1 flex justify-between">
            <span className="text-subtitle">Hacia el mínimo</span>
            <span className="text-caption text-content-secondary">{formatPercent(progress)}</span>
          </div>
          <ProgressBar value={progress} tone="warning" label="Avance hacia el mínimo" />
        </div>
      ) : (
        <Callout
          tone="warning"
          className="mt-3"
          title={`Sin fondo en ${fund.currency === 'PEN' ? 'soles' : 'dólares'}`}
          text={`Marca una meta en ${fund.currency} como fondo de emergencia para medir tu cobertura.`}
        />
      )}
    </Card>
  );
}

/**
 * Shows the funds from {@link useEmergencyFund}.
 *
 * @example
 * ```tsx
 * <Route path="/metas/fondo-de-emergencia" element={<EmergencyFundPage />} />
 * ```
 */
export function EmergencyFundPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useEmergencyFund();
  const hasAny = data ? data.pen.hasFixedPayments || data.usd.hasFixedPayments : false;
  return (
    <>
      <PageHeader breadcrumb="Metas / Fondo de emergencia" title="Fondo de emergencia" subtitle="Cuánto deberías reservar según tus pagos fijos mensuales, por moneda." onBack={() => navigate(PATHS.goals)} />
      {isLoading && !data && <Spinner />}
      {error && <EmptyState icon="error" title="No pudimos calcular tu fondo de emergencia" />}
      {data && !hasAny && (
        <Card>
          <EmptyState
            icon="event_repeat"
            title="Registra tus pagos fijos"
            text="El fondo recomendado se calcula con tus pagos fijos mensuales: entre 3 y 6 meses de ellos."
            action={<Button label="Registrar pago fijo" icon="add" onClick={() => navigate(PATHS.newFixedPayment)} />}
          />
        </Card>
      )}
      {data && hasAny && (
        <>
          <div className="mb-4 grid gap-4 lg:mb-6 lg:grid-cols-2 lg:gap-6">
            <FundCard fund={data.pen} hasGoal={data.hasPenGoal} onRegisterFixed={() => navigate(PATHS.newFixedPayment)} />
            <FundCard fund={data.usd} hasGoal={data.hasUsdGoal} onRegisterFixed={() => navigate(PATHS.newFixedPayment)} />
          </div>
          <Callout title="Cómo leerlo" text="La cobertura indica cuántos meses de pagos fijos podrías cubrir con tu fondo. Lo recomendable es tener entre 3 y 6 meses." />
        </>
      )}
    </>
  );
}
