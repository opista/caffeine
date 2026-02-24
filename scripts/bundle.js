import { zip } from "zip-a-folder";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkgPath = path.join(__dirname, "../package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

const platform = process.env.TARGET || "chrome";
const version = pkg.version;

const outDir = path.join(__dirname, "../dist");
const zipDir = path.join(__dirname, "../artifacts");
const zipFile = path.join(zipDir, `${pkg.name}-${platform}-${version}.zip`);

async function bundle() {
  try {
    if (!fs.existsSync(outDir)) {
      console.error(`Error: ${outDir} does not exist. Run build first.`);
      process.exit(1);
    }

    if (!fs.existsSync(zipDir)) {
      fs.mkdirSync(zipDir);
    }

    console.log(`Zipping ${outDir} to ${zipFile}...`);
    await zip(outDir, zipFile);
    console.log(`Successfully bundled ${platform} extension!`);
  } catch (err) {
    console.error(`Failed to bundle ${platform} extension:`, err);
    process.exit(1);
  }
}

bundle();
