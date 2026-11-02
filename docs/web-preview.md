# Export a functional web preview

Quality exports use `https://example.convex.cloud` as synthetic configuration.
They prove bundling only and cannot sign in. Do not deploy those directories.

Select the intended backend explicitly, then create a fresh export:

```sh
npm run export:web -- --convex-url=https://YOUR-DEPLOYMENT.convex.cloud
```

Use the actual Convex deployment URL, not the literal placeholder above.
The script rejects verification placeholders and missing URLs, disables dotenv
loading and explicitly sets `EXPO_PUBLIC_CONVEX_URL` for the web bundle. Other
environment variables already present in the shell are inherited. It
writes to `dist` by default; `--output-dir=/path/to/output` selects another directory.
This guard checks URL shape, not account access or backend health.

The README development example references `rapid-guineapig-653`; the production
build profile references `silent-firefly-314`. Local env files can change and are
not proof of the intended destination. Verify the backend you select: a test
website pointed at production still uses production accounts and data.

For the README's development example, after confirming that target is intended:

```sh
npm run export:web -- --convex-url=https://rapid-guineapig-653.convex.cloud
```

## Production export with EAS variables

Configure the required public variables in the EAS production environment,
including `EXPO_PUBLIC_CONVEX_URL` and any other `EXPO_PUBLIC_*` values used by
the app. Confirm privately that they select the intended production backend.

```sh
EXPO_NO_DOTENV=1 eas env:exec production \
  'npx expo export --platform web --clear'
```

This selects EAS variables before export and disables local dotenv fallback.
Missing required variables must be configured before release. The explicit-URL
helper above is an alternative when you deliberately supply the backend URL;
it does not retrieve the EAS production environment.

Client-side public values are embedded during export. `eas deploy --environment`
supplies server-side variables for API routes, while `--prod` assigns the deployment
to the production URL. Native `eas.json` build-profile variables do not select
variables for a standalone web export. Changing hosted variables requires a
fresh export and deployment to update the browser bundle.

## Verify the destination before release

Inspect the public backend URLs in the fresh JavaScript output:

```sh
rg -o --no-filename 'https://[a-z0-9-]+\.convex\.(cloud|site)' dist --glob '*.js' | sort -u
```

Confirm the intended URL is present and unintended backend URLs are absent.
If the result is missing or unexpected, investigate before deploying. This
inspection checks the local artifact, not backend health or hosted runtime.

When deployment is authorized, publish that inspected `dist` directory once:

```sh
eas deploy --environment production --prod
```

After release, open the production URL and inspect browser network requests
to confirm they target the intended Convex backend. Verify sign-in with an
authorized account. Local export checks do not establish hosted behavior.
Do not copy credentials into task records or logs.

See [Expo environment variables](https://docs.expo.dev/guides/environment-variables/)
for how public variables are embedded during export.
See [EAS environment variable usage](https://docs.expo.dev/eas/environment-variables/usage/)
for export-time client variables and deploy-time server variables.
