/**
 * Browser entry point: mounts the app and loads the global styles.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import '@/styles/global.css';

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
