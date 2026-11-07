import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
const directory = new URL("../public/illustrations/", import.meta.url);
for (const code of ["B21", "B22", "B23", "B24", "B25"]) {
  const svg = await readFile(new URL(`${code}-diagram.svg`, directory));
  await sharp(svg, { density: 144 }).resize({ width: 2400 }).png().toFile(fileURLToPath(new URL(`${code}-diagram.png`, directory)));
}
console.log("Rendered 5 PNGs at 2400 × 1400 for projection and reuse.");
