# services

Typed access to the `qs-gqwallet-api` backend. `api-client.ts` is the only HTTP gateway: it sends the httpOnly session cookie and turns failures into `ApiError`.

- One `<resource>.service.ts` per backend context, exporting a plain object of async functions.
- `config.ts` reads the Vite environment.

Not here: React, state or UI copy.

```ts
const cards = await cardsService.list(signal);
```
