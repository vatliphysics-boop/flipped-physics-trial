// Resolver hook cho `node --test` với TypeScript gốc của Node (>= 22.18 / 24).
//
// Node tự bóc kiểu khi chạy .ts, nhưng bộ phân giải ESM của nó KHÔNG hiểu hai thứ
// mà dự án dùng khắp nơi:
//   1. Alias "@/*" -> "src/*" (tsconfig paths, Next.js tự lo, Node thì không).
//   2. Import không có phần mở rộng ("../src/lib/physics" thay vì "...physics.ts").
//
// Hook này chỉ chèn vào bước phân giải của Node, không sửa bất kỳ file nguồn nào.
import { registerHooks } from "node:module";
import { existsSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");

const EXTENSIONS = [".ts", ".tsx", ".mts", ".js", ".jsx", ".mjs", ".json"];
const INDEXES = ["index.ts", "index.tsx", "index.mts", "index.js", "index.mjs"];

function isFile(p) {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}

/** Trả về đường dẫn file thật cho một đường dẫn không có đuôi, hoặc null. */
function withExtension(p) {
  if (isFile(p)) return p;
  for (const ext of EXTENSIONS) {
    if (isFile(p + ext)) return p + ext;
  }
  for (const index of INDEXES) {
    const candidate = path.join(p, index);
    if (isFile(candidate)) return candidate;
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    // 1. Alias "@/*" -> "<repo>/src/*"
    if (specifier.startsWith("@/")) {
      const resolved = path.join(SRC, specifier.slice(2));
      const file = withExtension(resolved);
      if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
    }

    // 2. Import tương đối / tuyệt đối thiếu phần mở rộng
    const isPathLike = specifier.startsWith("./") || specifier.startsWith("../") || specifier.startsWith("/");
    if (isPathLike) {
      const base = specifier.startsWith("/")
        ? specifier
        : path.resolve(path.dirname(fileURLToPath(context.parentURL ?? pathToFileURL(ROOT + "/").href)), specifier);
      if (!existsSync(base) || !isFile(base)) {
        const file = withExtension(base);
        if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
      }
    }

    // 3. Import tuyệt đối tính từ gốc repo ("src/lib/physics", "tests/…")
    if (!specifier.startsWith("node:") && !specifier.startsWith("file:") && !isPathLike) {
      const candidate = path.join(ROOT, specifier);
      const file = withExtension(candidate);
      if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
    }

    return nextResolve(specifier, context);
  },

  // 4. Dự án import JSON trần (`import x from "./a.json"`) — Next.js chấp nhận,
  //    Node ESM thì đòi `with { type: "json" }`. Ta đọc file và trả về module JS
  //    tương đương để không phải sửa hàng chục file nguồn.
  load(url, context, nextLoad) {
    if (url.startsWith("file:") && url.endsWith(".json")) {
      const parsed = JSON.parse(readFileSync(fileURLToPath(url), "utf8"));
      return {
        format: "module",
        source: `export default ${JSON.stringify(parsed)};`,
        shortCircuit: true,
      };
    }
    return nextLoad(url, context);
  },
});
