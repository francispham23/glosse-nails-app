# Glossé Nails

A React Native nail salon management app for managing technicians' turns, payroll by tracking transactions, technicians, earnings, gift cards, and services.

## Tech Stack

- **Framework**: [Expo](https://expo.dev) SDK 54 + React Native 0.81 + React 19
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) v6 (file-based, typed routes)
- **Backend**: [Convex](https://www.convex.dev/) (real-time database + auth)
- **Styling**: [Uniwind](https://github.com/nicksrandall/uniwind) (Tailwind for React Native) + TailwindCSS v4
- **Theming**: [React Native Papers](https://github.com/callstack/react-native-paper) Material Design for React Native (Android & iOS)
- **Forms**: Zod validation
- **Code Quality**: [Biome](https://biomejs.dev/) (linter + formatter)

## Getting Started

### Prerequisites

- Node.js 18+
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

Biome handles linting and formatting with tab indentation, double quotes, organized imports, and sorted Tailwind classes.

```bash
npm run lint
```

## Build & Deploy

```bash
# Deploy Convex Backend
npx convex deploy

# iOS production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

## Convex Auth Setup

Reference docs for initial auth configuration:

- [Convex Auth docs](https://labs.convex.dev/auth/setup/)

```bash
npm install @convex-dev/auth @auth/core@0.37.0
npx @convex-dev/auth
npx expo install expo-secure-store
```
