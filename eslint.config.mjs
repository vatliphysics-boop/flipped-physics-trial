import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
export default defineConfig([...nextVitals, ...nextTs, globalIgnores([".next/**",".next-ui/**","out/**","build/**","next-env.d.ts","tmp/**",".local-ai/**","scripts/**","00_NCKH_BAT_DAU/**"])]);
