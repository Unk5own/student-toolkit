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

**`university.json`** holds the full 9-semester curriculum for both programmes
with `code`, `name` and `credits`. It powers the **Past Semesters** panel on the
GPA calculator: every semester earlier than your current one is listed with its
real subjects, and grading them builds your CGPA properly instead of you having
to remember a previous-CGPA figure.

Tick *"Work these out from my past semesters"* and the Previous CGPA / Previous
Total Credits boxes become read-only, derived values. Untick it to go back to
typing them yourself — useful for transfer credits or anything the standard
curriculum doesn't cover. Both figures are stored, so switching back and forth
never loses what you typed.

Semester keys sort lexicographically (`Y1S1` < `Y1S2` < … < `Y3S3`), which is
how "earlier than current" is decided. The current semester is excluded (it is
the main panel) and future ones are hidden.

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

## Keyboard support

- **Map search** behaves as an ARIA combobox: `↑`/`↓` move through matches and
  pan the map as you go, `Home`/`End` jump to either end, `Enter` commits and
  closes the list, `Esc` clears the search and the highlight.
- **Attendance tabs** follow the ARIA tabs pattern with a roving tabindex:
  `←`/`→` switch tab, `Home`/`End` jump to the first or last.

## Known gaps

- The grading scale jumps from C (50) straight to F, with no C-/D+/D bands.
  Verify it against your programme handbook before relying on it.
- No handling for semester rollover. `data.js` still describes exactly one
  semester per programme, so when you move to the next one its subjects have to
  be written in by hand — `university.json` has the codes, names and credits,
  but not the `weeklyHours` or assessment breakdown the other tools need.
- `map.html` sets `user-scalable=no` so pinch gestures drive the pan/zoom
  canvas rather than the browser. That trades away browser zoom for low-vision
  users; the PDF map is the fallback.
