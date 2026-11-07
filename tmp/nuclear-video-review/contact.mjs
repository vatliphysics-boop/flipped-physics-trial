import fs from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

for (const code of process.argv.slice(2)) {
  const directory = join(import.meta.dirname, code, "decoded");
  const shots = (await fs.readdir(directory)).filter(name => name.startsWith("shot-")).sort();
  if (shots.length < 5) throw Error(`Expected 5+ shots, received ${shots.length}`);
  const selected = ["start.jpg", "middle.jpg", "end.jpg", ...shots];
  const width = 424, height = 238, gutter = 9, labelHeight = 24, columns = 3;
  const tiles = [];
  for (const [index, name] of selected.entries()) {
    const top = Math.floor(index / columns) * (height + gutter + labelHeight) + gutter;
    const left = (index % columns) * (width + gutter) + gutter;
    tiles.push({ input: await sharp(join(directory, name)).resize(width, height).toBuffer(), top, left });
    tiles.push({ input: Buffer.from(`<svg width="${width}" height="${labelHeight}"><text x="5" y="17" fill="#acd9dd" font-family="sans-serif" font-size="13">${code.toUpperCase()} / ${name.replace(".jpg", "")}</text></svg>`), top: top + height, left });
  }
  await sharp({create: {
    width: columns * (width + gutter) + gutter,
    height: Math.ceil(selected.length / columns) * (height + gutter + labelHeight) + gutter,
    channels: 3, background: "#091626",
  }}).composite(tiles).jpeg({quality: 90}).toFile(join(import.meta.dirname, code, "contact.jpg"));
}
