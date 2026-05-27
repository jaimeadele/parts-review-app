# Parts Review App — Product Specification

> **How to use this document with Claude Code:**
> This file is the single source of truth for the project. It is used in two ways:
>
> 1. **Starting a new session:** Read Section 15 (Claude Code Instructions) carefully before doing anything else. Follow the teaching approach and git discipline defined there throughout the entire project.
> 2. **Resuming a session:** Read Section 16 (Resuming a Session) and follow those steps to orient yourself before continuing.
>
> Learning notes marked `📚 Learn:` appear throughout — pause on each one and explain it to the user before moving on.

---

## 1. Project Overview

A hosted web application (GitHub Pages) that allows a non-technical user (your boss) to browse a large catalog of medical equipment parts, mark which ones should be added to the company website, and export that list as JSON. He accesses it by opening a URL in his browser — no terminal, no setup, no installation required on his end.

**Core constraints:**
- Must handle 100,000+ parts without freezing the browser
- No backend server — hosted as a static site on GitHub Pages
- Marks are saved automatically to `localStorage` in the browser (no save button needed)
- Images load from an external Directus CDN over the internet
- Must be buildable quickly — simplicity over sophistication

---

## 2. Technology Stack

| Layer | Technology | Why |
|---|---|---|
| UI Framework | **React** (via Vite) | Fast to build, excellent ecosystem, handles large lists well |
| Styling | **Tailwind CSS** | Utility-first, no separate CSS files to manage, fast to write |
| Virtualization | **TanStack Virtual** (`@tanstack/react-virtual`) | Renders only visible rows — essential for 100k+ items |
| State | **React `useState` / `useReducer`** | No external state library needed at this scale |
| Mark persistence | **`localStorage`** | Built into every browser, survives page refresh, no backend needed |
| Build tool | **Vite** | Fast dev server, simple config, great React support |
| Hosting | **GitHub Pages** | Free, instant deploys from a GitHub repo, real public URL |
| Language | **JavaScript** (not TypeScript) | Fastest to write, no compilation step to learn |

📚 **Learn:** A "build tool" like Vite does two things: (1) runs a local dev server so you can preview the app in your browser during development, and (2) bundles all your files into a single optimized output that can be hosted as a static site. You'll run `npm run dev` while building, and `npm run build` to produce the files GitHub Pages will serve.

📚 **Learn:** "Virtualization" means only rendering what's visible on screen. If you render 100,000 `<div>` elements at once, the browser grinds to a halt. TanStack Virtual renders only ~20–30 at a time, swapping them as you scroll. This is the single most important performance decision for this project.

📚 **Learn:** `localStorage` is a small key-value store built into every browser. It persists across page refreshes and browser restarts — but it's tied to that specific browser on that specific machine. It is separate from cookies and browser cache; clearing cookies or cache does NOT clear localStorage. The only way to accidentally wipe it is to choose "Clear all site data" in browser settings (which is an intentional, non-default action). For a single-user review workflow on a consistent machine, it's a reliable choice.

---

## 3. File & Folder Structure

```
parts-review-app/
├── public/
│   ├── parts.json          ← INPUT: your exported parts data (placed here so Vite serves it)
│   └── default-image.jpg   ← Fallback image for parts with no primary_image
├── src/
│   ├── main.jsx            ← React entry point
│   ├── App.jsx             ← Root component, loads data, manages state
│   ├── components/
│   │   ├── FilterBar.jsx   ← Manufacturer multi-select + "show marked only" toggle + search
│   │   ├── PartGrid.jsx    ← Virtualized grid of part cards
│   │   ├── PartCard.jsx    ← Single card: image, title, part number, mark button
│   │   └── PartDetail.jsx  ← Modal: full part info + image gallery + prev/next
│   └── hooks/
│       └── useParts.js     ← Data loading, filtering, mark/unmark logic, localStorage sync
├── index.html
├── vite.config.js
├── package.json
└── SPEC.md                 ← (this file)
```

📚 **Learn:** Files placed in `public/` are served exactly as-is by Vite — no processing. This is where `parts.json` goes so the browser can fetch it at runtime with a simple `fetch('/parts.json')`. The `src/` folder contains your React source code, which Vite compiles and bundles.

---

## 4. Data & Persistence

### 4.1 Input: `public/parts.json`

This is your existing parts export. Copy it into the `public/` folder. It follows this shape (abbreviated):

```json
{
  "parts": [
    {
      "id": "b854c378-...",
      "part_number": "D3189T",
      "title": "CT TUBE - PERFORMIX ULTRA MAXIRAY (MX 200)",
      "slug": "D3189T",
      "manufacturer": {
        "slug": "ge-healthcare",
        "name": "GE HealthCare"
      },
      "primary_image": {
        "id": "0dd5dfa5-5210-487a-acfd-ff75b027934e"
      },
      "url": "https://parts.multi-inc.com/part/ge-healthcare/D3189T",
      "subheading": "MAXIRay MX200 CT Ultra ECO Reloaded Tube Unit",
      "details": { ... },
      "attributes": { ... },
      "images": ["https://directus.multi.merciadev.com/assets/<id>?fit=inside&width=600"],
      "scraped": true
    }
  ]
}
```

**The `scraped` field is ignored** — never display it.

### 4.2 Mark Persistence — `localStorage`

Marks are saved automatically to `localStorage` every time the boss marks or unmarks a part. No save button. No server call.

**Storage key:** `parts-review-marked`
**Storage value:** A JSON string of an array of part `id` values:
```json
["b854c378-ea0c-4d45-92da-78f7e9d72f22", "27aa03cc-43a3-40e5-bfa8-3bdfad0fa06d"]
```

On app load, read this value back from `localStorage` and merge it with the parts data to restore the previous session's marks.

📚 **Learn:** `localStorage.setItem(key, value)` saves a string. `localStorage.getItem(key)` retrieves it. Since it only stores strings, we use `JSON.stringify()` to convert our array to a string before saving, and `JSON.parse()` to convert it back when reading. This is a very common pattern.

### 4.3 Export — Timestamped JSON Download

The Export button triggers a browser file download with the filename:
```
marked-items-YYYY-MM-DD-HH-MM.json
```
Example: `marked-items-2026-05-27-14-30.json`

This means each export session produces a distinctly named file — no confusing `(1)`, `(2)` suffixes, and the latest file is always identifiable by date.

**Export file format:**
```json
{
  "exported_at": "2026-05-27T14:30:00.000Z",
  "marked_count": 42,
  "marked": [
    {
      "id": "b854c378-...",
      "part_number": "D3189T",
      "title": "CT TUBE - PERFORMIX ULTRA MAXIRAY (MX 200)",
      "manufacturer": "GE HealthCare",
      "url": "https://parts.multi-inc.com/part/ge-healthcare/D3189T"
    }
  ]
}
```

📚 **Learn:** Exporting includes the full part objects (not just IDs) so the exported file is immediately useful to whoever receives it — they don't need to cross-reference the original dataset. The `exported_at` timestamp and `marked_count` make the file self-documenting.

📚 **Learn:** To trigger a file download from JavaScript without a server, we create a temporary `<a>` element, set its `href` to a `Blob` URL containing the JSON, set its `download` attribute to the filename, programmatically click it, then remove it. This is a standard browser trick — no server required.

### 4.4 Import — Restoring Marks from a File

The Import button allows any user (on any machine or browser) to restore a marked state from a previously exported `marked-items-*.json` file. This enables handoff workflows: the boss exports, you import on your machine to review his selections, or vice versa.

**Behavior:**
1. User clicks Import
2. Browser native file picker opens (`.json` files only)
3. App reads and validates the file:
   - Must be valid JSON
   - Must contain a `marked` array
   - Each entry must have an `id` field that exists in the current parts dataset
   - If validation fails → show a clear error message, do nothing
4. If the user already has marks in `localStorage` (count > 0), show a confirmation dialog:
   > "This will replace your X current marks with Y marks from the imported file. Continue?"
5. On confirmation (or if no existing marks): write the imported IDs to `localStorage`, update app state

**What "replace" means:** all existing marks are discarded and replaced entirely with the imported set. No merging.

📚 **Learn:** Reading a local file in the browser uses the `FileReader` API. When the user picks a file, you get a `File` object. Call `reader.readAsText(file)` and handle the `reader.onload` event to get the file's text content. Then `JSON.parse()` it. This all happens client-side — the file is never uploaded anywhere.

### 4.5 localStorage Safety Note

Display the marked count prominently in the UI at all times (e.g. in the filter bar: "47 marked"). If localStorage were ever cleared, the count would drop to 0 and the boss would notice immediately — rather than discovering it at the end. Encourage exporting at the end of each session as a habit.

---

## 5. Features

### 5.1 Main View — Part Grid

- **Layout:** Responsive card grid (3–4 columns on wide screens, 2 on medium)
- **Virtualized:** Only renders visible cards using TanStack Virtual
- **Each card shows:**
  - Primary image (loaded from Directus CDN, with a gray placeholder if unavailable)
  - Part title (truncated with ellipsis if too long)
  - Part number
  - Manufacturer name
  - A ✓ Mark / ✗ Unmark toggle button
- **Clicking a card** (anywhere except the mark button) opens the Part Detail modal
- **Loading indicator** shown while `parts.json` is being fetched and parsed

📚 **Learn:** Images are loaded lazily — the browser only fetches an image when it scrolls into view. This is controlled by the `loading="lazy"` attribute on `<img>` tags. Combined with virtualization, the app won't try to load 100k images at once.

### 5.2 Filter Bar (sticky, always visible at top of page)

| Control | Behavior |
|---|---|
| **Search box** | Filters by part number or title (case-insensitive substring). Debounced 300ms. |
| **Manufacturer filter** | Multi-select dropdown. Options derived dynamically from parts data. Default: all shown. |
| **"Show marked only" toggle** | Checkbox/toggle. When on, hides all unmarked parts. |
| **Count display** | "Showing X of Y parts · **Z marked**" — updates live. The marked count is always visible as a persistence safety indicator. |
| **Export button** | Downloads a timestamped `marked-items-YYYY-MM-DD-HH-MM.json`. Disabled when 0 parts are marked. |
| **Import button** | Opens the browser's native file picker. User selects a previously exported `marked-items-*.json`. After validation, replaces the current marked state with the imported one (with a confirmation dialog if marks already exist). |

📚 **Learn:** "Debouncing" means waiting for the user to stop typing before running the filter. Without it, every keystroke triggers a full re-filter of 100k items. With a 300ms debounce, if the user types "CT TUBE" quickly, filtering only runs once — after they pause. Implementation uses `setTimeout` / `clearTimeout`.

### 5.3 Part Detail View — Modal

Clicking a card opens a full-screen modal overlay with complete part information.

**Displayed fields (all except `scraped`):**
- Title (large heading)
- Part number
- Subheading
- Manufacturer name + clickable link to `url`
- Primary image (large, full modal width)
- Image gallery (all `images` array entries shown as thumbnails; clicking a thumbnail promotes it to the main slot)
- Details section (key/value pairs from the `details` object — array values like `System Model(s)` rendered as a bulleted list)
- Attributes section (key/value pairs from the `attributes` object)
- Mark / Unmark button (same toggle as the card, shown prominently)

**Navigation:**
- **Close:** button (top right) or pressing `Escape`
- **Click outside:** clicking the dark overlay background closes the modal
- **Prev / Next arrows:** navigate to adjacent parts in the current filtered list — critical for efficient review without returning to the grid each time

📚 **Learn:** Prev/Next in the modal is a major workflow accelerator. Track the index of the currently open part within the filtered list. `prevPart = filteredParts[currentIndex - 1]` and `nextPart = filteredParts[currentIndex + 1]`. Disable the arrows at the boundaries.

### 5.4 Mark / Unmark Behavior

- Toggling mark state on a card or in the detail modal updates `localStorage` immediately
- No explicit save step — it's automatic
- Marked cards are visually distinguished in the grid: green left border + small green checkmark badge (top-right corner of card)
- The mark button label changes: "Mark for Website" ↔ "✓ Marked"

### 5.5 Export

Clicking Export:
1. Reads current marked IDs from state
2. Looks up the full part objects for each ID
3. Builds the export object (see Section 4.3 format)
4. Generates the timestamped filename
5. Triggers a browser download

The export does **not** clear the marks — the boss can export multiple times and marks persist.

### 5.6 Import

Clicking Import:
1. Opens the browser's native file picker (filtered to `.json`)
2. User selects a previously exported `marked-items-*.json`
3. App validates and, on confirmation, replaces the marked state (see Section 4.4 for full behavior)

---

## 6. Image Handling

Images load from:
```
https://directus.multi.merciadev.com/assets/<image_id>?fit=inside&width=600
```

The `primary_image.id` field gives the `<image_id>` for each part's main card image.

**Missing image handling:**
- Place the default image file at `public/default-image.jpg`
- If a part has `primary_image: null` or no `primary_image` field, use `default-image.jpg` as the `src` directly — no `onError` needed for this case
- If the CDN *does* load an image for a part that has a `primary_image` id, show that image as normal
- If the CDN request fails for a part that *has* a `primary_image` id, the browser's broken image icon may show — this is acceptable, since the default image is only intended for parts with no image data at all
- Never show a broken image icon for parts with no `primary_image` — the default image prevents that entirely

**Detail modal gallery:**
- Primary image shown large at the top
- Remaining images from the `images` array shown as small thumbnails below
- Clicking a thumbnail swaps it into the main image slot (local state — no page reload)

---

## 7. Performance

With 100,000+ parts, standard approaches will break. Here is the plan:

| Problem | Solution |
|---|---|
| Rendering 100k cards freezes the browser | TanStack Virtual — render only ~30 cards at a time |
| Filtering 100k items on every keystroke | Debounce search 300ms |
| Parsing a large JSON file blocks the UI | Show a loading spinner; parse synchronously. If file exceeds ~20MB and feels slow, move to a Web Worker. |
| 100k image requests on load | `loading="lazy"` + virtualization = only visible images load |

📚 **Learn:** A "Web Worker" is a JavaScript file that runs in a background thread so it doesn't block the UI. Parsing JSON in a Web Worker keeps the page responsive. For this app, try the simple approach first (synchronous parse with a spinner). Only add complexity if needed.

---

## 8. Deployment — GitHub Pages

### 8.1 Overview

GitHub Pages serves the output of `npm run build` (the `dist/` folder) as a public website at a URL like:
```
https://<your-github-username>.github.io/parts-review-app/
```

This is free, requires no server, and updates automatically when you push changes.

### 8.2 Setup Steps

1. Create a GitHub repository named `parts-review-app`
2. Push the project code to it
3. In `vite.config.js`, set `base: '/parts-review-app/'` (must match the repo name)
4. Add a GitHub Actions workflow (`.github/workflows/deploy.yml`) that runs `npm run build` and deploys `dist/` to GitHub Pages on every push to `main`
5. In the GitHub repo settings → Pages, set the source to "GitHub Actions"

📚 **Learn:** GitHub Actions is a free automation system built into GitHub. A "workflow" is a YAML file that defines a sequence of steps to run automatically (in this case: install dependencies → build → deploy). You write this file once and it runs on every push. This is called CI/CD (Continuous Integration / Continuous Deployment).

📚 **Learn:** The `base` option in Vite tells it the root path of the app. Without it, the app assumes it lives at `/`, but on GitHub Pages it lives at `/parts-review-app/`. Mismatching this breaks all asset paths.

### 8.3 Updating the App

After the initial deploy, to push an update:
```bash
git add .
git commit -m "describe what changed"
git push
```
GitHub Actions automatically rebuilds and redeploys. The live URL updates within ~1 minute.

### 8.4 Updating `parts.json`

If the parts dataset is refreshed, replace `public/parts.json` with the new file and push. The app will serve the new data on next load. The boss's marks in `localStorage` are keyed by part `id` — as long as IDs are stable across exports, marks are preserved even after a data refresh.

---

## 9. UI Design Guidance

Clean and functional — this is an internal tool.

- **Color scheme:** White background, gray borders, blue accent (`#2563EB` / Tailwind `blue-600`)
- **Marked state:** Green left border + green checkmark badge on cards; green "✓ Marked" button
- **Font:** System default (no custom fonts — saves a network request)
- **Card height:** Fixed (e.g. 280px) — required for accurate virtualization
- **Image aspect ratio:** 4:3, `object-fit: cover` — consistent regardless of source dimensions
- **Modal:** Full-screen dark overlay, white panel centered, max-width 800px, scrollable content
- **Filter bar:** Sticky top bar, white background, subtle bottom border, ~64px tall

---

## 10. Step-by-Step Build Plan

Follow these steps in order. Claude Code will guide you through each.

### Step 1: Project Scaffolding
```bash
npm create vite@latest parts-review-app -- --template react
cd parts-review-app
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install @tanstack/react-virtual
```

📚 **Learn:** `npm create vite@latest` generates a complete starter project. `npm install` downloads all dependencies listed in `package.json`. You'll only run these commands once.

### Step 2: Configure Tailwind
- Add the Tailwind Vite plugin to `vite.config.js`
- Add `@import "tailwindcss"` to `src/index.css`

### Step 3: Configure Vite for GitHub Pages
In `vite.config.js`, add:
```js
base: '/parts-review-app/'
```
Also add `gh-pages` as a dev dependency if you want a manual deploy option:
```bash
npm install -D gh-pages
```

### Step 4: Add `parts.json`
Copy your parts export into `public/parts.json`. Vite will serve it at `/parts.json` during development and bundle it for production.

### Step 5: Build `useParts` Hook

This hook is the brain of the app. It:
- `fetch('/parts.json')` on mount, sets loading state while waiting
- Reads marked IDs from `localStorage` on mount
- Exposes `filteredParts` based on current search, manufacturer filter, and "marked only" toggle
- Exposes `manufacturers` list derived from data
- Exposes `markPart(id)` and `unmarkPart(id)` that update state AND write to `localStorage`
- Exposes `markedCount` for the count display
- Exposes `exportMarked()` that builds and downloads the timestamped JSON file
- Exposes `importMarked(file)` that reads a `marked-items-*.json` File object, validates it, and replaces `localStorage` + state with the imported IDs

📚 **Learn:** Keeping all data logic in one hook makes components simple — they just call `useParts()` and get everything they need. This pattern is called "separation of concerns." Components handle display; the hook handles data.

### Step 6: Build `FilterBar`
- Search input with 300ms debounce
- Manufacturer multi-select (`<select multiple>` is fine; style with Tailwind)
- "Show marked only" checkbox
- Count display: "Showing X of Y · **Z marked**"
- Export button (disabled when `markedCount === 0`)
- Import button: renders a visually hidden `<input type="file" accept=".json">`, triggered by clicking a styled button. On file selection, calls `importMarked(file)` from the hook. If `markedCount > 0`, shows a `window.confirm()` dialog first: "This will replace your {markedCount} current marks with the imported marks. Continue?" On cancel, aborts the import.

📚 **Learn:** You can't style a browser's default file input, but you can hide it (`display: none`) and trigger it programmatically. Attach a `ref` to the hidden `<input>`, then call `ref.current.click()` from your styled button's `onClick`. The browser opens the file picker as normal. This is standard practice.

### Step 7: Build `PartCard`
- Fixed height (important for virtualization)
- `<img loading="lazy">` with `onError` placeholder fallback
- Title (truncated), part number, manufacturer name
- Mark/Unmark button — calls `markPart` / `unmarkPart`, stops click propagation so it doesn't open the modal
- Green border + badge when marked
- `onClick` on the card opens the detail modal

### Step 8: Build `PartGrid` with Virtualization
- Use `useVirtualizer` from `@tanstack/react-virtual`
- Provide it the `filteredParts` array and a fixed item height
- Render only `virtualizer.getVirtualItems()` — never the full array
- Position items absolutely using `transform: translateY(item.start)`
- Set the container div height to `virtualizer.getTotalSize()` so the scrollbar is correct

📚 **Learn:** The virtualizer doesn't render your data — it tells you *which* items to render and *where* to put them. You loop over `getVirtualItems()`, use `item.index` to get the data, and `item.start` for the vertical position. The rest of the list exists only as empty scroll space.

### Step 9: Build `PartDetail` Modal
- Full-viewport overlay (`position: fixed, inset: 0`)
- White scrollable panel centered in the overlay
- Escape key closes (`useEffect` + `window.addEventListener`)
- Clicking overlay background closes; clicking panel does not (use `stopPropagation`)
- Render all fields per Section 5.3
- Thumbnail gallery with click-to-promote behavior
- Prev/Next buttons using `currentIndex` in `filteredParts`

### Step 10: Wire Together in `App.jsx`
- Render `FilterBar` + `PartGrid`
- `selectedPartIndex` state — when set, render `PartDetail` as overlay
- Pass `onClose`, `onPrev`, `onNext` to `PartDetail`

### Step 11: Test with Real Data
- Load the full `parts.json`
- Scroll performance should be smooth
- Filter, search, mark, refresh — verify marks persist
- Export and inspect the downloaded file

### Step 12: Set Up GitHub Actions Deploy
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

📚 **Learn:** This file tells GitHub: "When code is pushed to `main`, install Node, run `npm run build`, and publish the `dist/` folder to Pages." GitHub provides free computing to run this. After merging once, every future `git push` auto-deploys.

### Step 13: Polish
- Loading spinner / skeleton while `parts.json` fetches
- Empty state message when filters match 0 parts
- Confirm Export downloads a valid, correctly-named file

---

## 11. Edge Cases to Handle

| Case | Handling |
|---|---|
| Part has no `primary_image` | Show `default-image.jpg` from `public/` |
| Part has no `images` array or it's empty | Skip gallery in detail view |
| `details` value is an array (e.g. `System Model(s)`) | Render as a bulleted list |
| `attributes` is null or missing | Skip that section entirely |
| localStorage is empty on first visit | `markedIds` defaults to `[]` — no error |
| Boss refreshes the page | Marks reload from `localStorage` — no data loss |
| CDN image fails to load | `onError` swaps in the placeholder — no broken icon |
| Very long title | `text-overflow: ellipsis` in card; full title in modal |
| Imported file is not valid JSON | Show error: "Invalid file — could not parse JSON." Do nothing. |
| Imported file has no `marked` array | Show error: "Invalid file — missing marked list." Do nothing. |
| Imported IDs don't match any parts | Show warning: "No matching parts found in the current dataset." Do nothing. |
| User cancels the file picker | Do nothing — no error needed |
| User cancels the confirmation dialog | Do nothing — existing marks preserved |

---

## 12. Out of Scope (Do Not Build)

- User authentication / login
- Multi-user support / conflict resolution
- Undo/redo for marks
- Sorting (filtering is sufficient)
- Mobile responsiveness (desktop tool)
- Notes/comments on individual parts
- Any backend or server-side code

---

## 13. Definition of Done

The app is complete when:
- [ ] All 100k+ parts load and display without freezing
- [ ] Search filters by title and part number (debounced)
- [ ] Manufacturer multi-select filter works correctly
- [ ] "Show marked only" toggle works
- [ ] Part cards show image, title, part number, manufacturer, and mark state
- [ ] Clicking a card opens the detail modal with all fields
- [ ] Image gallery with click-to-promote works in the modal
- [ ] Prev/Next navigation works in the modal within the filtered list
- [ ] Marking a part saves to `localStorage` immediately (no manual save)
- [ ] Marked parts have a green border + badge in the grid
- [ ] Marked count is always visible in the filter bar
- [ ] Refreshing the page restores all marks from `localStorage`
- [ ] Export button downloads a valid `marked-items-YYYY-MM-DD-HH-MM.json`
- [ ] Import button opens a file picker, validates the file, confirms if marks exist, and replaces state
- [ ] App is deployed to GitHub Pages and accessible via public URL
- [ ] GitHub Actions auto-deploys on push to `main`

---

## 14. Quick Reference: Key Commands

```bash
# During development — start local preview server
npm run dev
# Open http://localhost:5174 in your browser

# Build for production (output goes to dist/)
npm run build

# Deploy: just push to GitHub — Actions handles the rest
git add .
git commit -m "your message"
git push
```

---

## 15. Claude Code Instructions — Teaching Approach & Git Discipline

> These instructions govern how Claude Code should behave throughout the entire project. Re-read this section at the start of every session.

### 15.1 Teaching Philosophy

The primary goal is to finish the project quickly. Claude Code writes the code — the user is not expected to type most of it themselves. However, every significant piece of code written must be accompanied by a clear explanation of what it does and why, so the user understands the project as it is built. Specifically:

- **Write the code, then explain it.** Generate each file or function, then walk through the key parts conversationally. Don't just drop code silently — narrate what was just written at a level the user can follow.
- **Explain the *why*, not just the *what*.** Before introducing any new concept or file, explain what problem it solves and why this approach was chosen. The `📚 Learn:` notes in this spec are a starting point — expand on them conversationally as each relevant piece is built.
- **Invite the user to type small illustrative pieces when it aids learning.** If typing a single line themselves would make a concept click — like their first `useState` call or their first Tailwind class — invite them to type just that piece. This is optional and should never slow the project down. When in doubt, write it yourself and explain it instead.
- **Invite questions, don't quiz.** After explaining a concept, briefly note that the user can ask questions at any time. Never ask a comprehension question to check understanding — let the user drive that.
- **Celebrate progress.** After each completed step, briefly acknowledge what was built and what it now does in the browser before moving to the next step.

### 15.2 Pacing

- Complete one numbered step from Section 10 at a time. Do not jump ahead.
- At the end of each step, check the Definition of Done checklist (Section 13) to see which items can be ticked off.
- After each step is confirmed working in the browser, prompt the user to commit (see Section 15.3).

### 15.3 Git Discipline

Git is used throughout the project — not just at the end. The user is learning git as part of this project, so explain each command before they run it.

**Branch strategy:**
- `main` — stable, deployable code only. GitHub Actions deploys from this branch.
- Feature branches — one per build step (e.g. `feature/project-scaffolding`, `feature/useParts-hook`, `feature/filter-bar`, etc.). All development happens on feature branches.
- When a step is complete and tested, merge the feature branch into `main` via a pull request (or local merge if the user prefers simplicity).

**Commit cadence:**
- Commit at the end of every step in Section 10.
- Also commit at meaningful mid-step milestones (e.g. after getting the dev server running for the first time, after a component renders without errors even if not fully functional yet).
- Remind the user to commit — do not let them move on to the next step without committing the current one.

**Commit message format:**
```
<type>: <short description>

Examples:
feat: scaffold Vite + React project
feat: add useParts hook with data loading
feat: build FilterBar with search and manufacturer filter
fix: correct virtualizer item height calculation
chore: add GitHub Actions deploy workflow
```

**Explaining git concepts as they arise:**
- When creating the first branch: explain what a branch is and why we use them (isolation — changes on a branch don't affect `main` until merged).
- When committing: explain what a commit is (a snapshot of the project at a point in time, with a message describing what changed).
- When merging: explain what a merge is (combining the branch's changes back into `main`), and what a merge conflict is (and that we're unlikely to hit one working solo, but it's good to know).
- When pushing: explain what pushing does (sends your local commits to GitHub so they exist remotely).

### 15.4 GitHub Actions — Teach in Detail

The user has never used GitHub Actions. When Step 12 arrives, do not simply create the file. Walk through it field by field, in this order:

1. **What is CI/CD?** Explain the concept: every time code is pushed, an automated system runs tasks (build, test, deploy) so humans don't have to do it manually. "CI" = Continuous Integration (automatically checking that new code doesn't break things). "CD" = Continuous Deployment (automatically shipping new code to users).

2. **What is a workflow file?** A YAML file in `.github/workflows/`. GitHub watches this folder. When the trigger condition is met, GitHub spins up a fresh virtual machine and runs the steps.

3. **Walk through the YAML line by line:**
   - `name:` — the display name shown in the GitHub Actions UI
   - `on: push: branches: [main]` — the trigger: "run this workflow whenever code is pushed to the `main` branch"
   - `permissions:` — what the workflow is allowed to do (read code, write to Pages, prove its own identity)
   - `jobs:` — the list of jobs to run. Each job runs on its own machine.
   - `runs-on: ubuntu-latest` — the virtual machine OS GitHub will use
   - `steps:` — the sequence of actions within the job
   - `uses: actions/checkout@v4` — a pre-built action that downloads the repo's code onto the virtual machine
   - `uses: actions/setup-node@v4` — installs Node.js on the virtual machine
   - `run: npm install` — installs project dependencies (same as on your local machine)
   - `run: npm run build` — builds the production bundle (creates `dist/`)
   - `uses: actions/upload-pages-artifact@v3` — packages `dist/` for deployment
   - `uses: actions/deploy-pages@v4` — sends the packaged files to GitHub Pages

4. **Walk through the GitHub repo settings** needed to enable Pages with the "GitHub Actions" source. Tell the user exactly where to click.

5. **After the first successful deploy:** show the user where to watch the workflow run in the GitHub Actions tab, how to read the logs, and how to spot an error if one occurs.

6. **Explain what happens on future pushes:** the workflow reruns automatically — the user never has to touch the Actions tab again unless debugging.

### 15.5 File Placement

The spec file (`SPEC.md`) should live in the **root of the project repository** alongside `package.json`, `vite.config.js`, etc. It is committed to the repo so it's always available.

Do not add `SPEC.md` to `.gitignore` — it is intentionally part of the repo.

---

## 16. Resuming a Session

> Follow these steps at the start of any session that is continuing from a previous one.

### Step R1 — Read the spec
Re-read this entire document to restore context. Pay particular attention to:
- Section 10 (Build Plan) — identify which steps are complete and which are not
- Section 13 (Definition of Done) — check which items are ticked
- Section 15 (Claude Code Instructions) — re-internalize the teaching approach before writing a single line of code

### Step R2 — Check the git log
Run the following and read the output to the user:
```bash
git log --oneline -10
```
This shows the last 10 commits. Use the commit messages to understand what has been built so far.

### Step R3 — Check the current branch
```bash
git branch
```
The active branch is marked with `*`. If it is `main`, create or check out the appropriate feature branch for the next step before doing anything else.

### Step R4 — Check for uncommitted changes
```bash
git status
```
If there are uncommitted changes, pause and ask the user: "There are uncommitted changes from the previous session. Would you like to commit them before continuing, or discard them?" Do not proceed until this is resolved.

### Step R5 — Open the dev server
```bash
npm run dev
```
Confirm the app loads in the browser at `http://localhost:5174` before continuing. If it errors, diagnose and fix before moving forward.

### Step R6 — Orient the user
Summarize aloud: which steps are done, what the current state of the app is, and what the next step will be. Then ask: "Ready to continue with Step X?" before proceeding.

---

*Spec version 3.0 — added Claude Code instructions and session resume guide*
