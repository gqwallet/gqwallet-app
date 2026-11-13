# Auditoría — GQWallet (web, Tailwind) — 2026-11-12

**Veredicto técnico: CUMPLE CON OBSERVACIONES.**

**Veredicto de fidelidad estricta: NO CUMPLE el 100 % píxel por píxel.** Los valores siguientes son mediciones de coincidencia de píxeles y no un porcentaje certificado de fidelidad del producto.

Rama local: `feature/figma-visual-redesign`, creada desde `develop` una vez comprobado que `main`, `develop` y sus referencias remotas coincidían en `7d12ba9`. Referencia: [Figma GQWallet](https://www.figma.com/design/4cXOQZzuMbpjQ1U4x6nxPj?node-id=112-3), páginas Desktop `112:3` y Mobile `112:2`.

## Implementación

- Tokens de color, tipografía Inter, iconos, sombras, indicadores, botones, chips, tablas, navegación y layouts compartidos del diseño vigente.
- Dashboard: distribución de salidas, uso del presupuesto y uso de línea por tarjeta. Presupuesto: anillo y barras por categoría. Flujo: barras mensuales y línea de saldos reales/proyectados. Reportes: barras, rankings y anillos. Pagos fijos: barra de distribución.
- Ajustes de acceso, cuentas, tarjetas/detalle, metas, perfil y calendario móvil con siete columnas. SVG decorativos originales exportados desde Figma, almacenados localmente.
- Los 48 cuerpos de ayuda aplicables coinciden exactamente con la redacción de Figma (50 claves de app, incluidas sus variantes/alias). Las reservas continúan fuera del alcance aprobado.
- Se conservan importes financieros del servidor, monedas separadas, tablas, acciones de pago/edición y comportamiento de formularios. Las lecturas adicionales del dashboard sirven para conteos y barras; su fallo no oculta los indicadores financieros.

## Método de comparación

Chrome instalado, DPR 1, locale `es-PE`, zona `America/Lima`; Inter e iconos locales completamente cargados; transiciones desactivadas al capturar. Escritorio a 1440 px y altura original de cada frame. Móvil a 402 × 874 px. Datos sintéticos interceptados para reproducir ejemplos del prototipo; no son datos de producción.

Se compararon 34 capturas completas: 17 estados representativos en las dos vistas. Se añadieron dos recortes del panel de ayuda para observar su contenido por separado. Cada canal RGB se compara en su coordenada original, sin alinear, escalar ni enmascarar la pantalla. Tolerancia 16 significa diferencia máxima de 16/255 en **cada** canal; exacto exige diferencia cero. Los recortes de ayuda no se incluyen en los agregados para evitar contarlos dos veces.

- Coincidencia exacta ponderada por píxeles: **82.94 %**.
- Coincidencia con tolerancia RGB 16: **95.16 %**.
- Capturas completas idénticas: **0/34**.

Los fondos ocupan buena parte de cada imagen y aumentan la coincidencia; los datos distintos, fuentes rasterizadas y controles nativos también afectan la medición. Este resultado no permite declarar “95 % del diseño implementado” ni certificar pantallas o estados no comparados.

| Pantalla | Escritorio exacto / tol. 16 | Móvil exacto / tol. 16 |
|---|---:|---:|
| accounts | 94.01 % / 97.34 % | 83.07 % / 92.65 % |
| budget | 84.18 % / 93.12 % | 80.09 % / 90.73 % |
| calendar | 80.22 % / 94.30 % | 82.92 % / 94.24 % |
| card-detail | 86.88 % / 96.12 % | 86.01 % / 94.84 % |
| cards | 86.77 % / 93.59 % | 73.58 % / 83.15 % |
| cashflow | 88.28 % / 94.26 % | 85.27 % / 94.61 % |
| dashboard | 83.69 % / 93.48 % | 80.34 % / 92.14 % |
| fixed-payments | 66.74 % / 96.60 % | 79.15 % / 90.42 % |
| fixed-summary | 88.44 % / 95.28 % | 86.61 % / 95.20 % |
| goals | 93.16 % / 97.56 % | 87.03 % / 95.63 % |
| help-budget | 11.96 % / 95.56 % | 40.23 % / 89.51 % |
| help-panel | 89.97 % / 92.44 % | 89.24 % / 91.86 % |
| profile | 92.84 % / 97.64 % | 88.77 % / 96.15 % |
| reports | 89.74 % / 96.59 % | 83.98 % / 93.96 % |
| sign-in | 96.01 % / 98.71 % | 94.22 % / 99.09 % |
| sign-up | 88.17 % / 94.92 % | 88.48 % / 93.60 % |
| transactions | 84.19 % / 95.50 % | 79.85 % / 91.02 % |
| welcome | 91.72 % / 96.54 % | 90.86 % / 96.12 % |

## Diferencias y límites pendientes

1. **Tarjetas:** el resumen vigente presenta el importe de la facturación pendiente más antigua; Figma ilustra la suma de facturaciones cerradas. Se conservó el cálculo existente dentro de este cambio visual. También se conservan sus fechas, estado parcial y acceso al detalle, que generan diferencias de contenido y altura frente al mockup.
2. **Periodo de presupuesto:** la app mantiene el mínimo financiero aprobado de octubre de 2026; el mockup muestra junio. No se cambió esa regla para forzar una coincidencia de la captura.
3. **Ayuda:** el prototipo exportado tiene un fondo gris uniforme; la app muestra la pantalla real debajo del scrim al 35 %, conservando su contexto. El panel coincide en dimensiones (480 × 354 escritorio; 402 × 394 móvil), aunque sus píxeles rasterizados no son idénticos.
4. **Datos sintéticos:** calendario/pagos fijos tienen distinta cantidad de registros y algunos rankings usan importes calculados desde porcentajes redondeados. Estas diferencias aparecen sin ocultarse en los mapas; no deben confundirse con un cambio en cálculos de producción.
5. Quedan diferencias de rasterización de texto/iconos, controles nativos y algunos espaciados. No se certificaron todos los estados alternos y formularios del inventario de Figma. Tampoco Safari/Edge ni sincronización real con Google Calendar.

## Verificación funcional

- Unitarias: **439 aprobadas**, 110 archivos.
- E2E: **98/98 aprobados** en la ejecución completa final (4.4 min), con API/PostgreSQL locales y escenarios con respuestas controladas; log `e2e-accepted.log`.
- Los checks de gráficos comprueban porcentajes reales, límites visuales, valores negativos y moneda vacía sin coordenadas inválidas. Los recorridos existentes verifican compras, pagos parciales, saldos, edición, filtros, categorías, sesión y exportación.
- Typecheck, lint y build: aprobados. Build conserva el aviso de chunk JS mayor a 500 kB (608.69 kB minificado; 178.64 kB gzip).
- Sin desbordamiento horizontal ni errores JavaScript en las 14 capturas adicionales de módulos; checks responsive E2E cubren otros anchos. No se generaron documentos de casos funcionales.

## Auditoría qs-react-frontend

| Regla | Resultado | Ocurrencias |
|---|---|---:|
| ARCH-01 | Cumple | 0 |
| ARCH-02 | Cumple | 0 |
| ARCH-03 | Cumple | 0 |
| ARCH-04 | Cumple | 0 |
| ARCH-05 | Cumple | 0 |
| DATA-01 | Cumple | 0 |
| STYLE-01 | Cumple | 0 |
| STYLE-02 | Cumple | 0 |
| STYLE-03 | Observación | 4 |
| STYLE-04 | Cumple | 0 |
| STYLE-05 | Cumple | 0 |
| STYLE-06 | Cumple | 0 |
| TS-01 | Cumple | 0 |
| TS-02 | Cumple | 0 |
| CONV-01 | Cumple | 0 |
| CONV-02 | Cumple | 0 |
| CONV-03 | Cumple | 0 |
| DOC-01 | Cumple | 0 |
| DOC-02 | Cumple | 0 |
| DOC-03 | Cumple | 0 |
| DOC-04 | Cumple | 0 |
| TEST-01 | Cumple | 0 |
| TEST-02 | Cumple | 0 |
| SEC-01 | Cumple | 0 |

### Fallas (error)

Ninguna regla automática de severidad error falló.

### Observaciones (warn)

- **STYLE-03:** cuatro estilos inline en `OutflowBreakdown` y `CashFlowChart`: colores que referencian tokens y alturas calculadas desde valores del servidor. Son dimensiones/datos de gráficos en tiempo de ejecución; no colores crudos ni medidas estáticas nuevas.
- **STYLE-02 (informativo):** 27 valores arbitrarios dentro de primitivos UI/layout, excepción permitida para dimensiones intrínsecas. Incluyen el tamaño del diálogo y colocación de SVG exportados.

### Checklist manual

- Arquitectura: cumple; páginas componen hooks/componentes; servicios y contratos financieros sin cambios.
- Componentes/tokens: cumple con las diferencias visuales declaradas; indigo por defecto, props tipadas, callbacks y colores globales.
- Mobile-first: cumple en los estados comprobados; tablas desplazan dentro de su contenedor y calendario muestra siete días.
- Accesibilidad: etiquetas de controles y gráficos, foco visible, ayudas con restauración de foco y objetivos táctiles conservados; verificado con los recorridos E2E correspondientes.
- Datos: peticiones adicionales cancelables con `AbortSignal`; sin claves ni tokens nuevos; fallo de datos decorativos cubierto por prueba unitaria.
- Documentación: auditoría TSDoc sin errores; comentarios y contratos en inglés.
- Tests: pruebas de comportamiento aprobadas; no se sustituyeron aserciones de importes financieros para aceptar cambios visuales. Las aserciones de deuda inicial apuntan a su nueva ubicación en el indicador.
- Versiones: README y package.json coinciden; no se añadieron dependencias.
- Ejecución: app local, API y PostgreSQL utilizados para los recorridos; resultados finales abajo.

## Evidencia

- [Comparación visual interactiva local](/Users/gonzaloquedena/.codex/task-progress/gqwallet-redesign-20261112/visual-audit.html): Figma, implementación y mapa rojo de diferencias por pantalla a resolución original.
- [Mediciones RGB](pixel-results.json), [reglas automáticas](architecture-final.json), [textos de ayuda](help-copy-audit.json), [geometría](geometry.json), [controles adicionales](extra-checks.json).
- Capturas, referencias PNG originales, scripts de captura/comparación y logs completos en `/Users/gonzaloquedena/.codex/task-progress/gqwallet-redesign-20261112`. Los enlaces efímeros de descarga de Figma no se usan en ejecución ni se incluyen en estos resultados.

El criterio de funcionamiento se valida con las pruebas; el criterio de fidelidad estricta sigue abierto por las diferencias documentadas. No se certifica el 100 % ni se publica una versión desde esta rama.
