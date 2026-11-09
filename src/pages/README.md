# pages

One full screen per file, named `<Name>Page.tsx`. A page composes components and takes data and actions from hooks.

Not here: `services/` imports, `try/catch` of API calls or raw form controls when a `ui/` primitive exists.

```tsx
<Route path="/tarjetas" element={<CardsPage />} />
```
