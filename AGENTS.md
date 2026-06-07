# Colores y Detalles — AGENTS.md

## Stack
- Expo SDK 54, Expo Router 6 (file-based routing), React Native 0.81.5, React 19.1
- NativeWind v3 (Tailwind CSS), React Native Paper (Material Design 3)
- Zustand (global state), TanStack React Query v5 (server state)
- React Hook Form + Zod (forms), Axios (HTTP)

## Commands
- `npm run lint` — ESLint + Prettier check
- `npm run format` — ESLint fix + Prettier write
- `npm run start:prod` — start with `NODE_ENV=production` (Railway API)
- `npx expo prebuild` — native android/ios dirs
- No typecheck script; no test framework

## Paths
- `@/` maps to `./` (via tsconfig paths + expo experiments.tsconfigPaths)

## Architecture
- **Router groups**: `(auth)/` (login, help, rescue), `(app)/(tabs)/` (home, sales, orders, customers, more), `(app)/(admin)/` (inventory, employees, box, services, payments, settings), `(app)/(super)/` (management)
- **Auth**: Zustand store persisted to expo-secure-store. Session validated in `(app)/_layout.tsx` via `GET /api/validate`
- **API**: Axios at `services/api.ts`. Auto-attaches Bearer token, refreshes from response headers, logs out on 401
- **API base URL**: dynamic — dev uses auto-detected local IP, prod uses Railway URL (see `constants/index.ts` + `network.js`)

## Conventions
- **Prettier**: 120 print width, single quotes, trailing commas (es5), bracketSameLine
- **ESLint**: no `console.log` (allow warn/error/info), no `alert`, no `debugger`, unused vars error (prefix with `_` to skip), `react-native/no-raw-text` skips `CustomText`
- **Tailwind**: custom colors `primary-dark`, `info/success` (#4DB6AC), `warning/error` (#FF5C93). Dark mode via `class` strategy + system color scheme
- **Dual currency**: prices in Bs from server, USD shown via live exchange rate from `GET /api/exchange-rate/actual`

## File structure
- `feature/<module>/` — domain components + types per module
- `services/<name>.service.ts` — API calls per domain
- `schemas/<name>Schema.ts` — Zod schemas
- `store/<name>.ts` — Zustand stores
- `types/<name>.d.ts` — TS type declarations
- `components/` — shared UI (layout/, charts/, Card, ControlledInput, SkeletonLoader, etc.)

## Notes
- `.agents/` + `.cursor/` gitignored
- App package: `com.colorydetalles.app`, scheme: `color-y-detalles`
- Biometric auth via expo-local-authentication
- Camera permission for barcode scanning (iOS)
- `GestureHandlerRootView` + `BottomSheetModalProvider` at root `_layout.tsx`
- `BottomSheetModalProvider` removed from `PaymentModal.tsx`
- `@gorhom/bottom-sheet` v5.2.14, `react-native-gesture-handler` ~2.28.0
- NativeWind v4.2.3 / `react-native-css-interop` v0.2.3: `BottomSheet` (non-modal) crashes with `Cannot read property 'displayName' of undefined` due to `maybeHijackSafeAreaProvider` — only `BottomSheetModal` works
- Box register screens at `(app)/(admin)/box-register/` (admin/superadmin via admin layout guard)
