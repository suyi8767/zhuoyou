import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const workspaceArg = process.argv[2] || "apps/mini";
const workspaceRoot = path.resolve(repoRoot, workspaceArg);

function findExistingPath(candidates) {
  return candidates.find((candidate) => fs.existsSync(candidate));
}

const sourceDir = findExistingPath([
  path.join(workspaceRoot, "node_modules", "@dcloudio", "uni-h5-vite", "lib", "ssr"),
  path.join(repoRoot, "node_modules", "@dcloudio", "uni-h5-vite", "lib", "ssr"),
]);

const pluginRoot = findExistingPath([
  path.join(workspaceRoot, "node_modules", "@dcloudio", "vite-plugin-uni"),
  path.join(repoRoot, "node_modules", "@dcloudio", "vite-plugin-uni"),
]);

if (!pluginRoot) {
  console.warn("[prepare-mini-toolchain] vite-plugin-uni not found, skip.");
  process.exit(0);
}

const targetDir = path.join(pluginRoot, "lib", "ssr");

if (!sourceDir) {
  console.warn("[prepare-mini-toolchain] uni-h5-vite SSR templates not found, skip.");
  process.exit(0);
}

fs.mkdirSync(targetDir, { recursive: true });

for (const fileName of ["entry-server.js", "define.js"]) {
  const sourceFile = path.join(sourceDir, fileName);
  const targetFile = path.join(targetDir, fileName);
  if (fs.existsSync(sourceFile) && !fs.existsSync(targetFile)) {
    fs.copyFileSync(sourceFile, targetFile);
  }
}

console.log("[prepare-mini-toolchain] SSR templates ready.");
