# Glossé Nails

A React Native nail salon management app for managing technicians' turns, payroll by tracking transactions, technicians, earnings, gift cards, and services.

## Working with agents

Start with [AGENTS.md](AGENTS.md) and the [agent workflow](docs/agent-workflow.md).
Use one bounded task with acceptance criteria, implementation, executable checks,
review and handoff. The canonical [glosse-task skill](.agents/skills/glosse-task/SKILL.md)
and [review guidance](.agents/skills/glosse-task/references/review.md) are portable.
Cursor entry points under `.cursor/` reference the same guidance; Markdown agent
definitions do not start agents by themselves.
Task contracts and verification evidence live under `docs/tasks/`.

```bash
npm run test:backend -- convex/authorization.test.ts
npm run verify:backend
npm run test:app
npm run verify:quality
node scripts/check-agent-docs.mjs
```

These checks use synthetic data without contacting a Convex deployment. The
backend gate includes app/backend typechecks, backend lint and backend tests;
`verify:quality` also runs full app lint and app interaction tests. Before each
normal local commit, Husky runs staged JavaScript/TypeScript ESLint, then the full
`verify:quality` gate. Any lint warning/error, typecheck error or failing test
blocks the commit; files are not automatically fixed or staged.

Full checks run against the working tree, which may differ from a partially
staged commit. Hooks can be bypassed with `--no-verify` or `HUSKY=0`; passing
checks catches covered regressions, not every bug. PR CI checks the pushed commit
in a fresh checkout. The GitHub pull-request workflow runs the backend and app gates
plus iOS, Android and web exports. These checks do not replace device, browser
interaction or live sign-in testing. See [the access policy](docs/access-policy.md)
for role permissions, intentional public endpoints and callback configuration.
See [financial policy](docs/financial-policy.md) for approved rounding rules,
characterized behavior and unresolved financial decisions.

The planning and implementation skills are tracked under `.agents/skills/`.
Other local Expo/Convex skills are optional installed tools; their presence is
not assumed on a new clone. Use the matching skill when available, or current
official documentation. Record source/revision in a task before adding or
updating a vendor skill; this does not authorize installation or deployment.

## Tech Stack

- **Framework**: [Expo](https://expo.dev) SDK 57 + React Native 0.86 + React 19
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) 57.x (file-based, typed routes; see package.json for the pinned version)
- **Backend**: [Convex](https://www.convex.dev/) (real-time database + auth)
- **Styling**: [Uniwind](https://github.com/nicksrandall/uniwind) (Tailwind for React Native) + TailwindCSS v4
- **Theming**: [React Native Papers](https://github.com/callstack/react-native-paper) Material Design for React Native (Android & iOS)
- **Forms**: Zod validation
- **Code Quality**: ESLint with Expo configuration for lint and staged checks; Biome is available for formatting

## Getting Started

### Prerequisites

- Node.js 22 (used by the pull-request workflow)
- iOS Simulator (Xcode) or physical device
- Convex account & project

### Install

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```bash
EXPO_PUBLIC_CONVEX_URL=<your-convex-deployment-url>
```

### Development

Run both processes simultaneously in separate terminals:

```bash
# Terminal 1 — Start Convex backend (watches for schema/function changes)
npx convex dev

# Terminal 2 — Start Expo dev server
npx expo start --clear
```

Then press `i` to open the iOS Simulator, or scan the QR code with Expo Go on a physical device.

## Project Structure

```bash
app/                    # Expo Router file-based routes
├── _layout.tsx         # Root layout (providers: Convex, Theme, SafeArea)
├── (root)/
│   ├── (auth)/         # Authentication screens
│   └── (main)/
│       ├── (tabs)/     # Tab navigation (earnings, transactions)
│       ├── technician/ # Technician management
│       ├── transaction/# Transaction forms & details
│       ├── gift/       # Gift card management
│       ├── report/     # Reporting screens
│       └── settings.tsx
components/             # Shared UI components
contexts/               # React contexts (theme, date)
convex/                 # Convex backend (schema, queries, mutations)
hooks/                  # Custom hooks
utils/                  # Helpers, types, validation
```

## Database Schema

Managed by Convex in `convex/schema.ts`:

| Table                   | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `transactions`          | Salon transactions with payment details  |
| `categories`            | Service categories                       |
| `services`              | Individual services with pricing         |
| `giftCards`             | Gift card tracking                       |
| `dailyTechnicianShifts` | Daily shift assignments                  |
| `users`                 | User accounts (via Convex Auth)          |

## Code Quality

Biome provides formatting conventions. ESLint is the app lint gate.

```bash
npm run verify:quality
```

## Build & Deploy iOS

```bash
# Deploy Convex Backend
npx convex deploy

# iOS production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

## Build & Deploy Web

Set the required `EXPO_PUBLIC_*` variables in the EAS **production** environment
before exporting, including `EXPO_PUBLIC_CONVEX_URL`. The export below disables
local dotenv loading so missing EAS variables cannot fall back to `.env` or
`.env.local`. Check that the selected URL is the intended production backend.

```bash
# Export using the EAS production environment
EXPO_NO_DOTENV=1 eas env:exec production \
  'npx expo export --platform web --clear'

# After inspecting the exported backend destination, deploy once to production
eas deploy --environment production --prod
```

`EXPO_PUBLIC_*` values are embedded during export. The deploy `--environment`
flag supplies server-side variables for API routes; `--prod` assigns the deployment
to the production URL. Neither changes an already exported browser bundle.
`--clear` clears the bundler cache, and `eas.json` build profiles configure native
EAS builds rather than this standalone web export.

See [web export and destination verification](docs/web-preview.md) before release,
and [Expo environment variable usage](https://docs.expo.dev/eas/environment-variables/usage/).

## Convex Auth Setup

Reference docs for initial auth configuration:

- [Convex Auth docs](https://labs.convex.dev/auth/setup/)

```bash
npm install @convex-dev/auth @auth/core@0.37.0
npx @convex-dev/auth
npx expo install expo-secure-store
```

```bash
# Deployment used by `npx convex dev`
CONVEX_DEPLOYMENT=dev:rapid-guineapig-653 # team: francis-pham-da47c, project: glosse-nail-app

EXPO_PUBLIC_CONVEX_URL=https://rapid-guineapig-653.convex.cloud

EXPO_PUBLIC_CONVEX_SITE_URL=https://rapid-guineapig-653.convex.site
```

## Local MCP credentials

The GitHub MCP server inherits `GITHUB_PERSONAL_ACCESS_TOKEN` from the process
environment. Supply it through your local credential or shell setup before
starting the client; never put a literal token in `.mcp.json` or tracked files.
