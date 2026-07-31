import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/dashboard' },

  // Public (AuthLayout, centered card)
  { path: '/welcome', name: 'welcome', component: () => import('@/modules/iam/views/WelcomeView.vue'), meta: { public: true } },
  { path: '/sign-up', name: 'sign-up', component: () => import('@/modules/iam/views/SignUpView.vue'), meta: { public: true } },
  { path: '/sign-in', name: 'sign-in', component: () => import('@/modules/iam/views/SignInView.vue'), meta: { public: true } },

  // Protected, standalone (own minimal chrome)
  { path: '/onboarding', name: 'onboarding', component: () => import('@/modules/profiles/views/OnboardingView.vue'), meta: { requiresAuth: true } },

  // Protected, inside the app shell (sidebar on desktop, drawer on mobile)
  {
    path: '/',
    component: () => import('@/shared/components/AppShell.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'metrics', name: 'metrics', component: () => import('@/modules/metrics/views/MetricsView.vue'), meta: { title: 'Métricas', requiresAdmin: true } },
      { path: 'dashboard', name: 'dashboard', component: () => import('@/modules/overview/views/DashboardView.vue'), meta: { title: 'Dashboard' } },
      { path: 'cards', name: 'cards', component: () => import('@/modules/cards/views/CardsListView.vue'), meta: { title: 'Tarjetas' } },
      { path: 'cards/new', name: 'card-new', component: () => import('@/modules/cards/views/AddCardView.vue'), meta: { title: 'Nueva tarjeta' } },
      { path: 'cards/:id/edit', name: 'card-edit', component: () => import('@/modules/cards/views/EditCardView.vue'), meta: { title: 'Editar tarjeta' } },
      // FR-018: the view lives in `transactions` (a payment IS a transaction) but the route
      // sits under cards, mirroring the backend's POST /cards/{id}/payments.
      { path: 'cards/:id/pay', name: 'card-pay', component: () => import('@/modules/transactions/views/PayCardView.vue'), meta: { title: 'Pagar tarjeta' } },
      { path: 'cards/:id', name: 'card-detail', component: () => import('@/modules/cards/views/CardDetailView.vue'), meta: { title: 'Detalle de tarjeta' } },
      { path: 'transactions/new', name: 'transaction-new', component: () => import('@/modules/transactions/views/NewTransactionView.vue'), meta: { title: 'Nuevo movimiento' } },
      { path: 'transactions', name: 'history', component: () => import('@/modules/transactions/views/HistoryView.vue'), meta: { title: 'Historial' } },
      { path: 'categories', name: 'categories', component: () => import('@/modules/transactions/views/CategoriesView.vue'), meta: { title: 'Categorías' } },
      { path: 'category-summary', name: 'category-summary', component: () => import('@/modules/overview/views/CategorySummaryView.vue'), meta: { title: 'Resumen por categoría' } },
      { path: 'calendar', name: 'calendar', component: () => import('@/modules/overview/views/CalendarView.vue'), meta: { title: 'Calendario' } },
      { path: 'finances', name: 'finances', component: () => import('@/modules/overview/views/FinancesHubView.vue'), meta: { title: 'Finanzas Personales' } },
      { path: 'profile', name: 'profile', component: () => import('@/modules/profiles/views/ProfileSettingsView.vue'), meta: { title: 'Configuración' } },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  await auth.hydrate();

  if (to.meta.requiresAuth && !auth.authenticated) {
    return { name: 'sign-in' };
  }
  // Defense in depth, not the authorization boundary: the backend already returns 403
  // on /api/v1/metrics for non-admins. This only avoids a broken page if someone
  // pastes the URL directly.
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'dashboard' };
  }
  if (to.meta.public && auth.authenticated) {
    return { name: 'dashboard' };
  }
  return true;
});
