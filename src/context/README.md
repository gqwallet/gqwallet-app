# context

State shared by several pages.

- `AuthContext` — session, profile and role, probed through `GET /profiles/me`.
- `ToastContext` — confirmation messages that survive navigation.

Not here: page state (use a hook) or network calls outside the provider.

```tsx
const { profile, signOut } = useAuth();
```
