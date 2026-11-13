/**
 * Referential consolidated view (05.4, 05.5, 05.6, FR-047).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useLocation, useNavigate } from 'react-router';
import { PageHeader } from '@/components/layout';
import { ExchangeRateModal } from '@/components/overview';
import { BreakdownRow, Button, Callout, Card, EmptyState, Spinner, StatCard } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useConsolidatedView } from '@/hooks/useConsolidatedView';
import { PATHS } from '@/navigation/paths';
import { formatMoney, formatShortDate, MONTHS_LONG } from '@/utils/format';

/**
 * Shows the position and month flow converted to the main currency, from {@link useConsolidatedView}.
 *
 * @example
 * ```tsx
 * <Route path="/dashboard/vista-consolidada" element={<ConsolidatedPage />} />
 * ```
 */
export function ConsolidatedPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const preferredTarget = profile?.preferredCurrency ?? 'PEN';
  const { data, isLoading, error, registerRate, isSaving, saveError } = useConsolidatedView(preferredTarget);
  const { pathname } = useLocation();
  const isRateOpen = pathname === PATHS.exchangeRate;
  const back = <Button key="back" label="Volver al dashboard" icon="arrow_back" variant={data?.position.available ? 'soft' : 'secondary'} onClick={() => navigate(PATHS.dashboard)} />;
  const position = data?.position;
  const target = position?.targetCurrency ?? preferredTarget;
  const targetWord = target === 'PEN' ? 'soles' : 'dólares';
  const hasRate = position?.available === true && position.rate !== null;
  const rate = hasRate ? position.rate : null;

  return (
    <>
      <PageHeader
        breadcrumb="Dashboard / Vista consolidada"
        title="Vista consolidada"
        actions={hasRate ? [<Button key="rate" label="Actualizar tipo de cambio" icon="currency_exchange" variant="secondary" onClick={() => navigate(PATHS.exchangeRate)} />, back] : back}
      />
      {isLoading && !data && <Spinner />}
      {error && <EmptyState icon="error" title="No pudimos cargar la vista consolidada" />}
      {hasRate && position && <Callout
        tone="warning"
        icon="info"
        title="Valores referenciales"
        text={`Tipo de cambio ${position.rate} soles por dólar, registrado el ${formatShortDate(position.rateDate ?? '', true)}. Tus valores por moneda no cambian.`}
        className="mb-4 lg:mb-6"
      />}
      {position && (
        <div className="mb-4 grid gap-3 lg:mb-6 lg:grid-cols-3 lg:gap-3 lg:pr-0.5">
          {position.penAvailable !== null && (
            <StatCard informationTopic="Posición por moneda" label="Disponible en soles" value={formatMoney(position.penAvailable, 'PEN')} detail={target === 'PEN' || rate === null ? 'Valor original' : `Valor original · equivale a ${formatMoney(position.penAvailable / rate, 'USD')}`} tone="neutral" />
          )}
          {position.usdAvailable !== null && (
            <StatCard informationTopic="Posición por moneda" label="Disponible en dólares" value={formatMoney(position.usdAvailable, 'USD')} detail={target === 'USD' || rate === null ? 'Valor original' : `Valor original · equivale a ${formatMoney(position.usdAvailable * rate, 'PEN')}`} tone="neutral" />
          )}
          {hasRate && position.consolidated !== null && (
            <StatCard informationTopic="Total referencial"
              label={`Total referencial en ${targetWord}`}
              value={formatMoney(position.consolidated, target)}
              detail={`Referencial · TC ${rate} al ${formatShortDate(position.rateDate ?? '', true)}`}
            />
          )}
        </div>
      )}
      {position && !hasRate && (
        <Card>
          <EmptyState
            icon="currency_exchange"
            title="Registra un tipo de cambio"
            text="Para mostrar una vista consolidada necesitamos un tipo de cambio y su fecha. Mientras tanto, no sumamos tus monedas."
            action={<Button label="Registrar tipo de cambio" icon="add" onClick={() => navigate(PATHS.exchangeRate)} />}
          />
        </Card>
      )}
      {data && position && (
        <>
          <Card informationTopic="Flujo mensual" title={`Flujo de caja de ${MONTHS_LONG[data.flow.month - 1].toLowerCase()}${hasRate ? ' (referencial)' : ''}`}>
            <BreakdownRow label="Flujo en soles" value={formatMoney(data.flow.pen, 'PEN')} />
            <BreakdownRow
              label="Flujo en dólares"
              value={target === 'PEN' && rate !== null ? `${formatMoney(data.flow.usd, 'USD')} · equivale a ${formatMoney(data.flow.usd * rate, 'PEN')}` : formatMoney(data.flow.usd, 'USD')}
            />
            {hasRate && data.flow.consolidated !== null && <BreakdownRow label={`Flujo referencial en ${targetWord}`} value={formatMoney(data.flow.consolidated, target)} tone="total" />}
          </Card>
        </>
      )}
      <ExchangeRateModal isOpen={isRateOpen} isSaving={isSaving} error={saveError} onSubmit={registerRate} onClose={() => navigate(PATHS.consolidated)} />
    </>
  );
}
