# Srusti — Theme Design Handbook (Person 1)

Hi Srusti! This file is everything you need to do your part of **ThemeOS**, an Android launcher whose look can be swapped with "theme packages". Mirza builds the app. **You design the themes** (wallpaper, app icons, colours, previews) and hand them over as folders of files. You do **not** need to build or run the app, and you don't need Android Studio.

**Deadline:** the whole project is due **Saturday 7 November 2026**. Theme assets are frozen on **Friday 6 November**.

---

## 1. Your deliverables (checklist)

- [ ] **Theme 1: Midnight Obsidian** → `themes/midnight-obsidian/` (dark, restrained gold accent, AMOLED-friendly)
- [ ] **Theme 2: Lavender Dreams *or* Minimal Beige** (pick one) → `themes/<your-theme-id>/`
- [ ] For each theme: 1 wallpaper, 8 app icons, 2 preview images, `theme.json`, `manifest.json`
- [ ] `docs/THEME_SCHEMA.md`: a tidy copy of sections 4 and 5 of this file
- [ ] `docs/ASSET_MAPPING.md`: a table listing each app, its package ID, and its icon file
- [ ] Delete the throw-away test theme once your second theme is ready: `git rm -r themes/sample-light`

> **Quality over quantity:** two finished, polished themes beat three half-done ones.

**You own:** `themes/`, `docs/THEME_SCHEMA.md`, `docs/ASSET_MAPPING.md`.
**Please don't edit:** `android/`, `src/`, `App.tsx`, `package.json` or anything else. If you need something the format can't do (for example a new field), message Mirza first. Both sides must agree before the format changes.

---

## 2. One-time setup

### Install
| Tool | Why | Check it worked |
|---|---|---|
| **Git** (git-scm.com) | download/upload your work | `git --version` |
| **Node.js LTS** (nodejs.org, version 18 or newer) | runs the checker that validates your theme | `node -v` |
| A **GitHub account** | Mirza must add you as a collaborator on the repository first | log in at github.com |
| Your design tool (Figma, Photoshop, Illustrator, Canva, …) + **Squoosh** (squoosh.app) | design, then export/compress as WebP | |

You do **not** need `npm install`, Android Studio, Java or a phone.

### Download only the parts you need
Replace `<REPO_URL>` with the link Mirza gives you (looks like `https://github.com/<user>/<repo>.git`).

```bash
git config --global user.name "Srusti"
git config --global user.email "your-github-email@example.com"

git clone --filter=blob:none --sparse <REPO_URL> ThemeOS
cd ThemeOS
git sparse-checkout set themes scripts docs
git checkout -b person-1/theme-assets
```

This downloads just `themes/`, `scripts/` and `docs/` (plus this file) and puts you on your own branch, `person-1/theme-assets`. If `sparse-checkout` gives an error (old Git), do a normal `git clone <REPO_URL>` instead and ignore the extra folders.

When the push or clone asks you to log in, sign in with your GitHub account in the window that opens.

---

## 3. What you're designing (how it looks on the phone)

- **Home screen:** your **wallpaper**, plus a **dock** of 4 icons at the bottom and an **"All apps"** pill just above it. The dock and pill use your `surface` colour with some transparency.
- **App drawer:** a full-screen grid of every app. It sits on a tint of your `background` colour (about 90% opaque), with app names in your `text` colour.
- **Icons:** shown at about 48 dp (small!) without any masking, so **you draw the final shape yourself** (e.g. a rounded square) inside the square canvas. Apps you don't make an icon for keep their normal Android icon, so you only need the 8 core apps.

The test phone is a **Redmi Note 9 Pro, 1080 × 2400 pixels**.

---

## 4. Folder layout

```text
themes/
  midnight-obsidian/            <- folder name = theme id (lowercase-with-hyphens)
    theme.json                  <- the settings (see below)
    manifest.json               <- short info card (see below)
    wallpapers/
      home.webp
    icons/
      phone.webp
      messages.webp
      camera.webp
      settings.webp
      chrome.webp
      photos.webp
      youtube.webp
      maps.webp
    previews/
      home.webp
      app-drawer.webp
```

**Naming rules:** all lowercase, hyphens instead of spaces, no capital letters, no two files that differ only by case. The folder name **must be identical** to the `id` inside `theme.json`.

### `theme.json` (copy this and edit)

```json
{
  "schemaVersion": 1,
  "id": "midnight-obsidian",
  "name": "Midnight Obsidian",
  "version": "1.0.0",
  "description": "Deep black with a restrained gold accent.",
  "appearance": {
    "background": "#080808",
    "surface": "#151515",
    "primary": "#D6B878",
    "text": "#FFFFFF"
  },
  "wallpaper": "wallpapers/home.webp",
  "icons": {
    "com.android.chrome": "icons/chrome.webp",
    "com.google.android.youtube": "icons/youtube.webp"
  },
  "layout": {
    "columns": 5,
    "dockEnabled": true
  }
}
```

| Field | Rules |
|---|---|
| `schemaVersion` | always the number `1` |
| `id` | lowercase letters, digits, hyphens; same as the folder name |
| `name`, `description` | shown in the app's theme list and details screen |
| `version` | three numbers, like `1.0.0` |
| `appearance.background` | drawer tint colour, `#RRGGBB` |
| `appearance.surface` | dock and "All apps" pill colour, `#RRGGBB` |
| `appearance.primary` | your accent colour, `#RRGGBB` (pick one; the launcher will use it for highlights) |
| `appearance.text` | app-name colour, `#RRGGBB`. **Must be easy to read on both `background` and `surface`** (contrast 4.5:1 or better; the checker warns you) |
| `wallpaper` | path inside the theme folder, forward slashes, no `..` |
| `icons` | `"android.package.id": "icons/file.webp"`: one line per app (section 6) |
| `layout.columns` | whole number **3 to 6** (apps per row in the drawer) |
| `layout.dockEnabled` | `true` or `false` |

### `manifest.json` (simple info card)

```json
{
  "schemaVersion": 1,
  "id": "midnight-obsidian",
  "name": "Midnight Obsidian",
  "version": "1.0.0",
  "author": "Srusti",
  "license": "Original work by Srusti, free to use inside the ThemeOS project"
}
```

> Don't add fonts yet; the launcher can't load them in this version.

---

## 5. Asset specifications

| Asset | File | Size | Format | Notes |
|---|---|---|---|---|
| Wallpaper | `wallpapers/home.webp` | **1080 × 2400 px** (or larger, same tall shape) | WebP | Aim for under 800 KB (hard limit 3 MB). Keep the **bottom quarter calm**, because the dock and "All apps" pill sit on top of it. |
| App icon (×8) | `icons/<app>.webp` | **192 × 192 px, square** | WebP (lossless, transparent background allowed) or PNG | Same padding (about 8–10%), same style, same shape across **all** icons. Aim for 20–40 KB each. |
| Preview, home | `previews/home.webp` | about 720 × 1600 px | WebP | Shown in the app's theme list. Under 600 KB. |
| Preview, drawer | `previews/app-drawer.webp` | about 720 × 1600 px | WebP | Same. |

**Exporting WebP:** in Figma use *Export → WebP*. For anything else, open Squoosh (squoosh.app), drop the image in, choose **WebP**, and save. Use *lossless* for icons.

**Previews:** start with mock-ups. After Mirza tests your theme on the real phone he can send you **real screenshots**, which you can use to replace them.

### Copyright
Everything must be **your own work or something you have the right to redistribute**. Don't copy the real Chrome, YouTube, Maps etc. logos (they're trademarks). Draw original icons that suggest the same app (a compass for Maps, a play shape for YouTube). Keep a note of any stock images or other sources and their licences in `docs/ASSET_MAPPING.md`. This gets checked on Friday.

---

## 6. Matching icons to apps (package IDs)

An icon is attached to an app through its **Android package ID**. The 8 core apps are **Phone, Messages, Camera, Settings, Chrome, Photos, YouTube, Maps**.

Mirza will give you `docs/device-packages.txt`, a list of every app package on the test phone. Lines look like `package:com.android.chrome`. Use the part after `package:`. The IDs that are probably right (always confirm in the file):

| App | Likely package ID |
|---|---|
| Chrome | `com.android.chrome` |
| YouTube | `com.google.android.youtube` |
| Maps | `com.google.android.apps.maps` |
| Photos | `com.google.android.apps.photos` |
| Settings | `com.android.settings` |
| Camera | `com.android.camera` (Xiaomi phones) |
| Phone | differs by phone, e.g. `com.google.android.dialer`, **check the file** |
| Messages | differs by phone, e.g. `com.google.android.apps.messaging` or `com.android.mms`, **check the file** |

Put each in `theme.json` under `"icons"`, and list them in `docs/ASSET_MAPPING.md`:

```markdown
| App | Package ID | Midnight Obsidian | Lavender Dreams |
|---|---|---|---|
| Chrome | com.android.chrome | icons/chrome.webp | icons/chrome.webp |
```

---

## 7. Check your work before every push

From the `ThemeOS` folder:

```bash
node scripts/validate-themes.js                      # checks every theme
node scripts/validate-themes.js midnight-obsidian    # checks one theme
```

- **`ERROR`** lines must be fixed before pushing. The app would reject the theme.
- **`warning`** lines are advice (file too big, low contrast, missing preview). Fix as many as you can.
- You're ready to push when it says **`All themes passed.`**

The checker tests: valid JSON, all fields present, colours in `#RRGGBB`, columns 3–6, every referenced file exists, safe paths, WebP/PNG format, square icons, wallpaper size and shape, previews present, no duplicate or ambiguous file names, and text contrast.

---

## 8. Daily workflow (Git commands)

You work only on your branch, so you can't break Mirza's app.

```bash
cd ThemeOS
git status                                   # see what changed
git add themes docs                          # stage your files
git commit -m "Midnight Obsidian: wallpaper and 8 icons"
git push -u origin person-1/theme-assets     # first push (afterwards just: git push)
```

- **Push at least twice a day**, even if unfinished. Small, frequent pushes are safer than one big one.
- Write short, clear commit messages, e.g. `Lavender Dreams: add icons`.
- To get Mirza's latest changes: `git fetch origin` then `git merge origin/main`.
- If a push is rejected, run `git pull --rebase origin person-1/theme-assets`, then push again.
- Made a mess? Tell Mirza before you try to fix Git. Nothing is lost.

**What happens next:** Mirza pulls your branch, copies your themes into the app, runs it on the phone, and sends you screenshots and notes. You fix, push again, and repeat.

---

## 9. Timeline

| When | Goal |
|---|---|
| **Wed 4 Nov** | Midnight Obsidian complete and pushed (even if the second theme isn't started yet). Start the second theme. Send Mirza your questions about package IDs. |
| **Thu 5 Nov** | Both themes pushed by midday so Mirza can test on the phone. Fix whatever looks off. Optimise image sizes. |
| **Fri 6 Nov** | **Freeze.** Final visual check, copyright check, `docs/` finished, last push. No new ideas after this. |
| **Sat 7 Nov** | Final check with Mirza. Done! |

---

## 10. Troubleshooting

| Problem | Fix |
|---|---|
| `node` is not recognised | Install Node.js LTS, then close and reopen the terminal |
| `git push` says permission denied / 403 | Mirza hasn't added your GitHub account as a collaborator yet, or you logged in with the wrong account |
| Validator: `id "x" must equal the folder name` | Rename the folder or the `id` so they match exactly |
| Validator: `file not found` | The path in `theme.json` doesn't match the real file. Check spelling and lowercase |
| Validator: `not a readable .webp image` | Re-export the file as a real WebP (renaming a PNG to `.webp` doesn't work) |
| Not sure what to do | Ask Mirza, and don't spend half a day guessing |
