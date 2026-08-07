// Ambient module declarations for non-code imports.
// The app side-effect imports `global.css` (see app/_layout.tsx); TypeScript
// needs this declaration or `tsc --noEmit` fails with TS2882.
declare module "*.css";
