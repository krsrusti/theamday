#!/usr/bin/env node
/**
 * ThemeOS theme package validator (zero dependencies, Node 18+).
 * Usage:  node scripts/validate-themes.js            -> validates every folder in ./themes
 *         node scripts/validate-themes.js midnight-obsidian   -> validates one theme
 * Exit code 1 if any ERROR is found. Warnings never fail the run.
 */
const fs = require('fs');
const path = require('path');

const THEMES_DIR = path.join(__dirname, '..', 'themes');
const ID_RE = /^[a-z0-9-]+$/;
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;
const PKG_RE = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z0-9_]+)+$/;
const SEMVER_RE = /^\d+\.\d+\.\d+$/;
const IMG_EXT = ['.webp', '.png'];

// ---- image size readers (PNG + WebP) -------------------------------------
function readSize(file) {
  const b = fs.readFileSync(file);
  if (b.length > 24 && b.toString('ascii', 1, 4) === 'PNG') {
    return { type: 'png', w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  }
  if (b.length > 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = b.toString('ascii', 12, 16);
    if (chunk === 'VP8X') {
      return { type: 'webp', w: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), h: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)) };
    }
    if (chunk === 'VP8L') {
      const b1 = b[21], b2 = b[22], b3 = b[23], b4 = b[24];
      return { type: 'webp', w: 1 + (((b2 & 0x3f) << 8) | b1), h: 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6)) };
    }
    if (chunk === 'VP8 ') {
      return { type: 'webp', w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    }
  }
  return null;
}

// ---- helpers -------------------------------------------------------------
function safeRel(p) {
  return typeof p === 'string' && p.length > 0 && !p.includes('..') && !p.includes('\\') && !path.isAbsolute(p) && !p.startsWith('/');
}
function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
function kb(file) { return fs.statSync(file).size / 1024; }

// ---- validation ----------------------------------------------------------
function validateTheme(dirName) {
  const dir = path.join(THEMES_DIR, dirName);
  const errors = [];
  const warns = [];
  const err = (m) => errors.push(m);
  const warn = (m) => warns.push(m);

  const jsonPath = path.join(dir, 'theme.json');
  if (!fs.existsSync(jsonPath)) { err('theme.json is missing'); return { errors, warns }; }

  let t;
  try { t = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); }
  catch (e) { err('theme.json is not valid JSON: ' + e.message); return { errors, warns }; }

  if (t.schemaVersion !== 1) err('schemaVersion must be the number 1');
  if (typeof t.id !== 'string' || !ID_RE.test(t.id)) err('id must be lowercase letters, digits and hyphens only');
  else if (t.id !== dirName) err(`id "${t.id}" must equal the folder name "${dirName}"`);
  if (typeof t.name !== 'string' || !t.name.trim()) err('name is missing');
  if (typeof t.version !== 'string' || !SEMVER_RE.test(t.version)) err('version must look like 1.0.0');
  if (!t.description) warn('description is empty (shown on the theme details screen)');

  // appearance
  const a = t.appearance;
  if (!a || typeof a !== 'object') err('appearance block is missing');
  else {
    for (const k of ['background', 'surface', 'primary', 'text']) {
      if (!HEX_RE.test(a[k] || '')) err(`appearance.${k} must be a #RRGGBB colour (got ${JSON.stringify(a[k])})`);
    }
    if (HEX_RE.test(a.text || '') && HEX_RE.test(a.background || '')) {
      const c = contrast(a.text, a.background);
      if (c < 4.5) warn(`text vs background contrast is ${c.toFixed(1)}:1 (aim for 4.5:1 or more)`);
    }
    if (HEX_RE.test(a.text || '') && HEX_RE.test(a.surface || '')) {
      const c = contrast(a.text, a.surface);
      if (c < 4.5) warn(`text vs surface contrast is ${c.toFixed(1)}:1 (aim for 4.5:1 or more)`);
    }
  }

  // layout
  const l = t.layout;
  if (!l || typeof l !== 'object') err('layout block is missing');
  else {
    if (!Number.isInteger(l.columns) || l.columns < 3 || l.columns > 6) err('layout.columns must be a whole number from 3 to 6');
    if (typeof l.dockEnabled !== 'boolean') err('layout.dockEnabled must be true or false');
  }

  // generic image check
  const checkImage = (rel, label, rules) => {
    if (!safeRel(rel)) { err(`${label}: unsafe or empty path ${JSON.stringify(rel)} (no "..", no leading "/", use forward slashes)`); return; }
    const full = path.join(dir, rel);
    if (!fs.existsSync(full)) { err(`${label}: file not found -> ${rel}`); return; }
    const ext = path.extname(rel).toLowerCase();
    if (!IMG_EXT.includes(ext)) { err(`${label}: ${rel} must be .webp or .png`); return; }
    const size = readSize(full);
    if (!size) { err(`${label}: ${rel} is not a readable ${ext} image`); return; }
    rules(size, kb(full), rel);
  };

  // wallpaper
  checkImage(t.wallpaper, 'wallpaper', (s, sizeKb, rel) => {
    if (!rel.startsWith('wallpapers/')) warn(`wallpaper ${rel} should live in wallpapers/`);
    if (s.w < 1080 || s.h < 2400) warn(`wallpaper is ${s.w}x${s.h}; use at least 1080x2400`);
    const ratio = s.h / s.w;
    if (ratio < 1.9 || ratio > 2.4) warn(`wallpaper ratio is ${ratio.toFixed(2)}; phones are about 2.0-2.2 tall (e.g. 1080x2400)`);
    if (sizeKb > 3072) err(`wallpaper is ${Math.round(sizeKb)} KB; maximum is 3072 KB`);
    else if (sizeKb > 800) warn(`wallpaper is ${Math.round(sizeKb)} KB; try to stay under 800 KB`);
  });

  // icons
  const icons = t.icons;
  const used = new Set();
  if (!icons || typeof icons !== 'object' || Array.isArray(icons)) err('icons must be an object of "package.id": "icons/file.webp"');
  else {
    const entries = Object.entries(icons);
    if (entries.length < 8) warn(`only ${entries.length} icons mapped; the plan asks for 8 (Phone, Messages, Camera, Settings, Chrome, Photos, YouTube, Maps)`);
    for (const [pkg, rel] of entries) {
      if (!PKG_RE.test(pkg)) err(`icon key "${pkg}" does not look like an Android package id (e.g. com.android.chrome)`);
      checkImage(rel, `icon ${pkg}`, (s, sizeKb, r) => {
        if (!r.startsWith('icons/')) warn(`${r} should live in icons/`);
        if (s.w !== s.h) err(`icon ${r} is ${s.w}x${s.h}; icons must be square`);
        else if (s.w < 128) err(`icon ${r} is only ${s.w}px; use 192x192`);
        else if (s.w !== 192) warn(`icon ${r} is ${s.w}px; the standard size is 192x192`);
        if (sizeKb > 100) warn(`icon ${r} is ${Math.round(sizeKb)} KB; icons should be well under 100 KB`);
      });
      used.add(String(rel).toLowerCase());
    }
  }

  // previews
  for (const [file, required] of [['previews/home.webp', true], ['previews/app-drawer.webp', false]]) {
    const full = path.join(dir, file);
    if (!fs.existsSync(full)) { (required ? err : warn)(`${file} is missing`); continue; }
    const s = readSize(full);
    if (!s) err(`${file} is not a readable image`);
    else if (kb(full) > 600) warn(`${file} is ${Math.round(kb(full))} KB; keep previews under 600 KB`);
  }

  // duplicate / ambiguous filenames (case-insensitive) + stray files
  const seen = new Map();
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) { walk(full); continue; }
      const rel = path.relative(dir, full).split(path.sep).join('/');
      const key = rel.toLowerCase();
      if (seen.has(key)) err(`duplicate/ambiguous filename: "${seen.get(key)}" and "${rel}" differ only by case`);
      else seen.set(key, rel);
      if (/\s/.test(rel)) err(`file name has spaces: "${rel}" (use hyphens)`);
      if (/[A-Z]/.test(rel) && !/^(README|LICENSE)/i.test(rel)) warn(`"${rel}" has capital letters; use lowercase-with-hyphens`);
      const known = rel === 'theme.json' || rel === 'manifest.json' || rel.startsWith('wallpapers/') || rel.startsWith('icons/') || rel.startsWith('previews/') || /^(README|LICENSE)/i.test(rel);
      if (!known) warn(`unexpected file "${rel}" (it will be ignored)`);
    }
  };
  walk(dir);
  if (!fs.existsSync(path.join(dir, 'manifest.json'))) warn('manifest.json is missing (the plan lists it; keep it in sync with theme.json)');

  // files in icons/ that nothing references
  const iconsDir = path.join(dir, 'icons');
  if (fs.existsSync(iconsDir)) {
    for (const f of fs.readdirSync(iconsDir)) {
      if (!used.has(('icons/' + f).toLowerCase())) warn(`icons/${f} is not referenced by theme.json`);
    }
  }
  return { errors, warns };
}

// ---- main ----------------------------------------------------------------
if (!fs.existsSync(THEMES_DIR)) { console.error('No themes/ folder found next to scripts/.'); process.exit(1); }
const only = process.argv[2];
const dirs = fs.readdirSync(THEMES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_') && (!only || d.name === only))
  .map((d) => d.name);
if (!dirs.length) { console.error(only ? `Theme folder not found: ${only}` : 'No theme folders found in themes/'); process.exit(1); }

let failed = false;
for (const d of dirs) {
  const { errors, warns } = validateTheme(d);
  console.log(`\n=== ${d} ===`);
  if (!errors.length && !warns.length) console.log('  OK - no problems found');
  errors.forEach((m) => console.log('  ERROR   ' + m));
  warns.forEach((m) => console.log('  warning ' + m));
  console.log(errors.length ? `  -> ${errors.length} error(s): FIX BEFORE PUSHING` : '  -> PASS');
  if (errors.length) failed = true;
}
console.log(failed ? '\nValidation FAILED.' : '\nAll themes passed.');
process.exit(failed ? 1 : 0);