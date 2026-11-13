/**
 * New or edited card (11.2 to 11.5), with deletion when editing.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { CardForm } from '@/components/cards';
import { useBanks } from '@/hooks/useBanks';
import { PageHeader } from '@/components/layout';
import { Button, Callout, EmptyState, Modal, Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useCardDetail } from '@/hooks/useCardDetail';
import { useCardWrite } from '@/hooks/useCards';
import { PATHS, withId } from '@/navigation/paths';
import type { RegisterCardInput } from '@/types/card';
import { todayIso } from '@/utils/format';

const FORM_ID = 'card-form';

/**
 * Registers or edits a card through {@link useCardWrite}.
 *
 * @example
 * ```tsx
 * <Route path="/tarjetas/nueva" element={<CardFormPage />} />
 * ```
 */
export function CardFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const banks = useBanks(profile?.countryCode);
  const { notify } = useToast();
  const detail = useCardDetail(id ?? '');
  const { register, update, remove, countMovements, isSaving, error } = useCardWrite();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [movements, setMovements] = useState(0);
  const card = id ? detail.data?.card ?? null : null;

  useEffect(() => {
    if (!id) return undefined;
    let isCurrent = true;
    void countMovements(id).then((count) => isCurrent && setMovements(count));
    return () => {
      isCurrent = false;
    };
  }, [id, countMovements]);

  if (id && detail.isLoading && !card) return <Spinner />;
  if (id && !card) return <EmptyState icon="error" title="No encontramos esta tarjeta" />;

  const handleSubmit = async (input: RegisterCardInput) => {
    if (card) {
      const { currency: _currency, ...rest } = input;
      void _currency;
      if (await update(card.id, rest)) {
        notify({ title: 'Cambios guardados', detail: `${input.name} se actualizó en tus tarjetas y tu calendario.` });
        navigate(withId(PATHS.card, card.id));
      }
    } else if (await register(input)) {
      notify({ title: 'Tarjeta registrada', detail: `${input.name} ya aparece en tus tarjetas y tu calendario.` });
      navigate(PATHS.cards);
    }
  };
  const handleDelete = async () => {
    if (card && (await remove(card.id))) {
      notify({ title: 'Tarjeta eliminada', detail: movements > 0 ? `Sus ${movements} movimientos se conservan como gastos sin tarjeta.` : `${card.name} se eliminó.` });
      navigate(PATHS.cards);
    }
  };

  return (
    <>
      <PageHeader
        breadcrumb={card ? `Tarjetas / ${card.name}` : 'Tarjetas / Nueva'}
        title={card ? `Editar ${card.name}` : 'Nueva tarjeta'}
        actions={card ? <Button label="Eliminar tarjeta" icon="delete" variant="secondary" onClick={() => setIsDeleteOpen(true)} /> : undefined}
      />
      {error && <Callout tone="danger" text={error} className="mb-4" />}
      <CardForm banks={banks.data ?? []} id={FORM_ID} initial={card} billingCycles={detail.data?.billingCycles} hasMovements={movements > 0} defaultCurrency={profile?.preferredCurrency ?? 'PEN'} today={todayIso()} onSubmit={handleSubmit} />
      <div className="mt-4 flex flex-col-reverse gap-2 lg:mt-6 lg:flex-row lg:justify-end">
        <Button label="Cancelar" variant="secondary" onClick={() => navigate(-1)} />
        <Button type="submit" form={FORM_ID} label={card ? 'Guardar cambios' : 'Guardar tarjeta'} icon="check" isLoading={isSaving && !isDeleteOpen} />
      </div>
      <Modal
        isOpen={isDeleteOpen}
        icon="delete"
        title={`¿Eliminar ${card?.name ?? 'la tarjeta'}?`}
        description={movements > 0 ? `Tiene ${movements} movimientos vinculados. Se conservarán como gastos sin tarjeta asociada.` : 'No tiene movimientos vinculados.'}
        onClose={() => setIsDeleteOpen(false)}
        footer={
          <>
            <Button label="Cancelar" variant="secondary" onClick={() => setIsDeleteOpen(false)} />
            <Button label="Eliminar tarjeta" variant="danger" isLoading={isSaving} onClick={handleDelete} />
          </>
        }
      />
    </>
  );
}
