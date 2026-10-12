# Beez

Smart tools. Real growth. Marketplace for informal merchants, riders and customers in Mombasa.

## Layout

```text
docs/                 specs (production-architecture.md), runbooks, decisions, api
src/
  routes/             URL routes (landing at /, /auth, /sell, /sell/onboarding)
  marketing/          landing-site sections and footer
  features/
    auth/             sign-in screens
    sell/             merchant: onboarding (built), home (built), orders, products, shop, earnings
    discover/ track/ ride/ wallet/ admin/   reserved, not built yet
  shared/             ui, auth, utils, api, i18n, voice, maps, push
e2e/                  Playwright flows
```

Backend: Lovable Cloud (database, auth, server functions, storage). See docs/decisions.
