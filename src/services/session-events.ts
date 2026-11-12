/**
 * Session generation and invalidation notifications, independent of React.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
let generation = 0;
let active = false;
const listeners = new Set<() => void>();

/** Coordinates existing HTTP requests without sending additional requests. */
export const sessionEvents = {
  /** Current generation; late responses from older sessions are ignored. */
  current: () => generation,
  /** Begins a newly verified or newly issued session. */
  begin: () => { active = true; return ++generation; },
  /** Invalidates outstanding requests without announcing expiry. */
  end: () => { active = false; generation++; },
  /** Announces at most one expiration for the active generation. */
  expire: (requestGeneration: number) => {
    if (!active || requestGeneration !== generation) return;
    active = false;
    generation++;
    listeners.forEach((listener) => listener());
  },
  /** Registers a UI-owned expiration listener and returns its cleanup. */
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
};
