/**
 * Contextual information from FR-059 and the approved product copy.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
/** Informational copy keyed by the visible topic. */
export const INFORMATION: Readonly<Record<string, string>> = {
  "Dashboard": "Resume tus saldos, deudas y movimientos del mes. Revisa cada moneda por separado; toca el (i) de un indicador para entenderlo.",
  "Cuentas": "Registra tus cuentas de débito, ahorro o efectivo. Activas es el filtro inicial; en Desactivadas consultas las que ya no usas. No se eliminan: conservan su saldo e historial y dejan de ofrecerse en nuevos registros.",
  "Movimientos": "Registra y consulta ingresos, gastos y transferencias por su fecha económica. Los movimientos anulados no cuentan en los totales.",
  "Tarjetas": "Controla tu línea, consumos y facturaciones pendientes. Una compra genera deuda; pagarla reduce esa deuda y el saldo de la cuenta elegida, sin crear otro gasto.",
  "Pagos fijos": "Organiza obligaciones recurrentes y cuotas. Cada vencimiento queda pendiente hasta que confirmes su pago; puedes corregir el importe realmente pagado.",
  "Presupuesto": "Normal: menos de 75 %. Atención: de 75 % a menos de 100 %. Alcanzado: 100 %. Excedido: más de 100 %. Con límite 0 (decidiste no gastar): Sin gasto sin consumo y Excedido desde el primer gasto. Sin límite: Sin presupuesto.",
  "Flujo de caja": "Compara ingresos y salidas efectivas. Las compras con tarjeta salen al pagar la tarjeta. Los compromisos pendientes son informativos; los meses marcados con * son proyecciones.",
  "Metas": "Define un objetivo y registra aportes manuales desde tus cuentas, en la misma moneda. Los aportes aumentan tu progreso y no se registran como gastos.",
  "Metas de ahorro": "Define un objetivo y registra aportes manuales desde tus cuentas, en la misma moneda. Los aportes aumentan tu progreso y no se registran como gastos.",
  "Reportes": "Analiza ingresos o gastos por periodo, moneda y filtros. Los totales y porcentajes se recalculan con tu selección; no se mezclan soles y dólares.",
  "Calendario": "Muestra vencimientos de pagos fijos y fechas de tus tarjetas. Una fecha en el calendario no confirma un pago: debes registrarlo.",
  "Saldo en cuentas": "Es el dinero de tus cuentas en la moneda elegida: saldo inicial + ingresos − gastos ± transferencias. No descuenta deudas de tarjetas ni pagos pendientes.",
  "Deuda de tarjetas": "Es lo que aún debes en tus tarjetas: deuda inicial + consumos − pagos. No equivale al dinero que sale de tus cuentas este mes.",
  "Posición neta": "Posición neta = saldo en cuentas − deuda de tarjetas. Los compromisos todavía no salen de tus cuentas: se muestran aparte y no se restan.",
  "Ingresos": "Suma los ingresos registrados en el mes y la moneda elegidos. Las transferencias entre tus cuentas no cuentan como ingresos.",
  "Salidas": "Incluyen gastos desde cuentas, pagos fijos pagados y pagos de tarjeta. Una compra con tarjeta afecta tus consumos; el dinero sale de tu cuenta cuando registras su pago.",
  "Compromisos": "Son pagos fijos pendientes y facturaciones de tarjetas por pagar hasta fin de mes, incluidas las vencidas. Aún no son salidas ni se restan otra vez de tu posición neta.",
  "Tipo de ingreso": "Fijo: cobros regulares y previsibles, como tu sueldo.\n\nVariable: cobros cuyo monto o llegada cambia, como ventas o comisiones.\n\nExtraordinario: cobros excepcionales, como un premio o bono ocasional.\n\nEs opcional. Si no eliges uno, aparecerá como «Sin dato».",
  "Pago de tarjeta": "Se registra como transferencia desde una cuenta en PEN: baja la línea utilizada y tus gastos del mes no cambian."
};
