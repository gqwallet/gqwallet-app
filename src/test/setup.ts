/**
 * Vitest setup: DOM matchers and cleanup between tests.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => cleanup());
