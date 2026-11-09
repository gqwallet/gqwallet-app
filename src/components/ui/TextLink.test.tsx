/**
 * Tests of inline route navigation.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { expect, it } from 'vitest';
import { TextLink } from '@/components/ui/TextLink';

it('navigates to its target route', () => {
  render(<MemoryRouter><Routes><Route path="/" element={<TextLink label="Perfil" to="/perfil" />} /><Route path="/perfil" element={<p>Datos personales</p>} /></Routes></MemoryRouter>);
  expect(screen.getByRole('link', { name: 'Perfil' })).toHaveAttribute('href', '/perfil');
  fireEvent.click(screen.getByRole('link', { name: 'Perfil' }));
  expect(screen.getByText('Datos personales')).toBeVisible();
});
