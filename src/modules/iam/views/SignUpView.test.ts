import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import SignUpView from './SignUpView.vue';
import { useAuthActions } from '../composables/useAuthActions';

vi.mock('../composables/useAuthActions');
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  RouterLink: { template: '<a><slot /></a>' },
}));

async function fillValidForm() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Nombre completo'), 'John Doe');
  await user.type(screen.getByLabelText('Correo electrónico'), 'john@doe.com');
  await user.type(screen.getByLabelText('Contraseña'), 'supersecret');
  await user.type(screen.getByLabelText('Confirmar contraseña'), 'supersecret');
  return user;
}

describe('SignUpView', () => {
  const signUp = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useAuthActions).mockReturnValue({
      loading: ref(false),
      error: ref(null),
      signIn: vi.fn(),
      signUp,
    });
  });

  it('blocks submission when the terms checkbox is unchecked', async () => {
    render(SignUpView);
    const user = await fillValidForm();

    await user.click(screen.getByRole('button', { name: 'Registrarme' }));

    expect(signUp).not.toHaveBeenCalled();
    expect(screen.getByText('Debes aceptar los Términos y Condiciones')).toBeInTheDocument();
  });

  it('allows submission once the terms checkbox is checked', async () => {
    render(SignUpView);
    const user = await fillValidForm();

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Registrarme' }));

    expect(signUp).toHaveBeenCalledWith('John Doe', 'john@doe.com', 'supersecret');
  });

  it('links to the terms route', () => {
    render(SignUpView);

    // The `RouterLink` stub renders a plain `<a>` with no `href`, so it has no accessible
    // "link" role in jsdom — assert on the visible text instead.
    expect(screen.getByText('Términos y Condiciones')).toBeInTheDocument();
  });
});
