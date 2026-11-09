# hooks

UI state and use cases. Every data hook calls `services/` and returns a stable shape: `{ data, isLoading, error, refetch }` for reads and `{ submit, isSubmitting, error }` for writes.

- `useResource` and `useMutation` are the generic building blocks; feature hooks compose them.
- Requests are cancelled on unmount.

Not here: JSX, Tailwind classes or direct `fetch`.

```ts
const { data, isLoading } = useDashboard('PEN');
```
