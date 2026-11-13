/**
 * Platform metrics for administrators (21, 21.1, FR-013).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/layout';
import { BarChart, Button, Callout, Card, EmptyState, Spinner, StatCard } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useMetrics } from '@/hooks/useMetrics';
import { PATHS } from '@/navigation/paths';
import { formatPercent, formatShortDate } from '@/utils/format';

const COUNT = new Intl.NumberFormat('en-US');

/**
 * Shows the aggregated metrics from {@link useMetrics}; other roles see the restricted state.
 *
 * @example
 * ```tsx
 * <Route path="/metricas" element={<MetricsPage />} />
 * ```
 */
export function MetricsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { data, isLoading, error } = useMetrics();

  if (!isAdmin || error?.status === 403) {
    return (
      <>
        <PageHeader title="Métricas" />
        <Card>
          <EmptyState icon="lock" title="No tienes acceso a esta sección" text="El panel de métricas es solo para administradores de GQWallet." action={<Button label="Ir a mi dashboard" onClick={() => navigate(PATHS.dashboard)} />} />
        </Card>
      </>
    );
  }
  const metrics = data?.metrics;
  const share = metrics && metrics.registeredUsers > 0 ? (metrics.activeUsers / metrics.registeredUsers) * 100 : 0;
  return (
    <>
      <PageHeader title="Métricas de la plataforma"  />
      {isLoading && !data && <Spinner />}
      {error && <EmptyState icon="error" title="No pudimos cargar las métricas" />}
      {data && metrics && (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 lg:mb-6 lg:max-w-150 lg:gap-4">
            <StatCard size="flow" label="Usuarios registrados" value={COUNT.format(metrics.registeredUsers)} detail="Cuentas creadas en total" />
            <StatCard
              size="flow"
              label={`Usuarios activos · ${metrics.activeWindowDays} días`}
              value={COUNT.format(metrics.activeUsers)}
              detail={`Con al menos un movimiento · ${formatPercent(share)}`}
              tone="success"
            />
          </div>
          <Card title="Movimientos registrados por día" className="mb-4 lg:mb-6">
            <BarChart label="Movimientos registrados por día" data={data.daily.map((day) => ({ label: formatShortDate(day.date).replace('.', ''), value: day.count, valueLabel: COUNT.format(day.count), tone: 'primary' }))} />
          </Card>
          <Callout icon="lock" title="Privacidad" text="Solo ves conteos agregados. Las cuentas, tarjetas, movimientos y datos personales de cada usuario no son accesibles desde este panel." />
        </>
      )}
    </>
  );
}
