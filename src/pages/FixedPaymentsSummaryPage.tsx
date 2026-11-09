/**
 * Fixed payments summary by currency (12.7 to 12.9, FR-032).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/layout';
import { Button, Card, ChipGroup, DataTable, EmptyState, ListRow, Spinner, StatCard } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useFixedPaymentSummary } from '@/hooks/useFixedPaymentSummary';
import { PATHS, withId } from '@/navigation/paths';
import type { Currency } from '@/types/api';
import type { KindTotal } from '@/types/obligation';
import { formatAmount, formatMoney } from '@/utils/format';
import { CURRENCY_OPTIONS, FIXED_KIND_ICON, FIXED_KIND_LABEL } from '@/utils/options';

/**
 * Shows the summary of {@link useFixedPaymentSummary} for the chosen currency.
 *
 * @example
 * ```tsx
 * <Route path="/pagos-fijos/resumen" element={<FixedPaymentsSummaryPage />} />
 * ```
 */
export function FixedPaymentsSummaryPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [currency, setCurrency] = useState<Currency>(profile?.preferredCurrency ?? 'PEN');
  const { data, isLoading, error } = useFixedPaymentSummary(currency);
  const money = (value: number) => formatMoney(value, currency);
  const withInstallments = data?.active.filter((payment) => payment.totalInstallments !== null).length ?? 0;
  const total: KindTotal | undefined = data ? { kind: 'RENT', monthly: data.summary.monthlyTotal, annual: data.summary.annualTotal } : undefined;

  return (
    <>
      <PageHeader
        breadcrumb="Pagos fijos / Resumen"
        title="Resumen de pagos fijos"
        subtitle="Total mensual, anual proyectado y desglose por categoría fija."
        actions={[
          <Button key="dues" label="Próximos vencimientos" icon="event" variant="secondary" onClick={() => navigate(PATHS.fixedPayments)} />,
          <Button key="new" label="Nuevo pago fijo" icon="add" onClick={() => navigate(PATHS.newFixedPayment)} />,
        ]}
      />
      <ChipGroup label="Moneda" options={CURRENCY_OPTIONS} value={currency} onChange={setCurrency} className="mb-4" />
      {isLoading && !data && <Spinner />}
      {error && <EmptyState icon="error" title="No pudimos cargar el resumen" />}
      {data && (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 lg:mb-6 lg:grid-cols-3 lg:gap-4">
            <StatCard label="Total mensual" value={money(data.summary.monthlyTotal)} detail={data.active.length ? `Suma de ${data.active.length} pagos fijos activos` : undefined} tone="warning" />
            <StatCard label="Total anual proyectado" value={money(data.summary.annualTotal)} detail={data.active.length ? '12 × total mensual' : undefined} tone="neutral" />
            <StatCard label="Pagos fijos activos" value={String(data.active.length)} detail={withInstallments ? `${withInstallments} con cuotas` : undefined} tone="neutral" className="col-span-2 lg:col-span-1" />
          </div>
          {data.active.length === 0 ? (
            <Card>
              <EmptyState
                icon="event_repeat"
                title={`Aún no tienes pagos fijos en ${currency}`}
                text="Registra tus servicios, suscripciones o deudas para ver cuánto comprometes cada mes."
                action={<Button label="Registrar pago fijo" icon="add" onClick={() => navigate(PATHS.newFixedPayment)} />}
              />
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
              <Card title="Desglose por categoría fija">
                <DataTable
                  caption="Desglose por categoría fija"
                  rows={data.summary.byKind}
                  rowKey={(row) => row.kind}
                  footer={total}
                  columns={[
                    { key: 'kind', header: 'Categoría', render: (row) => (row === total ? `Total ${currency}` : FIXED_KIND_LABEL[row.kind]) },
                    { key: 'monthly', header: 'Mensual', isNumeric: true, render: (row) => formatAmount(row.monthly) },
                    { key: 'annual', header: 'Anual', isNumeric: true, render: (row) => formatAmount(row.annual) },
                  ]}
                />
              </Card>
              <Card title="Pagos fijos activos">
                {data.active.map((payment) => {
                  const due = data.currentDues[payment.id];
                  const extra = due?.installment ? `cuota ${due.installment}` : due?.usualInstrumentId ? null : 'sin medio habitual';
                  return (
                    <ListRow
                      key={payment.id}
                      icon={FIXED_KIND_ICON[payment.kind]}
                      title={payment.description}
                      detail={[FIXED_KIND_LABEL[payment.kind], `día ${payment.dueDay}`, extra].filter(Boolean).join(' · ')}
                      amount={money(payment.amount)}
                      onClick={() => navigate(withId(PATHS.editFixedPayment, payment.id))}
                    />
                  );
                })}
              </Card>
            </div>
          )}
        </>
      )}
    </>
  );
}
