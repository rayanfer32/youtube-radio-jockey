import { existsSync, watch } from "fs";
import { cp, mkdir } from "fs/promises";

const isProd = process.env.NODE_ENV === "production";

async function doBuild() {
  console.log("Building...");
  try {
    if (!existsSync("dist")) await mkdir("dist", { recursive: true });

    const builder = await Bun.build({
      entrypoints: ["src/background.ts", "src/content.ts", "src/popup.tsx"],
      outdir: "dist",
      target: "browser",
      minify: isProd,
      sourcemap: isProd ? "external" : "inline",
      splitting: false,
      format: "esm",
    });

    if (!builder.success) {
      console.error("Build failed:");
      for (const log of builder.logs) {
        console.error(log);
      }
      return false;
    }

    if (existsSync("public")) {
      await cp("public", "dist", { recursive: true });
    }
    await cp("manifest.json", "dist/manifest.json");

    console.log(`Built to ./dist at ${new Date().toLocaleTimeString()}`);
    return true;
  } catch (err) {
    console.error("Build error:", err);
    return false;
  }
}

// Initial build
const success = await doBuild();
if (isProd && !success) {
  process.exit(1);
}

// Watch mode if not production
if (!isProd) {
  console.log("Watching for changes in src/, public/, and manifest.json...");
  
  // Note: recursive watch is supported on Windows
  watch(".", { recursive: true }, async (event, filename) => {
    if (!filename) return;
    
    // Only rebuild for relevant files, ignoring dist/ and other noise
    if (
      filename.startsWith("src\\") || 
      filename.startsWith("src/") ||
      filename.startsWith("public\\") || 
      filename.startsWith("public/") ||
      filename === "manifest.json"
    ) {
      console.log(`\nChange detected in ${filename}`);
      await doBuild();
    }
  });
}

