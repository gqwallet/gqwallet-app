<script setup lang="ts">
// Static legal content — no ViewModel state to manage, so no composable here.
import { RouterLink } from 'vue-router';
import AuthLayout from '@/shared/components/AuthLayout.vue';
</script>

<template>
  <AuthLayout wide>
    <template #topbar-end>
      <RouterLink :to="{ name: 'sign-up' }" class="text-[13px] font-medium text-brand">Volver</RouterLink>
    </template>

    <h1 class="mb-1 shrink-0 text-[19px] font-bold text-ink">Términos y Condiciones</h1>
    <p class="mb-6 shrink-0 text-[12px] text-muted">Última actualización: agosto de 2026</p>

    <div class="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
      <section>
        <h2 class="mb-1 text-[14px] font-bold text-ink">1. Aceptación de los términos</h2>
        <p class="text-[13px] text-muted">
          Al crear una cuenta en GQWallet aceptas estos Términos y Condiciones y nuestra Política de Privacidad. Si
          no estás de acuerdo, no debes registrarte ni usar la aplicación.
        </p>
      </section>

      <section>
        <h2 class="mb-1 text-[14px] font-bold text-ink">2. Elegibilidad</h2>
        <p class="text-[13px] text-muted">
          GQWallet está dirigido a personas naturales mayores de 18 años. Al registrarte declaras que cumples con
          este requisito.
        </p>
      </section>

      <section>
        <h2 class="mb-1 text-[14px] font-bold text-ink">3. Qué es GQWallet</h2>
        <p class="text-[13px] text-muted">
          GQWallet es una herramienta de organización financiera personal que te permite registrar tarjetas de
          crédito, gastos, ingresos y ciclos de facturación de forma manual, y recibir recomendaciones informativas
          sobre tus finanzas.
        </p>
      </section>

      <section>
        <h2 class="mb-1 text-[14px] font-bold text-ink">4. Control sin exposición: no vinculamos tu banco</h2>
        <p class="text-[13px] text-muted">
          GQWallet NO se conecta a tu banco, NO solicita ni almacena el número de tu tarjeta, el código de
          seguridad (CVV), tus cuentas bancarias ni tus credenciales de banca en línea. Los datos que registras
          sobre tus tarjetas (nombre, banco emisor, línea de crédito, % de seguro desgravamen, fechas de
          facturación y pago) son exclusivamente operativos y los ingresas tú mismo — nunca los leemos de tu banco.
        </p>
      </section>

      <section>
        <h2 class="mb-1 text-[14px] font-bold text-ink">5. Recomendaciones informativas, no asesoría financiera</h2>
        <p class="text-[13px] text-muted">
          Las sugerencias y alertas que GQWallet genera sobre tus tarjetas y gastos son orientativas. No
          constituyen asesoría financiera profesional y eres libre de aceptarlas, ignorarlas o descartarlas en
          cualquier momento.
        </p>
      </section>

      <section>
        <h2 class="mb-1 text-[14px] font-bold text-ink">6. Tratamiento de datos personales</h2>
        <p class="text-[13px] text-muted">
          Tus datos personales se procesan conforme a la Ley N.° 29733, Ley de Protección de Datos Personales del
          Perú. Protegemos tu información con medidas de seguridad técnicas y organizativas: tu contraseña nunca
          se guarda ni se muestra en texto plano, y tu sesión permanece protegida mientras usas la aplicación.
        </p>
      </section>

      <section>
        <h2 class="mb-1 text-[14px] font-bold text-ink">7. Tus derechos</h2>
        <p class="text-[13px] text-muted">
          Puedes solicitar acceso, rectificación, cancelación u oposición (derechos ARCO) sobre tus datos
          personales en cualquier momento contactando al equipo de GQWallet.
        </p>
      </section>

      <section>
        <h2 class="mb-1 text-[14px] font-bold text-ink">8. Responsabilidad del usuario</h2>
        <p class="text-[13px] text-muted">
          Eres responsable de la exactitud de la información que registras manualmente (montos, fechas, tarjetas) y
          de mantener la confidencialidad de tu contraseña.
        </p>
      </section>

      <section>
        <h2 class="mb-1 text-[14px] font-bold text-ink">9. Cambios a estos términos</h2>
        <p class="text-[13px] text-muted">
          Podemos actualizar estos Términos y Condiciones. Los cambios relevantes se comunicarán dentro de la
          aplicación.
        </p>
      </section>

      <section>
        <h2 class="mb-1 text-[14px] font-bold text-ink">10. Contacto</h2>
        <p class="text-[13px] text-muted">
          Para dudas sobre estos términos o sobre el tratamiento de tus datos, escríbenos desde la aplicación.
        </p>
      </section>
    </div>
  </AuthLayout>
</template>
