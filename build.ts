import { existsSync } from "fs";
import { cp, mkdir } from "fs/promises";

const isProd = process.env.NODE_ENV === "production";

async function copyPublic() {
  if (!existsSync("dist")) await mkdir("dist", { recursive: true });
  await cp("public", "dist", { recursive: true });
  // Put built JS next to popup.html (we’ll output JS to dist root)
}

const builder = await Bun.build({
  entrypoints: ["src/background.ts", "src/content.ts", "src/popup.tsx"],
  outdir: "dist",
  target: "browser", // adjust to your Chrome baseline
  minify: isProd,
  sourcemap: isProd ? "external" : "inline",
  splitting: false, // service_worker cannot be code-split
  format: "esm",
});

if (!builder.success) {
  console.error("Build failed:", builder.logs);
  process.exit(1);
}

await copyPublic();

// copy manifest.json
await cp("manifest.json", "dist/manifest.json");

console.log("Built to ./dist");
