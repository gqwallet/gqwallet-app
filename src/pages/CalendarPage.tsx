/**
 * Payment calendar (17 to 17.4, FR-015, FR-016).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MonthGrid } from '@/components/calendar';
import { PageHeader } from '@/components/layout';
import { Badge, Button, Card, EmptyState, ListRow, Modal, MonthField, SelectField, Spinner, Toggle } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { useCalendar, type CalendarMark } from '@/hooks/useCalendar';
import { PATHS } from '@/navigation/paths';
import { chargesOnDay } from '@/utils/fixedPaymentKinds';
import { formatMoney, formatMonth, formatShortDate, monthOf, parseIsoDate, todayIso } from '@/utils/format';

type Filter = 'ALL' | 'CARDS' | 'DUES';

const FILTERS = [
  { value: 'ALL', label: 'Tarjetas y pagos fijos' },
  { value: 'CARDS', label: 'Solo tarjetas' },
  { value: 'DUES', label: 'Solo pagos fijos' },
];

function shortName(title: string): string {
  return title.split(' ')[0];
}

function labelOf(mark: CalendarMark): string {
  if (mark.kind === 'BILLING') return `${shortName(mark.title)} · facturación`;
  if (mark.kind === 'PAYMENT') return `${shortName(mark.title)} · pago`;
  if (mark.fixedPaymentKind && chargesOnDay(mark.fixedPaymentKind)) return `${mark.title} · se cobra`;
  if (mark.status === 'OVERDUE') return `${mark.title} · vencido`;
  return mark.installment ? `${mark.title} ${mark.installment}` : mark.title;
}

/**
 * Shows the month from {@link useCalendar} and manages the Google Calendar link.
 *
 * @example
 * ```tsx
 * <Route path="/calendario" element={<CalendarPage />} />
 * ```
 */
export function CalendarPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const today = todayIso();
  const current = monthOf(today);
  const [period, setPeriod] = useState(current);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const { data, isLoading, error, link, disconnect, isLinking, consentUrl, isSyncAvailable } = useCalendar(period);
  const marks = (data?.marks ?? []).filter((mark) => filter === 'ALL' || (filter === 'CARDS' ? mark.kind !== 'DUE' : mark.kind === 'DUE'));
  const isEmpty = data !== null && data.cards.length === 0 && data.marks.length === 0;

  const authorize = () => {
    if (!consentUrl) {
      setIsSyncOpen(false);
      notify({ title: 'No pudimos sincronizar', detail: 'No se autorizó el acceso. La sincronización sigue desactivada; puedes intentarlo de nuevo.', tone: 'danger' });
      return;
    }
    window.location.assign(consentUrl);
  };
  const toggleSync = async (isOn: boolean) => {
    if (isOn) setIsSyncOpen(true);
    else if (await disconnect()) notify({ title: 'Sincronización desactivada', detail: 'Ya no actualizaremos tu Google Calendar.' });
  };

  return (
    <>
      <PageHeader informationTopic="Calendario"
        title="Calendario"
        actions={isEmpty ? undefined : <Button label="Sincronizar con Google Calendar" icon="sync" variant="secondary" disabled={!isSyncAvailable} onClick={() => setIsSyncOpen(true)} />}
      />
      {isLoading && !data && <Spinner />}
      {error && <EmptyState icon="error" title="No pudimos cargar tu calendario" />}
      {isEmpty && (
        <Card>
          <EmptyState
            icon="calendar_month"
            title="Tu calendario está vacío"
            text="Registra tu primera tarjeta o pago fijo para ver sus fechas aquí."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button label="Registrar tarjeta" icon="credit_card" onClick={() => navigate(PATHS.newCard)} />
                <Button label="Registrar pago fijo" icon="event_repeat" variant="secondary" onClick={() => navigate(PATHS.newFixedPayment)} />
              </div>
            }
          />
        </Card>
      )}
      {data && !isEmpty && (
        <>
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <MonthField label="Mes" value={period} onChange={setPeriod} />
            <SelectField label="Mostrar" value={filter} options={FILTERS} onChange={(value) => setFilter(value as Filter)} />
          </div>
          <Card title={formatMonth(period, true)} className="mb-4 lg:mb-6">
            <MonthGrid period={period} today={today} marks={marks.map((mark) => ({ key: mark.key, date: mark.date, label: labelOf(mark), color: mark.color, status: mark.status }))} />
          </Card>
          <div className="grid gap-4 lg:grid-cols-[436px_1fr] lg:gap-6">
            <div className="flex flex-col gap-4 lg:gap-6">
              <Card title="Leyenda">
                {data.cards.map((card) => (
                  <ListRow key={card.id} icon="credit_card" title={card.name} detail={`Facturación día ${parseIsoDate(card.billingDate).getDate()} · pago día ${parseIsoDate(card.paymentDueDate).getDate()}`} />
                ))}
                <ListRow icon="event_repeat" title="Pago fijo pendiente" detail="Amarillo · vencido en rojo" />
                <ListRow icon="task_alt" title="Pago fijo pagado" detail="Verde" />
              </Card>
              <Card title="Google Calendar">
                <Toggle
                  label="Tarjetas y pagos fijos · este mes y 2 siguientes"
                  description={!isSyncAvailable ? 'Disponible pronto' : link ? 'Activa · se actualiza sola cada día' : 'Desactivada'}
                  isOn={Boolean(link)}
                  isDisabled={!isSyncAvailable}
                  onChange={(isOn) => void toggleSync(isOn)}
                />
              </Card>
            </div>
            <Card title="Fechas de este mes">
              {marks.length === 0 ? (
                <p className="text-body text-content-secondary">No hay fechas en este mes.</p>
              ) : (
                marks.map((mark) => {
                  const isCharge = mark.fixedPaymentKind !== null && chargesOnDay(mark.fixedPaymentKind);
                  return (
                    <ListRow
                      key={mark.key}
                      icon={mark.kind === 'DUE' ? 'event' : 'credit_card'}
                      title={mark.kind === 'DUE' ? mark.title : `${mark.title} · ${mark.kind === 'BILLING' ? 'facturación' : 'pago'}`}
                      detail={`${formatShortDate(mark.date)} · ${mark.kind === 'DUE' ? isCharge ? 'se cobra' : 'pago fijo' : mark.kind === 'BILLING' ? 'cierre del ciclo' : mark.amount !== null && mark.currency ? `total ${formatMoney(mark.amount, mark.currency)}` : 'fecha de pago'}`}
                      badge={
                        mark.status ? <Badge label={mark.status === 'OVERDUE' ? isCharge ? 'Cobro pendiente' : 'Vencido' : mark.status === 'PAID' ? 'Pagado' : 'Pendiente'} tone={mark.status === 'OVERDUE' ? 'danger' : mark.status === 'PAID' ? 'success' : 'caution'} /> : undefined
                      }
                      amount={mark.amount !== null && mark.currency ? formatMoney(mark.amount, mark.currency) : undefined}
                      onClick={() => navigate(mark.kind === 'DUE' ? PATHS.fixedPayments : PATHS.cards)}
                    />
                  );
                })
              )}
            </Card>
          </div>
        </>
      )}
      <Modal
        isOpen={isSyncOpen}
        icon="sync"
        title="Sincronizar con Google Calendar"
        description="Crearemos y actualizaremos eventos con las fechas de facturación y pago de tus tarjetas."
        onClose={() => setIsSyncOpen(false)}
        footer={
          <>
            <Button label="No autorizar" variant="secondary" onClick={() => setIsSyncOpen(false)} />
            <Button label="Autorizar con Google" isLoading={isLinking} onClick={authorize} />
          </>
        }
      >
        <p className="text-body text-content-secondary">
          Te pediremos autorizar el acceso a tu Google Calendar. Copiaremos las fechas de este mes y los 2 siguientes, y las actualizaremos cada día. Puedes desactivarlo cuando quieras.
        </p>
      </Modal>
    </>
  );
}
