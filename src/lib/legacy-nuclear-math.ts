// Presentation adapter for the common formulas in existing, saved worksheet records.
// Keep database values unchanged, particularly the expected answers used by the phase RPC.
const formulas = [
  [/N_t\s*=\s*N₀\s*[·×]\s*2\^\([−-]t\/T\)\s*=\s*N₀\s*[·×]\s*e\^\([−-]λt\)/g, String.raw`N(t)=N_0\,2^{-\frac{t}{T}}=N_0\,e^{-\lambda t}`],
  [/N_t\s*=\s*N₀\s*[·×]\s*2\^\([−-]t\/T\)/g, String.raw`N(t)=N_0\,2^{-\frac{t}{T}}`],
  [/H_t\s*=\s*λ\s*[·×]?\s*N_t/g, String.raw`H(t)=\lambda N(t)`],
  [/λ\s*=\s*ln\s*2\s*\/\s*T/g, String.raw`\lambda=\frac{\ln 2}{T}`],
  [/2\^\([−-]t\/T\)/g, String.raw`2^{-\frac{t}{T}}`],
  [/e\^\([−-]λt\)/g, String.raw`e^{-\lambda t}`],
  [/\b[NH](?:₀|_?t)\s*\/\s*[NH](?:₀|_?t)/g, null],
  [/[NH]₀\s*\/\s*[248](?!\d)/g, null],
] as const;

export function legacyNuclearMath(text: string) {
  // Marked-up content already belongs to the teacher or to the current catalog.
  if (/\\[([]|\$/.test(text)) return text;
  for (const [pattern, latex] of formulas) {
    text = text.replace(pattern, match => {
      const [num, den] = match.split("/").map(part => part.trim().replace("₀", "_0").replace(/_?t$/, "(t)"));
      return `\\(${latex ?? `\\frac{${num}}{${den}}`}\\)`;
    });
  }
  return text;
}
