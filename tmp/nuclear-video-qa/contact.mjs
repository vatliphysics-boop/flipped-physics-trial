import fs from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const code = process.argv[2];
const directory = join(import.meta.dirname, code, process.argv[3] || "decoded");
const shots = (await fs.readdir(directory)).filter(name => name.startsWith("shot-")).sort();
if (shots.length < 5) throw Error(`Expected 5+ shots, received ${shots.length}`);
const tiles = await Promise.all(shots.map(async (name, index) => ({
  input: await sharp(join(directory, name)).resize(480, 270).toBuffer(),
  top: Math.floor(index / 2) * 270 + 8, left: (index % 2) * 480 + 8,
})));
await sharp({create: {width: 976, height: Math.ceil(shots.length / 2) * 270 + 16, channels: 3, background: "#091626"}})
  .composite(tiles).jpeg({quality: 88}).toFile(join(import.meta.dirname, code, "contact.jpg"));
