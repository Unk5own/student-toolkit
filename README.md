# Student Toolkit

An offline-first academic toolkit for TAR UMT students. Plain HTML, CSS and
JavaScript — no build step, no framework, no dependencies to install.

Installable as a PWA and fully usable with no network connection, including the
campus map.

## Tools

| Page | What it does |
|---|---|
| `index.html` | Dashboard — lowest attendance, semester GPA, next class today, backup & restore |
| `timetable.html` | Weekly class schedule; one tap logs a missed class against attendance |
| `attendance.html` | Hours-based attendance with dated absence history and the 80% safe-skip limit |
| `marks.html` | Works out the score you need in each component to reach a target grade |
| `calculator.html` | Semester GPA and projected CGPA |
| `map.html` | Pan/zoom campus map with building search and emergency assembly points |

## Running it

Any static file server works. It must be served over HTTP — the service worker
and the map's `fetch` will not run from `file://`.

```bash
python -m http.server 8123
```

Then open <http://localhost:8123>.

## How the data is organised

**`data.js`** is the single source of truth for the *current* semester. Each
subject carries both its timetable info and its assessment breakdown:

```js
{
  code: "BMCS2003", name: "ARTIFICIAL INTELLIGENCE",
  credits: 3, weeklyHours: 4,
  assessment: { final: 30, components: [
    { id: "c1", name: "Test", weight: 28 },
    { id: "c2", name: "Assignment", weight: 42 }
  ]}
}
```

`assessment.final` plus the component weights must total 100 — the app logs a
console warning if they don't. Set `targetMarks: false` to hide a subject from
the Target Marks calculator (used for co-curricular subjects).

`gradingScale` in the same file drives both grading-scale tables, the GPA
dropdowns and the Target Marks rows. Change a boundary there and every screen
follows.

**`university.json`** holds the full 9-semester curriculum for both programmes,
but only `code`, `name` and `credits`. Nothing loads it yet — it is broader than
`data.js` but shallower, so it would suit past-semester CGPA history rather than
attendance or marks.

## Where your data lives

Everything is in `localStorage` on your device; nothing is uploaded anywhere.

| Key | Contents |
|---|---|
| `studentProfile` | Active programme and semester |
| `attendanceRecord` | Dated absence entries per subject |
| `timetable` | Your weekly class schedule |
| `gpaState` | Saved grades and previous CGPA |
| `marksScores` | Saved Target Marks inputs |
| `theme` | Light or dark |

Because that is one "clear browsing data" away from being lost, the dashboard
has **Export backup** / **Restore backup** buttons that round-trip all of it as
a single JSON file.

## Offline behaviour

`sw.js` caches the app on first visit.

- Small shell files (HTML/CSS/JS) use **stale-while-revalidate** — served
  instantly from cache, refreshed in the background, so edits appear on the next
  load without bumping the cache version.
- Large assets (`campus-map.svg`, the PDF, `panzoom.min.js`, icons) are
  **cache-first** and only refresh when `CACHE_NAME` changes.

Bump `CACHE_NAME` in `sw.js` when you change a large asset.

## The campus map

`campus-map.svg` (~6.3 MB) is loaded at runtime rather than inlined, so the page
paints immediately instead of blocking on it. It was optimised with SVGO using
`svgo.config.js`, which deliberately disables `cleanupIds` — the search index
looks buildings up by `id`, and ~235 fills reference `<pattern>`/`<filter>` defs
by `url(#…)`.

If you re-export the map from Figma, re-run:

```bash
npx svgo --config svgo.config.js -i campus-map.svg -o campus-map.svg
```

`panzoom` 9.4.0 is vendored locally as `panzoom.min.js` rather than loaded from
a CDN, so the map still pans and zooms offline.

## Known gaps

- The grading scale jumps from C (50) straight to F, with no C-/D+/D bands.
  Verify it against your programme handbook before relying on it.
- The map results list is mouse-only — no keyboard navigation yet.
- Adding a custom attendance subject still uses a chain of `prompt()` dialogs.
- The timetable supports add and delete, but not editing an entry.
- No handling for semester rollover; attendance is keyed by course code.
