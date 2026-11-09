/**
 * Return point of the Google consent screen: links the calendar and goes back (17.3, 17.4).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Spinner } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { useCalendar } from '@/hooks/useCalendar';
import { PATHS } from '@/navigation/paths';
import { formatMonth, monthOf, shiftMonth, todayIso } from '@/utils/format';

/**
 * Sends the authorization code through {@link useCalendar} and reports the result.
 *
 * @example
 * ```tsx
 * <Route path="/calendario/conexion" element={<CalendarCallbackPage />} />
 * ```
 */
export function CalendarCallbackPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { notify } = useToast();
  const { connect } = useCalendar(monthOf(todayIso()));
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const code = params.get('code');
    const fail = () => notify({ title: 'No pudimos sincronizar', detail: 'No se autorizó el acceso. La sincronización sigue desactivada; puedes intentarlo de nuevo.', tone: 'danger' });
    const finish = async () => {
      if (!code) fail();
      else if (await connect(code)) {
        const month = monthOf(todayIso());
        const names = [0, 1, 2].map((delta) => formatMonth(shiftMonth(month, delta)).toLowerCase());
        notify({ title: 'Sincronización activada', detail: `Creamos los eventos de tus tarjetas y pagos fijos de ${names[0]}, ${names[1]} y ${names[2]}. Se actualizan solos cada día.` });
      } else fail();
      navigate(PATHS.calendar, { replace: true });
    };
    void finish();
  }, [params, connect, notify, navigate]);

  return <Spinner label="Conectando con Google Calendar…" />;
}
