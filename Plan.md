# ThemeOS --- Two-Engineer Build Plan

**Deadline:** Saturday, 7 November 2026\
**Team:** 2 engineers\
**Target:** A demonstrable Android MVP built with React Native + Kotlin\
**Working assumption:** `07/11/26` means **7 November 2026** (DD/MM/YY).

> **Delivery reality:** With five working days, the team should target a
> functional MVP/prototype---not a production-ready launcher for every
> Android manufacturer. Keep the scope narrow, integrate daily, and
> defer cloud services, iOS, third-party widget hosting, lock-screen
> replacement, notification shade/Quick Settings customization,
> accounts, and payments.

------------------------------------------------------------------------

## 1. MVP outcome by 7 November

A user must be able to:

1.  Install the Android application and open the React Native
    theme-management UI.
2.  Select ThemeOS as the default Android home app on a test device,
    where supported.
3.  See a native Kotlin launcher screen with a basic app grid and launch
    installed apps.
4.  Browse at least **two complete themes** designed by Person 1.
5.  Preview a theme and apply its supported colors, icons, layout
    settings, and home wallpaper.
6.  Restart the app/launcher and retain the selected theme and basic
    launcher state.
7.  Switch back to the default theme without leaving the launcher
    unusable.

**MVP scope limits** - Android only; test on one physical Android device
and one emulator if available. - Two polished theme packages are better
than three incomplete packages. - Use a simple grid, app drawer, and
dock. Defer folders and advanced drag-and-drop unless the core flow is
finished early. - Include a simple in-launcher clock only if time
permits. Defer third-party Android widget hosting. - Wallpaper
application must use supported Android APIs and handle user/device
restrictions gracefully. - Theme fonts affect ThemeOS launcher UI only;
do not claim system-wide font changes. - Do not attempt to replace the
secure lock screen, notification shade, or Quick Settings.

------------------------------------------------------------------------

## 2. Team ownership

### Person 1 --- Theme Design, Assets & Theme Packages

**Primary responsibility:** Produce the visual system and valid theme
packages that Person 2 can integrate without custom code for each theme.

Tasks: - Define a consistent visual direction and design tokens. -
Design two themes: - **Midnight Obsidian:** dark, restrained accent,
AMOLED-friendly. - **Lavender Dreams** or **Minimal Beige:** choose one
based on available design time. - Create home wallpaper and preview
images for each theme. - Design a consistent icon set for the core apps
visible on the test device (for example: Phone, Messages, Camera,
Settings, Chrome, Photos, YouTube, and Maps). - Export icons and
wallpapers in optimized formats. - Create `theme.json` and
`manifest.json` for each theme using the agreed schema. - Validate every
asset path, file type, and required field. - Provide a theme preview
image and a short description. - Maintain an asset-mapping sheet listing
Android package IDs and matching icon files. - Test the package with
Person 2 and fix missing/mismatched assets.

**Deliverables** - `themes/midnight-obsidian/` -
`themes/<second-theme-id>/` - `docs/THEME_SCHEMA.md` - Asset mapping
sheet - Two preview images per theme (home and app drawer, if available)

**Definition of done** - Both packages parse successfully. - Every
referenced asset exists. - No duplicate or ambiguous asset filenames. -
Icons use consistent dimensions, padding, and visual style. - Theme
packages can be added without changing launcher rendering code.

### Person 2 --- React Native, Kotlin Launcher & Integration

**Primary responsibility:** Build the working application, native
launcher foundation, theme loading, and application flow.

Tasks: - Initialize the React Native project with TypeScript. - Set up
navigation and the minimum screens: Discover, Theme Details/Preview, My
Themes, and Settings. - Create the Kotlin Android launcher activity and
register the HOME/DEFAULT intent filters. - Implement installed-app
discovery using Android launcher APIs and appropriate package-visibility
declarations. - Display app labels and icons; launch selected
applications. - Build a basic native home-screen grid and simple app
drawer. - Implement a typed React Native-to-Kotlin interface for
launcher status and theme application. - Implement theme package loading
and validation, including safe asset-path handling. - Store the active
theme ID and basic launcher state locally. - Apply supported colors,
icon mappings, layout values, and wallpaper. - Add loading, error, and
rollback handling for failed theme application. - Build debug APKs and
coordinate physical-device testing.

**Deliverables** - Working React Native Android application - Kotlin
HOME activity and basic launcher - Theme loader/validator and native
integration - Local persistence for active theme - Installable debug
APK - `docs/BUILD_AND_TEST.md`

**Definition of done** - ThemeOS can be selected as the default launcher
on the test device. - The launcher can display and open installed
apps. - The React Native UI can request a theme change. - A valid theme
changes supported launcher appearance. - An invalid theme is rejected
without breaking the active theme.

------------------------------------------------------------------------

## 3. Shared architecture and interface contract

Keep the boundary between the two engineers explicit.

``` text
React Native
  ├── Discover / Theme Preview / My Themes / Settings
  ├── Theme catalogue and installation UI
  └── Typed native interface
          |
          v
Kotlin Android layer
  ├── LauncherActivity
  ├── InstalledAppsRepository
  ├── LauncherView / AppDrawer
  ├── ThemeInstaller / ThemeManager
  └── WallpaperController
          |
          v
Local application storage
  ├── Installed theme packages
  ├── Active theme ID
  └── Launcher preferences
```

**Agree on this contract on Day 1. Do not let both engineers invent
different formats.**

Minimum theme package:

``` text
themes/
  midnight-obsidian/
    theme.json
    manifest.json
    wallpapers/
      home.webp
    icons/
      phone.webp
      messages.webp
      camera.webp
      settings.webp
      chrome.webp
    previews/
      home.webp
      app-drawer.webp
```

Minimum `theme.json` fields:

``` json
{
  "schemaVersion": 1,
  "id": "midnight-obsidian",
  "name": "Midnight Obsidian",
  "version": "1.0.0",
  "appearance": {
    "background": "#080808",
    "surface": "#151515",
    "primary": "#D6B878",
    "text": "#FFFFFF"
  },
  "wallpaper": "wallpapers/home.webp",
  "icons": {
    "com.android.chrome": "icons/chrome.webp"
  },
  "layout": {
    "columns": 5,
    "dockEnabled": true
  }
}
```

The team may extend this schema only by agreement. The sample package
paths and package IDs must be checked against the actual files and test
device.

**Suggested native interface** - `getLauncherStatus()` -
`getInstalledApplications()` - `getInstalledThemes()` -
`applyTheme(themeId)` - `getActiveTheme()` -
`openDefaultLauncherSettings()`

Return structured success/error results. Do not expose direct database
manipulation to React Native.

------------------------------------------------------------------------

## 4. Five-day execution schedule

### Monday, 2 November --- Foundation and contract

**Person 1** - Choose the two theme art directions. - Define palette,
icon style, wallpaper composition, and typography. - Create the theme
directory skeleton. - Draft `theme.json` and asset naming conventions. -
Produce first sample wallpaper and 4--5 sample icons.

**Person 2** - Initialize React Native Android project. - Confirm debug
build works on emulator/device. - Create navigation shell and
placeholder screens. - Create Kotlin launcher activity and HOME intent
filter. - Verify ThemeOS appears in Android's default home-app selection
flow. - Create a basic native-to-JS health-check/interface spike.

**Joint checkpoint** - Commit the theme schema and native interface
contract. - Confirm both engineers can build and run the same
repository. - Resolve package IDs, file paths, and method names before
proceeding.

### Tuesday, 3 November --- Launcher foundation and first theme

**Person 1** - Complete first theme's wallpaper and core icon set. -
Create its JSON and manifest. - Start second theme's wallpaper and icon
set. - Check assets against the actual device's installed application
package IDs.

**Person 2** - Implement installed-app discovery. - Render app labels
and icons in a basic native grid. - Implement launching an
application. - Build a simple app drawer. - Add the first theme-list and
theme-preview UI in React Native.

**Joint checkpoint** - Demonstrate a working HOME launcher that can open
several installed apps. - Parse Person 1's first theme package
successfully.

### Wednesday, 4 November --- Theme application end-to-end

**Person 1** - Finish the second theme package. - Complete preview
assets and descriptions. - Run package validation and fix missing
assets. - Supply a final asset inventory and package-ID mapping.

**Person 2** - Implement theme installation/loading from app-bundled
assets. - Implement theme validation and safe asset resolution. - Apply
theme colors, icon mappings, and layout values in the launcher. -
Persist active theme ID. - Connect React Native Apply action to
Kotlin. - Implement wallpaper application or a graceful supported
fallback.

**Joint checkpoint** - Select Theme A in React Native and verify the
native launcher changes. - Switch to Theme B and verify the change. -
Confirm a failed/invalid theme does not corrupt the active theme.

### Thursday, 5 November --- Integration, persistence and polish

**Person 1** - Fix visual inconsistencies found on the device. -
Optimize image sizes and ensure previews match the real launcher. -
Verify every icon mapping and asset path. - Prepare final theme package
documentation.

**Person 2** - Improve home-screen spacing and responsive grid
behavior. - Add dock if the core launcher is stable. - Handle missing
icons with system-icon fallback. - Handle removed/unavailable
applications. - Improve persistence and launcher restart behavior. - Add
loading and error states to the React Native screens.

**Joint checkpoint** - Test reboot/relaunch and confirm active theme
persistence. - Test missing assets and unsupported package IDs. - Freeze
new features at the end of the day.

### Friday, 6 November --- QA and release candidate

**Person 1** - Perform visual QA on both themes. - Fix final icon,
wallpaper, and preview defects. - Freeze theme assets and package
versions. - Verify license/redistribution rights for all fonts and
assets.

**Person 2** - Run full build from a clean checkout. - Test default
launcher selection and app launching. - Test theme switching, wallpaper,
and persistence. - Fix crashes and blocking defects. - Produce a signed
or locally installable release-candidate APK as appropriate.

**Joint checkpoint** - Run the acceptance checklist below. - No new
features after this checkpoint. - Record known limitations.

### Saturday, 7 November --- Final verification and handover

**Both engineers** - Install the final build from scratch on the test
device. - Verify the complete user journey. - Confirm both theme
packages are included and work. - Verify fallback behavior and restart
persistence. - Update README and build instructions. - Tag the final
build in Git. - Archive the APK and source commit.

**Deadline deliverable:** A working, demonstrable Android MVP and its
source repository.

------------------------------------------------------------------------

## 5. Daily collaboration rules

1.  Use one shared Git repository and one integration branch.
2.  Person 1 owns theme assets, theme JSON, previews, and schema
    documentation.
3.  Person 2 owns React Native screens, Kotlin launcher code, and native
    integration.
4.  Agree on interfaces before implementation; avoid changing shared
    contracts unilaterally.
5.  Push working changes at least twice per day.
6.  Integrate at the end of every day---do not wait until Friday.
7.  Keep commits small and descriptive.
8.  Raise blockers immediately; do not spend half a day guessing at
    Android behavior.
9.  Test on a physical device daily.
10. Freeze scope on 5 November if the core flow is not already stable.

Suggested branch names:

``` text
main
integration
person-1/theme-assets
person-2/launcher-foundation
person-2/theme-integration
```

------------------------------------------------------------------------

## 6. Final acceptance checklist

### Application

-   [ ] React Native application builds and launches.
-   [ ] Discover/theme catalogue screen works.
-   [ ] Theme details and preview work.
-   [ ] My Themes lists the included themes.
-   [ ] Apply action gives clear progress and error feedback.

### Native launcher

-   [ ] ThemeOS is eligible to be selected as HOME.
-   [ ] Default launcher selection works on the test device.
-   [ ] Installed launchable applications appear.
-   [ ] Tapping an application launches it.
-   [ ] Missing theme icon falls back to the app's system icon.
-   [ ] Basic grid adapts to the test device.

### Theme engine

-   [ ] Two theme packages are included.
-   [ ] Theme JSON is validated.
-   [ ] Referenced assets exist.
-   [ ] Theme switching updates supported UI elements.
-   [ ] Active theme persists after restart.
-   [ ] Invalid packages are rejected safely.

### Assets and wallpaper

-   [ ] Both themes have wallpapers.
-   [ ] Core app icons are visually consistent.
-   [ ] Preview images match the delivered themes.
-   [ ] Wallpaper application succeeds or displays a clear supported
    fallback.
-   [ ] Asset and font licenses are suitable for distribution.

### Delivery

-   [ ] Clean build succeeds.
-   [ ] APK installs on the test device.
-   [ ] README contains setup and build instructions.
-   [ ] Known limitations are documented.
-   [ ] Final source is committed and tagged.

------------------------------------------------------------------------

## 7. Explicitly deferred work

Do not allow these features to jeopardize the 7 November deadline:

-   iOS application.
-   Cloud backend, user accounts, and synchronization.
-   Online theme store and remote downloads.
-   User-generated theme editor.
-   Third-party widget hosting and widget resizing.
-   Advanced drag-and-drop, folders, and multi-page launcher polish.
-   Lock-screen replacement.
-   Notification shade and Quick Settings customization.
-   System-wide font replacement.
-   AI theme generation.
-   Payments and subscriptions.

These can become the next development phase after the MVP is stable.

------------------------------------------------------------------------

## 8. Definition of success

**The build is complete when a user can install ThemeOS, set it as the
default launcher, browse two developer-designed themes, preview and
apply either theme, see the supported launcher appearance and wallpaper
change, launch installed applications, and retain the active theme after
restarting.**

Prioritize this complete end-to-end flow over the number of screens,
number of icons, animations, or theme count.

**Deadline: 7 November 2026.**
