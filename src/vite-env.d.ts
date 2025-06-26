// /// <reference types="vite/client" /> 
// The above line was removed/commented out to resolve a "Cannot find type definition file for 'vite/client'" error.
// If this project is a Vite project and Vite client types (e.g., for import.meta.hot) are needed,
// ensure Vite is correctly installed and your tsconfig.json is configured to include Vite types.

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // You can add other environment variables here as needed:
  // readonly VITE_SOME_OTHER_VARIABLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
