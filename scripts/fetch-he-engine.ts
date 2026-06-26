#!/usr/bin/env npx ts-node

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execSync, spawnSync } from "child_process";

// ─── Types ───────────────────────────────────────────────────────────────────

interface EngineConfig {
  localBuildOverride: string;
  ref: string;
  repo: string; // e.g. "Julian52575/Hylozoa-Engine-Engine"
}

interface GithubAsset {
  name: string;
  browser_download_url: string;
}

interface GithubRelease {
  tag_name: string;
  assets: GithubAsset[];
  zipball_url: string;
  tarball_url: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ENGINE_JSON = "he-engine.json";
const LIBS_DIR = path.join("src-tauri", "binaries", "libs");
const LIB_PREFIX = "libhylozoa_engine";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(msg: string) {
  console.log(`[fetch-engine] ${msg}`);
}

function die(msg: string): never {
  console.error(`[fetch-engine] ERROR: ${msg}`);
  process.exit(1);
}

/** Detect host OS and return the expected library filename pattern. */
function getHostLibPattern(): { ext: string; prefix: string } {
  const platform = os.platform();
  if (platform === "win32") return { prefix: "hylozoa_engine", ext: ".dll" };
  if (platform === "darwin") return { prefix: "libhylozoa_engine", ext: ".dylib" };
  return { prefix: "libhylozoa_engine", ext: ".so" }; // linux / others
}

/** Find any existing libhylozoa_engine* file in LIBS_DIR. */
function findExistingLib(): string | null {
  if (!fs.existsSync(LIBS_DIR)) return null;
  const files = fs.readdirSync(LIBS_DIR);
  const found = files.find((f) => f.startsWith(LIB_PREFIX));
  return found ? path.join(LIBS_DIR, found) : null;
}

/** Run a shell command, streaming output; throws on non-zero exit. */
function run(cmd: string, cwd?: string) {
  log(`$ ${cmd}`);
  const result = spawnSync(cmd, {
    shell: true,
    stdio: "inherit",
    cwd: cwd ?? process.cwd(),
  });
  if (result.status !== 0) {
    die(`Command failed with exit code ${result.status}: ${cmd}`);
  }
}

/** Fetch JSON from a URL using curl (no extra deps). Returns null on HTTP error. */
function fetchJson<T>(url: string): T | null {
  const result = spawnSync(
    "curl",
    ["-fsSL", "--write-out", "\n%{http_code}", "-H", "Accept: application/vnd.github+json", url],
    { encoding: "utf-8" }
  );
  if (result.status !== 0) return null;

  // Last line is the HTTP status code written by --write-out.
  const lines = result.stdout.trimEnd().split("\n");
  const httpCode = parseInt(lines.pop()!, 10);
  const body = lines.join("\n");

  if (httpCode < 200 || httpCode >= 300) return null;

  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}

/** Download a URL to a local file path via curl (follows redirects). */
function downloadFile(url: string, dest: string) {
  log(`Downloading ${url} → ${dest}`);
  const result = spawnSync("curl", ["-fsSL", "-o", dest, url], { stdio: "inherit" });
  if (result.status !== 0) die(`Failed to download ${url}`);
}

// ─── Ref-type detection ───────────────────────────────────────────────────────

/** A full or abbreviated commit SHA: 7–40 hex characters. */
const COMMIT_RE = /^[0-9a-f]{7,40}$/i;

type RefKind = "tag" | "branch" | "commit";

/**
 * Heuristically determine whether `ref` is a tag, branch, or commit SHA.
 *
 * Strategy:
 *  1. If it matches the commit-SHA pattern → "commit" (build only).
 *  2. Ask the GitHub Releases API if a release exists for this ref → "tag".
 *  3. Otherwise treat as a branch → "branch" (build only).
 */
function detectRefKind(repo: string, ref: string): { kind: RefKind; release: GithubRelease | null } {
  if (COMMIT_RE.test(ref)) {
    log(`Ref "${ref}" looks like a commit SHA → will build from source.`);
    return { kind: "commit", release: null };
  }

  log(`Checking GitHub Releases API for tag "${ref}"…`);
  const release = fetchJson<GithubRelease>(
    `https://api.github.com/repos/${repo}/releases/tags/${ref}`
  );

  if (release && release.tag_name) {
    log(`Found release ${release.tag_name} with ${release.assets.length} asset(s).`);
    return { kind: "tag", release };
  }

  log(`No release found for ref "${ref}" → treating as branch, will build from source.`);
  return { kind: "branch", release: null };
}

// ─── Core logic ───────────────────────────────────────────────────────────────

function readEngineConfig(): EngineConfig {
  if (!fs.existsSync(ENGINE_JSON)) die(`${ENGINE_JSON} not found in ${process.cwd()}`);
  const raw = fs.readFileSync(ENGINE_JSON, "utf-8");
  return JSON.parse(raw) as EngineConfig;
}

/**
 * Try to find and download a prebuilt library from the release assets.
 * Returns true if one was successfully downloaded.
 */
function tryDownloadPrebuiltLib(release: GithubRelease): boolean {
  const { ext } = getHostLibPattern();
  const platform = os.platform();

  const candidates = release.assets.filter(
    (a) => a.name.includes("hylozoa_engine") && a.name.endsWith(ext)
  );

  log(`Found ${candidates.length} matching library asset(s) in release.`);
  if (candidates.length === 0) return false;

  // Prefer an asset whose name contains the current OS hint.
  const osSuffix: Record<string, string> = {
    linux: "linux",
    darwin: "macos",
    win32: "windows",
  };
  const hint = osSuffix[platform] ?? platform;

  const asset =
    candidates.find((a) => a.name.toLowerCase().includes(hint)) ?? candidates[0];

  log(`Selected asset: ${asset.name}`);
  fs.mkdirSync(LIBS_DIR, { recursive: true });
  downloadFile(asset.browser_download_url, path.join(LIBS_DIR, asset.name));
  return true;
}

/**
 * Download source for any ref (tag, branch, or commit) via the GitHub
 * Archive API and build with CMake.
 *
 * URL form: https://api.github.com/repos/<owner>/<repo>/tarball/<ref>
 * This works for tags, branch names, and full/abbreviated commit SHAs.
 */
function buildFromSource(repo: string, ref: string) {
  const archiveUrl = `https://api.github.com/repos/${repo}/tarball/${ref}`;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "hylozoa-src-"));
  log(`Building from source (ref: ${ref}) in ${tmpDir}`);

  const tarball = path.join(tmpDir, "source.tar.gz");
  downloadFile(archiveUrl, tarball);

  run(`tar -xzf source.tar.gz`, tmpDir);

  // The extracted folder name is generated by GitHub (e.g. "owner-repo-<sha>").
  const entries = fs
    .readdirSync(tmpDir)
    .filter((e) => fs.statSync(path.join(tmpDir, e)).isDirectory());

  if (entries.length === 0) die("No directory found after extracting source tarball.");
  const srcDir = path.join(tmpDir, entries[0]);
  log(`Source directory: ${srcDir}`);

  const buildDir = path.join(tmpDir, "build");
  fs.mkdirSync(buildDir);

  const absLibsDir = path.resolve(LIBS_DIR);
  fs.mkdirSync(absLibsDir, { recursive: true });

  run(
    `cmake "${srcDir}" -B "${buildDir}" -DCMAKE_BUILD_TYPE=Release` +
      ` -DCMAKE_LIBRARY_OUTPUT_DIRECTORY="${absLibsDir}"`,
    tmpDir
  );
  run(`cmake --build "${buildDir}" --config Release`, tmpDir);

  log(`Build complete. Verifying output in ${absLibsDir}…`);
  const lib = findExistingLib();
  if (!lib) {
    die(
      `CMake build finished but no ${LIB_PREFIX}* was found in ${LIBS_DIR}. ` +
        `Check CMakeLists.txt for the correct output target name.`
    );
  }
  log(`Library produced: ${lib}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const config = readEngineConfig();
  log(`Engine config: repo=${config.repo}  ref=${config.ref}`);

  // ── localBuildOverride: skip everything and copy a local lib ──
  if (config.localBuildOverride && config.localBuildOverride.trim() !== "") {
    const overridePath = config.localBuildOverride.trim();
    log(`localBuildOverride is set → using ${overridePath}`);
    if (!fs.existsSync(overridePath)) die(`localBuildOverride path not found: ${overridePath}`);

    fs.mkdirSync(LIBS_DIR, { recursive: true });
    const dest = path.join(LIBS_DIR, path.basename(overridePath));
    fs.copyFileSync(overridePath, dest);
    log(`Copied override lib to ${dest}`);
    return;
  }

  // ── Already installed? ──
  const existing = findExistingLib();
  if (existing) {
    log(`Library already present: ${existing} — nothing to do.`);
    return;
  }

  const ref = config.ref;

  // ── Detect what kind of ref we have ──
  const { kind, release } = detectRefKind(config.repo, ref);

  if (kind === "tag" && release) {
    // ── Tagged release: try prebuilt assets first ──
    const hasPrebuilt = tryDownloadPrebuiltLib(release);
    if (hasPrebuilt) {
      log(`Prebuilt library installed: ${findExistingLib()}`);
      return;
    }
    // No prebuilt assets in the release → fall through to CMake build using
    // the release tarball (same ref, the Archive API handles tags too).
    log(`No prebuilt assets found in release. Falling back to CMake build…`);
  }

  // ── branch / commit / tag-without-prebuilt: build from source ──
  buildFromSource(config.repo, ref);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});