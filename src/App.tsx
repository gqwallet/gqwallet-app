/**
 * Root component: providers and router.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { BrowserRouter } from 'react-router';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { AppRoutes } from '@/navigation/AppRoutes';

/**
 * Mounts the session and toast providers around the routes.
 *
 * @example
 * ```tsx
 * createRoot(container).render(<App />);
 * ```
 */
export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
