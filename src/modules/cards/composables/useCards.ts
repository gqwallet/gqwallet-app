import { ref } from 'vue';
import { cardsService } from '../services/cardsService';
import type { Card, RegisterCardPayload } from '../types/Card';

export function useCards() {
  const cards = ref<Card[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchCards() {
    loading.value = true;
    error.value = null;
    try {
      cards.value = await cardsService.list();
    } catch {
      error.value = 'No se pudieron cargar las tarjetas';
    } finally {
      loading.value = false;
    }
  }

  async function registerCard(payload: RegisterCardPayload) {
    const created = await cardsService.register(payload);
    cards.value.push(created);
    return created;
  }

  return { cards, loading, error, fetchCards, registerCard };
}
