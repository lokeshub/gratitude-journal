# Gratitude Journal starter

A responsive React + TypeScript PWA starter. Entries and photos are stored locally in the browser using IndexedDB.

## Requirements
- Node.js 20 or newer
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite (usually http://localhost:5173).

## Production build
```bash
npm run build
npm run preview
```

## Current starter features
- Responsive home page with floating gratitude cards
- Smaller card images; larger image in the detail view
- Add/edit entries with required title, optional description/photo, editable memory date
- Save button in the top-right corner
- Delete confirmation and unsaved-changes confirmation
- Newest memory date first
- Light/dark theme toggle
- Occasional random memory prompt
- IndexedDB local persistence

## Important storage note
This starter stores journal data in the browser profile on the current device. It does not upload entries to a cloud service and does not synchronize automatically across devices. Clearing browser site data, uninstalling the browser, or losing the device can remove the journal. Export/backup and recovery-code functionality are not implemented yet.

## Next implementation milestones
1. Export/import encrypted or plain backup file.
2. Recovery code flow (requires a deliberate backup/restore design; a code alone cannot recover data that exists only on a lost device).
3. PWA install/offline polish and service worker.
4. Accessibility, image compression, and cross-browser testing.
