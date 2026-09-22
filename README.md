# HQ Learn

Circle HQ's role-based learning management interface.

## Stack
- **Framework:** Vite React
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** lucide-react

## Installed Packages
- zustand
- axios
- motion
- react-router-dom

## Getting Started

```bash
cd circle-lm
npm run dev
```

## Application structure

```text
src/
├── app/providers/       # Root provider composition
├── components/          # Shared visual components
├── contexts/            # Focused cross-app UI contexts
├── features/
│   ├── auth/            # Session state and authentication actions
│   └── workspace/       # Shared LMS domain state and actions
├── layouts/             # Outlet-based application shells
├── pages/               # Page-level UI
├── routes/              # Route definitions, guards, and role adapters
├── utils/               # Framework-independent helpers
└── types/               # Shared domain types
```

## Routes and roles

Routes use stable, bookmarkable URLs and are protected by both authentication and role guards.

- Student: `/student/*`
- Facilitator: `/facilitator/*`
- Admin: `/admin/*`
- Authentication: `/auth`

Navigation metadata lives in `src/routes/routeConfig.ts`, so the router, sidebar, active states, and role landing pages share one source of truth. Route-specific adapters live in `StudentRoutes.tsx`, `FacilitatorRoutes.tsx`, and `AdminRoutes.tsx`; they connect page UI to navigation and shared domain actions without putting those concerns back into `App.tsx`.

## Development flow switcher

The Student, Facilitator, and Admin tabs remain visible in the workspace shell while the product is in development. Switching a tab changes both the active role and route, which makes it possible to follow one record across the complete prototype flow without signing in again. **This is a development aid, not an authorization boundary**; the backend must still enforce identity, permissions, and tenant access for every request.

## Connected prototype flows

- Admins can create, edit, publish, duplicate, and archive courses, including reusable modules and lessons.
- Admins can invite students or facilitators, assign facilitators to courses, and update those assignments later.
- Cohorts, live classes, and assessments have create/edit lifecycle actions backed by the shared workspace model.
- Published courses appear in the assigned facilitator workspace and in the eligible student cohort.
- Students can submit an assignment or final project; it enters the facilitator review queue, and approval or revision is reflected back in the student workspace.
- Admin class scheduling and facilitator class actions update the student next-class experience.

The in-memory records and actions are defined under `src/features/workspace` with domain types in `src/types/workspace.ts`. They are intentionally shaped as a frontend contract that can be replaced by API queries and mutations when the backend is connected.
