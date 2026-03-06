# Warehouse Inventory Frontend (MVP)

Frontend-first implementation of the Warehouse Inventory Web App from `prd.md`, built with:

- SvelteKit (Svelte 5)
- Tailwind CSS v4
- shadcn-svelte UI components

## Features (MVP Frontend)

- Authentication UI:
  - `/login`
  - `/signup`
- Protected app area:
  - `/dashboard`
  - `/products`
  - `/products/:id`
  - `/stock-history`
- Product management UI:
  - Create product (unique SKU validation)
  - Search products by name/SKU
  - Product detail page with stock actions
- Stock management UI:
  - Add stock
  - Remove stock (prevents negative stock)
  - Movement history tracking
- Dashboard metrics:
  - Total products
  - Total units in stock
  - Low-stock count
  - Out-of-stock count
  - Recent stock activity

## Notes

- This is currently frontend-first and uses `localStorage` for persistence.
- Auth and inventory data are stored on the client side.
- Seed demo account:
  - Email: `demo@inventory.app`
  - Password: `demo1234`

## Development

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Type and Svelte checks:

```bash
npm run check
```

Production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Project Structure (Key Files)

- `src/routes/login/+page.svelte`
- `src/routes/signup/+page.svelte`
- `src/routes/(app)/+layout.svelte`
- `src/routes/(app)/dashboard/+page.svelte`
- `src/routes/(app)/products/+page.svelte`
- `src/routes/(app)/products/[id]/+page.svelte`
- `src/routes/(app)/stock-history/+page.svelte`
- `src/lib/stores/auth.ts`
- `src/lib/stores/inventory.ts`
