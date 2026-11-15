/**
 * Tests of the decorative credit-card face.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { render } from '@testing-library/react';
import { expect, it } from 'vitest';
import { CreditCardVisual } from '@/components/ui/CreditCardVisual';

it('paints the card palette and stays out of the accessibility tree', () => {
  const { container, rerender } = render(<CreditCardVisual bankName="Interbank" currency="PEN" color="#3333B2" />);
  const face = container.querySelector('[data-card-face]')!;
  expect(face).toHaveAttribute('aria-hidden', 'true');
  expect(face).toHaveTextContent('Interbank');
  expect(face).toHaveTextContent('Crédito · PEN');
  expect(face).toHaveClass('from-card-indigo');
  rerender(<CreditCardVisual bankName="BCP" currency="USD" color="#338033" />);
  expect(container.querySelector('[data-card-face]')).toHaveClass('from-card-green');
  rerender(<CreditCardVisual bankName="BCP" currency="USD" color="#000000" />);
  expect(container.querySelector('[data-card-face]')).toHaveClass('from-card-indigo');
});
