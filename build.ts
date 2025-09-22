import { statSync, readFileSync, globSync, mkdirSync } from "node:fs";
import { join, dirname, basename, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import yaml from "js-yaml";

const pluginDir = process.argv[2];
if (!pluginDir) {
  console.error("Usage: tsx build.ts <plugin-directory> [output-directory]");
  process.exit(1);
}

const outputDir = process.argv[3] || ".";
mkdirSync(outputDir, { recursive: true });

const configPath = globSync(join(pluginDir, "plugins", "*", "config.yaml"))[0];

if (!statSync(pluginDir).isDirectory()) {
  console.error(`Not a directory: ${pluginDir}`);
  process.exit(1);
}

const config = yaml.load(readFileSync(configPath, "utf8")) as {
  name?: string;
  version?: string;
} | null;

const name = config?.name;
const version = config?.version;

if (!name || !version) {
  console.error("YAML must contain 'name' and 'version'.");
  process.exit(1);
}

const outputPath = join(outputDir, `${name}-${version}.zip`);

const result = spawnSync(
  "zip",
  ["-r", resolve(outputPath), basename(pluginDir)],
  {
    stdio: "inherit",
    cwd: resolve(dirname(pluginDir)),
  }
);

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
