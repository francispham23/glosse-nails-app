// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // Convex integration tests (`*.convex.test.ts`) use `convex/test`, a module
    // injected by the Convex CLI at `convex test` time (not resolvable here).
    // They are linted/run by the Convex CLI, not eslint/vitest, so exclude them.
    ignores: ["dist/*", "convex/**/*.convex.test.ts"],
  },
  {
    // The repo was committed without `eslint .` as a hard gate. eslint-config-expo
    // (eslint-plugin-react-hooks v5) enables React-Compiler-era rules that flag the
    // app's standard Convex `useQuery`/`useMutation` usage as "impure during render"
    // and warn on anonymous component display names. These are false positives for
    // this codebase (no React Compiler in use). Relaxed to match the established
    // baseline so the lint gate stays meaningful for genuine issues in new code.
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react/display-name": "off",
    },
  },
]);
