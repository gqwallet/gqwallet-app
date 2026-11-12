/**
 * Contextual information accessibility and independent card actions.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { InformationButton } from '@/components/ui/InformationButton';
import { StatCard } from '@/components/ui/StatCard';
it('opens with keyboard, traps focus, closes and restores the trigger', async () => {
 const user = userEvent.setup(); render(<InformationButton topic="Tipo de ingreso" />);
 const trigger = screen.getByRole('button', { name: 'Información sobre Tipo de ingreso' });
 trigger.focus(); await user.keyboard('{Enter}');
 expect(screen.getByRole('dialog')).toHaveTextContent('Extraordinario');
 await user.tab(); expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus();
 await user.tab(); expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus();
 await user.keyboard('{Escape}'); expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); expect(trigger).toHaveFocus();
});
it('keeps information independent from a clickable financial card', async () => {
 const click = vi.fn(); const user = userEvent.setup();
 render(<StatCard label="Posición neta" value="S/ 100.00" informationTopic="Posición neta" onClick={click} />);
 await user.click(screen.getByRole('button', { name: 'Información sobre Posición neta' }));
 expect(click).not.toHaveBeenCalled(); expect(document.querySelector('button button')).toBeNull();
});
