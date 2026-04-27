#!/usr/bin/env node
// ccwatch — one-line installer for Claude Code.
// Usage: npx @terzigolu/ccwatch          (interactive)
//        npx @terzigolu/ccwatch install  (no prompt)
//        npx @terzigolu/ccwatch uninstall
//
// Wires the plugin without needing /plugin marketplace add.
// Copies this package's contents into ~/.claude/plugins/cache/terzigolu/ccwatch/<version>/
// then patches ~/.claude/settings.json so statusLine.command points at the launcher.
import { existsSync } from "node:fs";
import { copyFile, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, "..");
const PKG_JSON = JSON.parse(await readFile(path.join(PKG_ROOT, "package.json"), "utf8"));
const VERSION = PKG_JSON.version || "1.0.0";

const HOME = os.homedir();
const PLUGINS_CACHE = path.join(HOME, ".claude", "plugins", "cache", "terzigolu", "ccwatch");
const PLUGIN_DIR = path.join(PLUGINS_CACHE, VERSION);
const SETTINGS_PATH = path.join(HOME, ".claude", "settings.json");
const CONFIG_DIR = path.join(HOME, ".claude", "plugins", "ccwatch");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");

const LAUNCHER_COMMAND =
  "sh -lc '" +
  'PLUGIN_DIR=$(find "$HOME/.claude/plugins/cache" -mindepth 3 -maxdepth 3 -type d -path "*/ccwatch/*" 2>/dev/null | sort | tail -n 1); ' +
  '[ -n "$PLUGIN_DIR" ] || exit 0; ' +
  'exec node "$PLUGIN_DIR/dist/cli.js"' +
  "'";

function log(msg) {
  process.stdout.write(`[ccwatch] ${msg}\n`);
}

async function ensurePluginCopied() {
  await mkdir(PLUGINS_CACHE, { recursive: true });
  if (existsSync(PLUGIN_DIR)) {
    await rm(PLUGIN_DIR, { recursive: true, force: true });
  }
  await cp(PKG_ROOT, PLUGIN_DIR, {
    recursive: true,
    filter: (src) => {
      const base = path.basename(src);
      if (base === "node_modules" || base === ".git" || base === ".github") return false;
      if (base === "tests" || base === "docs") return false;
      if (base.endsWith(".bak") || base.includes(".bak.")) return false;
      return true;
    },
  });
  log(`copied plugin → ${PLUGIN_DIR}`);
}

async function loadSettings() {
  try {
    return JSON.parse(await readFile(SETTINGS_PATH, "utf8"));
  } catch {
    return {};
  }
}

async function saveSettings(settings) {
  if (existsSync(SETTINGS_PATH)) {
    await copyFile(SETTINGS_PATH, `${SETTINGS_PATH}.bak.${Date.now()}`);
  }
  await mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
  await writeFile(SETTINGS_PATH, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
}

async function wireStatusline() {
  const settings = await loadSettings();
  settings.statusLine = {
    type: "command",
    command: LAUNCHER_COMMAND,
    padding: 0,
  };
  await saveSettings(settings);
  log("wired ~/.claude/settings.json statusLine");
}

async function ensureConfig() {
  if (existsSync(CONFIG_PATH)) return;
  await mkdir(CONFIG_DIR, { recursive: true });
  const defaultConfig = {
    rows: [
      ["5h", "today", "history"],
      ["7d", "session", "total"],
    ],
    compactRows: [
      ["5h", "today"],
      ["7d", "session"],
    ],
  };
  await writeFile(CONFIG_PATH, `${JSON.stringify(defaultConfig, null, 2)}\n`, "utf8");
  log(`created default config → ${CONFIG_PATH}`);
}

async function install() {
  log(`installing ccwatch v${VERSION}`);
  await ensurePluginCopied();
  await wireStatusline();
  await ensureConfig();
  log("done. open Claude Code — the statusline should appear immediately.");
  log("run /ccwatch inside Claude Code to choose which fields are visible.");
}

async function uninstall() {
  log("uninstalling ccwatch");
  if (existsSync(PLUGINS_CACHE)) {
    await rm(PLUGINS_CACHE, { recursive: true, force: true });
    log(`removed ${PLUGINS_CACHE}`);
  }
  const settings = await loadSettings();
  if (settings.statusLine?.command === LAUNCHER_COMMAND) {
    delete settings.statusLine;
    await saveSettings(settings);
    log("cleared statusLine from settings.json");
  }
  log("done.");
}

const cmd = process.argv[2] ?? "install";
if (cmd === "uninstall" || cmd === "remove") {
  await uninstall();
} else if (cmd === "install" || cmd === undefined) {
  await install();
} else if (cmd === "version" || cmd === "-v" || cmd === "--version") {
  process.stdout.write(`ccwatch v${VERSION}\n`);
} else {
  process.stdout.write(
    "usage: npx @terzigolu/ccwatch [install|uninstall|version]\n",
  );
  process.exit(1);
}
