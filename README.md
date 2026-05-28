# Parts Review App

A browser-based tool for browsing and selecting medical equipment parts to feature on the company website. Browse 100,000+ parts, mark selections, and export them as a JSON file — no installation required for end users.

---

## For End Users

Open the app in your browser at the deployed URL. No installation, no terminal, no setup required.

**Browsing parts:**
- Parts load automatically on page open
- Use the search box to filter by part number or title
- Use the manufacturer filter to narrow by brand
- Toggle "Show marked only" to see only your current selections

**Marking parts:**
- Click **Mark for Website** on any card to select a part
- Click **✓ Marked** to unmark it
- Marks save automatically — no save button needed
- Your marks persist across page refreshes and browser restarts

**Part details:**
- Click anywhere on a card (except the mark button) to open the full detail view
- Use the **Prev / Next** arrows to move between parts without closing the modal
- Press **Escape** or click outside the panel to close

**Exporting your selections:**
- Click **Export** in the top bar to download a timestamped `marked-items-YYYY-MM-DD-HH-MM.json` file
- Export as often as you like — marks are not cleared after export
- The marked count is always visible in the top bar; if it ever drops to 0 unexpectedly, re-import your last export file

**Importing a previous export:**
- Click **Import** and select a previously exported `marked-items-*.json` file
- If you already have marks, you'll be asked to confirm before they are replaced
- Use this to restore a session or hand off selections between machines

---

## For Developers

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (included with Node)

### Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:5174](http://localhost:5174) in your browser.

### Building for production

```bash
npm run build
```

Output goes to `dist/`. This is handled automatically by GitHub Actions on every push to `main` — you do not need to run this manually to deploy.

### Updating parts data

Replace `public/parts.json` with a new export and push to `main`. The app will serve the updated data on next load. Existing marks are keyed by part `id` and are preserved as long as IDs remain stable across exports.

### Deployment

The app is hosted on GitHub Pages and deploys automatically via GitHub Actions on every push to `main`. See `.github/workflows/deploy.yml` for the workflow configuration.
