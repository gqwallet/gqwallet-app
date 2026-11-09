# components

Presentational React components. They render what they receive by props and report user actions through callbacks.

- `ui/` — design-system primitives mapped to the Figma components (Button, Chip, TextField, Card, Modal…).
- `layout/` — app structure: shell, sidebar, mobile header, auth layout, money pattern.
- `<feature>/` — components of one feature (transactions, cards, budget…). They compose `ui/` and never import another feature.

Not here: network calls, `services/`, data hooks or `context/`.

```tsx
<Button label="Nuevo movimiento" icon="add" onClick={onCreate} />
```
