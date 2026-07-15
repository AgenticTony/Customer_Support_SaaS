# Customer_Support_SaaS

A multi-tenant B2B AI customer-support platform — an operator dashboard plus an embeddable customer chat widget. A build-along replication of Code With Antonio's "Echo" course (in progress).

## Monorepo (pnpm + Turborepo)

| Path | Description |
|---|---|
| `apps/web` | Operator dashboard (Next.js 15, dev on :3000) |
| `apps/widget` | End-customer chat widget (Next.js 15, dev on :3001) |
| `packages/ui` | Shared shadcn/ui components |
| `packages/math` | Internal workspace-package demo |

## Develop

```bash
pnpm install
pnpm dev      # turbo dev → web on :3000, widget on :3001
```
