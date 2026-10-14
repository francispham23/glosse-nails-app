# Export a functional web preview

Quality exports use `https://example.convex.cloud` as synthetic configuration.
They prove bundling only and cannot sign in. Do not deploy those directories.

Select the intended backend explicitly, then create a fresh export:

```sh
npm run export:web -- --convex-url=https://YOUR-DEPLOYMENT.convex.cloud
```

Use the actual Convex deployment URL, not the literal placeholder above.
The script rejects verification placeholders and missing URLs, disables dotenv
loading and embeds only the selected public backend URL in the web bundle. It
writes to `dist` by default; `--output-dir=/path/to/output` selects another directory.
This guard checks URL shape, not account access or backend health.

The current local development backend is `rapid-guineapig-653`; the production
build profile references `silent-firefly-314`. Choose deliberately: a test website
pointed at production still uses production accounts and data. Deployment is a
separate authorized step; changing a hosted environment variable does not change
an already exported bundle.

For the existing development backend:

```sh
npm run export:web -- --convex-url=https://rapid-guineapig-653.convex.cloud
```

After deploying the fresh output, verify its backend destination and sign-in
with an authorized account. Do not copy credentials into task records or logs.

See [Expo environment variables](https://docs.expo.dev/guides/environment-variables/)
for how public variables are embedded during export.
