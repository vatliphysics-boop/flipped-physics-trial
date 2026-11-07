import { chmodSync, constants, copyFileSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { DEFAULT_BOOK_BANK_DIR, indexedBookAssetFiles, TRACED_BOOK_BANK_DIR, type BookBankIndex } from "./src/lib/book-bank";

function stageBookBank(): NextConfig["outputFileTracingIncludes"] {
  let index: BookBankIndex;
  try {
    index = JSON.parse(readFileSync(join(DEFAULT_BOOK_BANK_DIR, "index.json"), "utf8"));
  } catch (error) {
    // Deployments without the optional dataset can provide BOOK_BANK_DIR at runtime.
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }

  const images = [...indexedBookAssetFiles(index)];
  const staging = mkdtempSync(join(DEFAULT_BOOK_BANK_DIR, ".next-runtime-"));
  try {
    // Turbopack matches include patterns by substring, so use a directory
    // containing only runtime files. Raw scans and OCR sidecars stay in the source tree.
    for (const file of ["index.json", "unified.json", ...images]) {
      const target = join(staging, file);
      mkdirSync(dirname(target), { recursive: true });
      copyFileSync(join(DEFAULT_BOOK_BANK_DIR, file), target, constants.COPYFILE_FICLONE);
    }
    chmodSync(staging, 0o755);
    rmSync(TRACED_BOOK_BANK_DIR, { recursive: true, force: true });
    renameSync(staging, TRACED_BOOK_BANK_DIR);
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }

  const indexFile = `./${TRACED_BOOK_BANK_DIR}/index.json`;
  return {
    "/api/question-bank": [`./${TRACED_BOOK_BANK_DIR}/unified.json`],
    "/api/book-bank": [indexFile],
    "/api/book-bank/asset": [indexFile, ...images.map(file => `./${TRACED_BOOK_BANK_DIR}/${file}`)],
  };
}

export default function nextConfig(phase: string): NextConfig {
  return {
    // Keep UI acceptance builds separate from the user's running dev/production builds.
    distDir: process.env.UI_REVIEW_BUILD === "1" ? ".next-ui" : ".next",
    devIndicators: false,
    serverExternalPackages: ["pdf-parse"],
    outputFileTracingIncludes: phase === PHASE_PRODUCTION_BUILD ? stageBookBank() : {},
    outputFileTracingExcludes: { "/*": ["./output/book-bank/**/*"] },
  };
}
