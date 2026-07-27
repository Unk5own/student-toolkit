/* ==============================================================
   1. GLOBAL & THEME LOGIC
============================================================== */

// Single entry point. Each page is detected by an element only it has.
document.addEventListener('DOMContentLoaded', () => {
    syncThemeToggleLabel();
    renderCurrentDate();
    renderProfileBadge();
    renderGradingScaleTable();

    if (document.getElementById('programme-selector')) {
        initDashboardProfile();
    } else if (document.getElementById('course-list')) {
        initGPACalculator();
    } else if (document.getElementById('y2s3-container')) {
        initAttendanceTracker();
    } else if (document.getElementById('map-container')) {
        initMap();
    } else if (document.getElementById('marks-subject')) {
        initMarksTracker();
    } else if (document.getElementById('timetable-grid')) {
        initTimetable();
    }
});

// The theme is applied to <html> by a tiny inline script in each page's <head>
// so it lands before first paint. This only handles later toggles.
function toggleTheme() {
    const root = document.documentElement;
    const newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    syncThemeToggleLabel();
}

function syncThemeToggleLabel() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

// Escapes user-supplied text before it goes into innerHTML.
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderCurrentDate() {
    const dateSpan = document.getElementById('current-date');
    if (!dateSpan) return;
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateSpan.textContent = new Date().toLocaleDateString('en-MY', dateOptions);
}

/* ==============================================================
   MAP.html :D
============================================================== */

// Blocks SD, SE and SF were never given `-building` ids in the SVG; only their
// text labels are addressable. Searching them used to silently highlight
// nothing, so we target the label and style it differently.
const LABEL_ONLY_TARGETS = new Set(['SD', 'SE', 'SF']);

// The map SVG lives in its own file rather than inline in map.html: at ~6 MB
// it would otherwise block the whole page from painting while it parses.
async function initMap() {
    const mapContainer = document.getElementById('map-container');
    const status = document.getElementById('map-status');
    if (!mapContainer) return;

    const fail = message => {
        if (!status) return;
        status.innerHTML = `<span>${escapeHtml(message)}</span>
            <a href="TARUMT_KL_CAMPUS_MAP.pdf" target="_blank" rel="noopener noreferrer">Open the PDF map instead</a>`;
    };

    if (typeof panzoom !== 'function') {
        console.error('panzoom.min.js failed to load; map will not pan or zoom.');
        fail('Could not load the map controls.');
        return;
    }

    let mapElement;
    try {
        const response = await fetch('campus-map.svg');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const parsed = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
        if (parsed.querySelector('parsererror')) throw new Error('malformed SVG');

        mapElement = document.importNode(parsed.documentElement, true);
        mapContainer.insertBefore(mapElement, mapContainer.firstChild);
        if (status) status.remove();
    } catch (error) {
        console.error('Could not load campus-map.svg', error);
        fail('Could not load the campus map.');
        return;
    }

    setupMapInteraction(mapElement, mapContainer);
}

const MAP_BASE_WIDTH = 1496;
const MAP_BASE_HEIGHT = 963;

function setupMapInteraction(mapElement, mapContainer) {

    const myPanzoom = panzoom(mapElement, {
        maxZoom: 5,
        minZoom: 0.6,
        bounds: true,
        boundsPadding: 0.1,
        smoothScroll: false,
        zoomDoubleClickSpeed: 1,

        onTouch: function(e) {
            return false;
        }
    });

    // Scale the map down to fit the container and centre it. Used both on load
    // and by the recenter button, so the two can't drift apart.
    function fitToContainer() {
        // A hidden or not-yet-laid-out container reports 0, which would collapse
        // the map to scale 0 and leave it invisible. Fall back to 1:1.
        const width = mapContainer.clientWidth || MAP_BASE_WIDTH;
        const height = mapContainer.clientHeight || MAP_BASE_HEIGHT;

        const scale = Math.min(1, width / MAP_BASE_WIDTH);

        myPanzoom.moveTo(0, 0);
        myPanzoom.zoomAbs(0, 0, scale);
        myPanzoom.moveTo(
            (width - (MAP_BASE_WIDTH * scale)) / 2,
            (height - (MAP_BASE_HEIGHT * scale)) / 2
        );
    }

    fitToContainer();

    const recenterBtn = document.getElementById('recenter-map');
    if (recenterBtn) {
        recenterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            fitToContainer();
        });
    }

    // 2. The Campus Directory (Map search terms to your SVG IDs)
    const campusDirectory = {
        "library": "library-building",
        "sunnydae": "library-building",

        "citc": "citc-building",
        "fm cafe": "citc-building",
        
        "dtar": "dtar-building",
        "dewan tunku abdul rahman": "dtar-building",
        "hall": "dtar-building",
        "block t": "dtar-building",

        "se": "SE",

        "clubhouse": "clubhouse-building",
        "club house": "clubhouse-building",
        "heritage kitchen": "clubhouse-building",
        
        "sports complex": "block-ua-building",
        "block ua": "block-ua-building",

        "swimming pool": "swimming-pool",

        "taruc hostel": "taruc-hostel-building",
        "tarumt hostel": "taruc-hostel-building",

        "vtar institute": "vtar-building",
        
        "kindergarden": "tarumt-kindergarden",
        "taska & tadika cece": "tarumt-kindergarden",

        "red bricks canteen": "redbricks-building",
        "red bricks cafeteria": "redbricks-building",
        "redbricks": "redbricks-building",
        "red bricks": "redbricks-building",
        "rb": "redbricks-building",

        "yum yum canteen": "yumyum-building",
        "yumyum": "yumyum-building",
        "block l": "yumyum-building",
        "l": "yumyum-building",
        "dfm": "yumyum-building",

        "sc canteen": "block-sc-building",
        "casuarina cafe": "block-sc-building",

        "tarumt arena": "tarumt-arena",
        "ta": "tarumt-arena",
        "dos": "tarumt-arena",
        "cpe": "tarumt-arena",
        "cbeiv": "tarumt-arena",

        "block a": "block-a-building",
        "a": "block-a-building",
        "dsa": "block-a-building",
        "dar": "block-a-building",
        "deca": "block-a-building",
        "foas": "block-a-building",
        "focs": "block-a-building",

        
        "bangunan tun tan siew sin": "tun-tan-siew-sin-building",
        "dace": "tun-tan-siew-sin-building",
        "diso": "tun-tan-siew-sin-building",
        "dfin": "tun-tan-siew-sin-building",

        "block k": "block-k-building",
        "k": "block-k-building",
        
        "dk b": "dk-b-building",
        "dkb": "dk-b-building",

        "dk 2": "dk-2-building",
        "dk2": "dk-2-building",

        "dk 6": "dk-6-building",
        "dk6": "dk-6-building",

        "dk 7": "dk-7-building",
        "dk7": "dk-7-building",

        "dk 1": "dk-1-building",
        "dk1": "dk-1-building",

        "dk 4": "dk-4-building",
        "dk4": "dk-4-building",

        "dk 3": "dk-3-building",
        "dk3": "dk-3-building",

        "dk 5": "dk-5-building",
        "dk5": "dk-5-building",

        "dk 8": "dk-8-building",
        "dk8": "dk-8-building",

        "dk z": "dk-z-building",
        "dkz": "dk-z-building",

        "dk a": "dk-a-building",
        "dka": "dk-a-building",

        "dk w": "dk-w-building",
        "dkw": "dk-w-building",

        "dk x": "dk-x-building",
        "dkx": "dk-x-building",

        "dk y": "dk-y-building",
        "dky": "dk-y-building",

        "dk c": "dk-c-d-building",
        "dkc": "dk-c-d-building",

        "dk d": "dk-c-d-building",
        "dkd": "dk-c-d-building",

        "dk aba": "dk-aba-abb-building",
        "dkaba": "dk-aba-abb-building",

        "dk abb": "dk-aba-abb-building",
        "dkabb": "dk-aba-abb-building",

        "dk abc": "dk-abc-abd-building",
        "dkabc": "dk-abc-abd-building",

        "dk abd": "dk-abc-abd-building",
        "dkabd":  "dk-abc-abd-building",

        "dk abe": "dk-abe-abf-building",
        "dkabe": "dk-abe-abf-building",

        "dk abf": "dk-abe-abf-building",
        "dkabf":"dk-abe-abf-building",

        "sg": "block-sg-building",

        "sf": "SF",

        "sd": "SD",

        "sa": "block-sa-building",
        "fafb": "block-sa-building",

        "sb": "block-sb-building",
        "cpsr": "block-sb-building",

        "block s": "block-s-building",
        "s": "block-s-building",

        "fern house": "block-z-building",
        "block z": "block-z-building",
        "z": "block-z-building",

        "block y": "block-y-building",
        "y": "block-y-building",

        "block x": "block-x-building",
        "x": "block-x-building",

        "dk e": "dk-e-building",
        "dke": "dk-e-building",
        
        "block w": "block-w-building",
        "w": "block-w-building",
        
        "block v": "block-v-building",
        "v": "block-v-building",

        "block r": "block-r-building",
        "r": "block-r-building",

        "block q": "block-q-building",
        "q": "block-q-building",
        "fssh": "block-q-building",
        "fcci": "block-q-building",

        "block p": "block-p-building",
        "p": "block-p-building",

        "block n": "block-n-building",
        "n": "block-n-building",

        "block m": "block-m-building",
        "m": "block-m-building",
        "foet": "block-m-building",
        "fobe": "block-m-building",

        "block pa": "block-pa-building",
        "pa": "block-pa-building",

        "block c": "block-c-building",
        "c": "block-c-building",

        "block b": "block-b-building",
        "b": "block-b-building",

        "block h": "block-h-building",
        "h": "block-h-building",
        
        "block d": "block-d-building",
        "d": "block-d-building",

        "the rimba": "the-rimba",
        "rimba": "the-rimba",

    };

    // Human-readable label for each place, so search can list several matches
    // by name instead of silently jumping to whichever alias happened to be
    // first in the object above.
    const placeNames = {
        "library-building": "Library / Sunnydae",
        "citc-building": "CITC / FM Cafe",
        "dtar-building": "Dewan Tunku Abdul Rahman (Block T)",
        "SE": "Block SE",
        "SF": "Block SF",
        "SD": "Block SD",
        "clubhouse-building": "Club House / Heritage Kitchen",
        "block-ua-building": "Sports Complex (Block UA)",
        "swimming-pool": "Swimming Pool",
        "taruc-hostel-building": "TARUMT Hostel",
        "vtar-building": "VTAR Institute",
        "tarumt-kindergarden": "Taska & Tadika CECE",
        "redbricks-building": "Red Bricks Cafeteria",
        "yumyum-building": "Yum Yum Canteen (Block L)",
        "block-sc-building": "SC Canteen / Casuarina Cafe",
        "tarumt-arena": "TARUMT Arena (DOS, CPE, CBEIV)",
        "block-a-building": "Block A (DSA, DAR, DECA, FOAS, FOCS)",
        "tun-tan-siew-sin-building": "Bangunan Tun Tan Siew Sin (DACE, DISO, DFIN)",
        "block-k-building": "Block K",
        "block-sg-building": "Block SG",
        "block-sa-building": "Block SA (FAFB)",
        "block-sb-building": "Block SB (CPSR)",
        "block-s-building": "Block S",
        "block-z-building": "Block Z / Fern House",
        "block-y-building": "Block Y",
        "block-x-building": "Block X",
        "block-w-building": "Block W",
        "block-v-building": "Block V",
        "block-r-building": "Block R",
        "block-q-building": "Block Q (FSSH, FCCI)",
        "block-p-building": "Block P",
        "block-pa-building": "Block PA",
        "block-n-building": "Block N",
        "block-m-building": "Block M (FOET, FOBE)",
        "block-h-building": "Block H",
        "block-d-building": "Block D",
        "block-c-building": "Block C",
        "block-b-building": "Block B",
        "the-rimba": "The Rimba",
        "dk-1-building": "DK 1", "dk-2-building": "DK 2", "dk-3-building": "DK 3",
        "dk-4-building": "DK 4", "dk-5-building": "DK 5", "dk-6-building": "DK 6",
        "dk-7-building": "DK 7", "dk-8-building": "DK 8",
        "dk-a-building": "DK A", "dk-b-building": "DK B", "dk-e-building": "DK E",
        "dk-w-building": "DK W", "dk-x-building": "DK X", "dk-y-building": "DK Y",
        "dk-z-building": "DK Z",
        "dk-c-d-building": "DK C / DK D",
        "dk-aba-abb-building": "DK ABA / ABB",
        "dk-abc-abd-building": "DK ABC / ABD",
        "dk-abe-abf-building": "DK ABE / ABF"
    };

    const nameOf = id => placeNames[id] || id;

    // Ranked, de-duplicated matches: exact alias first, then prefix, then
    // substring. One result per place, however many aliases it matched.
    function searchPlaces(query) {
        const best = new Map();

        for (const [alias, id] of Object.entries(campusDirectory)) {
            let rank;
            if (alias === query) rank = 0;
            else if (alias.startsWith(query)) rank = 1;
            else if (alias.includes(query)) rank = 2;
            else continue;

            const current = best.get(id);
            if (!current || rank < current.rank) best.set(id, { id, rank, alias });
        }

        return [...best.values()].sort((a, b) =>
            a.rank - b.rank || nameOf(a.id).localeCompare(nameOf(b.id))
        );
    }

    // 3. The Search Logic
    const searchInput = document.getElementById('map-search');
    const resultsList = document.getElementById('map-results');

    function clearHighlights() {
        document.querySelectorAll('.building-highlight, .label-highlight').forEach(el => {
            el.classList.remove('building-highlight', 'label-highlight');
        });
    }

    function focusPlace(id) {
        const target = document.getElementById(id);
        if (!target) return;

        clearHighlights();
        target.classList.add(LABEL_ONLY_TARGETS.has(id) ? 'label-highlight' : 'building-highlight');

        const bbox = target.getBBox();
        const svgCenterX = bbox.x + (bbox.width / 2);
        const svgCenterY = bbox.y + (bbox.height / 2);

        const currentScale = myPanzoom.getTransform().scale;

        // Keep current zoom level, just recentre on the target.
        myPanzoom.smoothMoveTo(
            (mapContainer.clientWidth / 2) - (svgCenterX * currentScale),
            (mapContainer.clientHeight / 2) - (svgCenterY * currentScale)
        );
    }

    function renderResults(matches, query) {
        if (!resultsList) return;

        if (query.length === 0) {
            resultsList.innerHTML = '';
            resultsList.hidden = true;
            return;
        }

        resultsList.hidden = false;

        if (matches.length === 0) {
            resultsList.innerHTML = `<li class="map-result-empty">No place matches “${escapeHtml(query)}”.</li>`;
            return;
        }

        resultsList.innerHTML = matches.slice(0, 8).map((m, i) => `
            <li>
                <button type="button" data-place="${escapeHtml(m.id)}" class="map-result${i === 0 ? ' is-active' : ''}">
                    ${escapeHtml(nameOf(m.id))}
                </button>
            </li>
        `).join('');

        resultsList.querySelectorAll('[data-place]').forEach(btn => {
            btn.addEventListener('click', () => {
                focusPlace(btn.dataset.place);
                resultsList.querySelectorAll('.map-result').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
            });
        });
    }

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        clearHighlights();

        if (query.length < 1) {
            renderResults([], '');
            return;
        }

        const matches = searchPlaces(query);
        renderResults(matches, query);

        // Jump straight to the best match; the list is there to pick another.
        if (matches.length > 0) focusPlace(matches[0].id);
    });

    // 4. Emergency layer — assembly points are already in the SVG but were
    //    never reachable from the UI.
    const emergencyBtn = document.getElementById('toggle-emergency');
    if (emergencyBtn) {
        const points = mapElement.querySelectorAll('[id^="emergency assembly point"]');

        emergencyBtn.addEventListener('click', () => {
            const showing = mapElement.classList.toggle('show-emergency');
            points.forEach(p => p.classList.toggle('emergency-pulse', showing));
            emergencyBtn.setAttribute('aria-pressed', String(showing));
            emergencyBtn.classList.toggle('is-active', showing);
        });

        emergencyBtn.title = `Show ${points.length} emergency assembly points`;
    }
}


/* ==============================================================
   DASHBOARD INLINE PROFILE LOGIC
============================================================== */
// The semester is whatever curriculum data.js actually ships for the programme,
// so adding a programme or rolling over a semester needs no code change.
function semesterFor(programmeKey) {
    const programme = myDatabase.programmes[programmeKey];
    return programme ? Object.keys(programme.curriculum)[0] : null;
}

// Always returns a usable profile. A first-time visitor never had a `change`
// event on the programme dropdown, so without this the tools that require a
// profile would turn them away with nothing they could do about it.
window.getProfile = function() {
    if (typeof myDatabase === 'undefined') return null;

    let profile = null;
    try {
        profile = JSON.parse(localStorage.getItem('studentProfile'));
    } catch (e) {
        profile = null;
    }

    // Reject anything that no longer matches the current database.
    if (!profile || !myDatabase.programmes[profile.programme]) {
        profile = null;
    }

    if (!profile) {
        const firstProgramme = Object.keys(myDatabase.programmes)[0];
        profile = { programme: firstProgramme, semester: semesterFor(firstProgramme) };
        localStorage.setItem('studentProfile', JSON.stringify(profile));
    } else if (profile.semester !== semesterFor(profile.programme)) {
        // data.js moved on; follow it rather than reading a curriculum that is gone.
        profile.semester = semesterFor(profile.programme);
        localStorage.setItem('studentProfile', JSON.stringify(profile));
    }

    return profile;
};

window.initDashboardProfile = function() {
    if (typeof myDatabase === 'undefined') return;

    const profile = getProfile();
    const progSelector = document.getElementById('programme-selector');
    if (progSelector) progSelector.value = profile.programme;

    updateWelcomeMessage(profile.programme);
    renderDashboardSummary(profile);
};

/* At-a-glance figures on the dashboard, read from the same saved state the
   individual tools use. Tiles for data you haven't entered yet are hidden
   rather than shown as a meaningless zero. */
function renderDashboardSummary(profile) {
    const container = document.getElementById('dashboard-summary');
    if (!container) return;

    const courses = myDatabase.programmes[profile.programme].curriculum[profile.semester] || [];
    const tiles = [];

    // Lowest attendance across this semester's subjects.
    const attendance = loadAttendanceData();
    let worst = null;
    courses.forEach(course => {
        const record = attendance.semester[course.code];
        if (!record) return;

        const total = (course.weeklyHours || 3) * SEMESTER_WEEKS;
        if (total === 0) return;

        const pct = ((total - missedHours({ entries: migrateEntries(record) })) / total) * 100;
        if (!worst || pct < worst.pct) worst = { pct, code: course.code };
    });

    if (worst) {
        tiles.push({
            label: 'Lowest attendance',
            value: `${worst.pct.toFixed(1)}%`,
            note: worst.code,
            colour: worst.pct < ATTENDANCE_THRESHOLD * 100 ? 'var(--danger)' : 'var(--success)'
        });
    }

    // Semester GPA from saved grades.
    const state = loadGPAState();
    let qp = 0, credits = 0;
    courses.forEach(course => {
        const grade = state.grades[course.code];
        if (grade === undefined) return;
        qp += parseFloat(grade) * course.credits;
        credits += course.credits;
    });

    if (credits > 0) {
        tiles.push({
            label: 'Semester GPA',
            value: (qp / credits).toFixed(4),
            note: `${credits} of ${courses.reduce((s, c) => s + c.credits, 0)} credits graded`,
            colour: 'var(--primary)'
        });
    }

    // Next class today, if a timetable has been set up.
    const upcoming = nextClassToday();
    if (upcoming) {
        tiles.push({
            label: 'Next class today',
            value: upcoming.start,
            note: `${upcoming.code}${upcoming.venue ? ' · ' + upcoming.venue : ''}`,
            colour: 'var(--text-main)'
        });
    }

    if (tiles.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = tiles.map(t => `
        <div class="summary-tile">
            <span class="summary-label">${escapeHtml(t.label)}</span>
            <strong class="summary-value" style="color: ${t.colour};">${escapeHtml(t.value)}</strong>
            <span class="summary-note">${escapeHtml(t.note)}</span>
        </div>
    `).join('');
}

window.saveProfile = function() {
    const progSelector = document.getElementById('programme-selector');
    if (!progSelector.value || !myDatabase.programmes[progSelector.value]) return;

    const profile = {
        programme: progSelector.value,
        semester: semesterFor(progSelector.value)
    };
    localStorage.setItem('studentProfile', JSON.stringify(profile));

    // Re-render in place instead of reloading the page.
    updateWelcomeMessage(profile.programme);
};

window.updateWelcomeMessage = function(programmeKey) {
    const programme = myDatabase.programmes[programmeKey];
    if (!programme) return;

    const headerTitle = document.querySelector('.welcome-banner h1');
    const headerSub = document.querySelector('header .subtitle');
    if (headerTitle) headerTitle.textContent = '👋 Welcome back!';
    if (headerSub) {
        headerSub.innerHTML =
            `<strong>${escapeHtml(programme.title)}</strong> • <span id="current-date"></span>`;
        renderCurrentDate();
    }
};


/* ==============================================================
   GPA / CGPA CALCULATOR LOGIC
============================================================== */
let universityData = null;
let currentProgramme = null;
let activeSemester = null;
let currentTermQP = 0;
let currentTermCredits = 0;

window.initGPACalculator = function() {
    if (typeof myDatabase === 'undefined') {
        document.getElementById('course-list').innerHTML = "<p style='color: var(--danger);'>Error loading data.js</p>";
        return;
    }

    const profile = getProfile();
    currentProgramme = profile.programme;
    activeSemester = profile.semester;

    universityData = myDatabase;
    loadTermSubjects();
}

window.loadTermSubjects = function() {
    if (!universityData) return;

    const courseListContainer = document.getElementById('course-list');
    courseListContainer.innerHTML = ''; 

    const programmeData = universityData.programmes[currentProgramme];
    const courses = programmeData.curriculum[activeSemester];

    if (!courses || courses.length === 0) {
        courseListContainer.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 20px;">No courses found.</p>`;
        document.getElementById('gpa-score').textContent = "0.0000";
        calculateCGPA();
        return;
    }

    courses.forEach((course) => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.padding = '15px 0';
        row.style.borderBottom = '1px solid var(--border)';

        row.innerHTML = `
            <div style="flex: 1; padding-right: 15px;">
                <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: bold;">${course.code}</div>
                <div style="font-weight: 600; color: var(--text-main); margin: 4px 0;">${course.name}</div>
                <div style="font-size: 0.85rem; color: var(--primary); font-weight: bold;">${course.credits} Credits</div>
            </div>
            <select class="styled-select grade-select" data-code="${escapeHtml(course.code)}" data-credits="${course.credits}" onchange="calculateGPA()" aria-label="Grade for ${escapeHtml(course.name)}">
                <option value="" selected disabled>Grade</option>
                ${gradingScale.map(g =>
                    `<option value="${g.point.toFixed(2)}">${g.grade} (${g.point.toFixed(2)})</option>`
                ).join('')}
            </select>
        `;
        courseListContainer.appendChild(row);
    });

    restoreGPAInputs();
    calculateGPA();
}

/* Grades used to be lost on every reload. They are saved per subject code so
   the dashboard can show your current GPA too. */
function loadGPAState() {
    try {
        const stored = JSON.parse(localStorage.getItem('gpaState'));
        if (stored && typeof stored === 'object') {
            return { grades: stored.grades || {}, prevCgpa: stored.prevCgpa || '', prevCredits: stored.prevCredits || '' };
        }
    } catch (e) { /* fall through to a clean slate */ }
    return { grades: {}, prevCgpa: '', prevCredits: '' };
}

function saveGPAState() {
    const grades = {};
    document.querySelectorAll('.grade-select').forEach(select => {
        if (select.value !== '') grades[select.dataset.code] = select.value;
    });

    localStorage.setItem('gpaState', JSON.stringify({
        grades,
        prevCgpa: document.getElementById('prev-cgpa').value,
        prevCredits: document.getElementById('prev-credits').value
    }));
}

function restoreGPAInputs() {
    const state = loadGPAState();
    document.querySelectorAll('.grade-select').forEach(select => {
        const saved = state.grades[select.dataset.code];
        if (saved !== undefined) select.value = saved;
    });
    document.getElementById('prev-cgpa').value = state.prevCgpa;
    document.getElementById('prev-credits').value = state.prevCredits;
}

window.calculateGPA = function() {
    const gradeSelects = document.querySelectorAll('.grade-select');
    currentTermQP = 0;
    currentTermCredits = 0;

    gradeSelects.forEach(select => {
        if (select.value !== "") {
            const gradePoint = parseFloat(select.value);
            const credits = parseInt(select.getAttribute('data-credits'));
            currentTermQP += (gradePoint * credits);
            currentTermCredits += credits;
        }
    });

    const gpaScoreElement = document.getElementById('gpa-score');
    if (currentTermCredits > 0) {
        gpaScoreElement.textContent = (currentTermQP / currentTermCredits).toFixed(4);
    } else {
        gpaScoreElement.textContent = "0.0000";
    }
    saveGPAState();
    calculateCGPA();
}

window.calculateCGPA = function() {
    const prevCgpa = parseFloat(document.getElementById('prev-cgpa').value) || 0;
    const prevCredits = parseInt(document.getElementById('prev-credits').value) || 0;
    const cgpaScoreElement = document.getElementById('cgpa-score');

    const totalQP = (prevCgpa * prevCredits) + currentTermQP;
    const totalCredits = prevCredits + currentTermCredits;

    if (totalCredits > 0) {
        cgpaScoreElement.textContent = (totalQP / totalCredits).toFixed(4);
    } else {
        cgpaScoreElement.textContent = "0.0000";
    }
    saveGPAState();
}

window.resetAll = function() {
    if(confirm("Are you sure you want to clear all inputs?")) {
        document.querySelectorAll('.grade-select').forEach(select => select.value = "");
        document.getElementById('prev-cgpa').value = "";
        document.getElementById('prev-credits').value = "";
        localStorage.removeItem('gpaState');
        calculateGPA();
    }
}

/* ==============================================================
   ATTENDANCE TRACKER LOGIC (HOURS-BASED, LOCKED TIMETABLE)
============================================================== */
const SEMESTER_WEEKS = 14;
const ATTENDANCE_THRESHOLD = 0.8; // must attend at least 80% of timetabled hours

let attendanceData = loadAttendanceData();
let currentSemesterCourses = [];

function loadAttendanceData() {
    try {
        const stored = JSON.parse(localStorage.getItem('attendanceRecord'));
        if (stored && typeof stored === 'object') {
            return { semester: stored.semester || {}, custom: stored.custom || [] };
        }
    } catch (e) {
        console.warn('Discarding unreadable attendance record', e);
    }
    return { semester: {}, custom: [] };
}

/* Absences are stored as dated entries rather than one running counter, so you
   can see when you slipped and undo a single mistake. `hoursMissed` from the
   old format is migrated into one undated entry so nobody loses their count. */
function migrateEntries(record) {
    if (!record) return [];
    if (Array.isArray(record.entries)) return record.entries;

    if (Number.isFinite(record.hoursMissed) && record.hoursMissed > 0) {
        return [{ date: null, hours: record.hoursMissed }];
    }
    return [];
}

function missedHours(record) {
    if (!record || !Array.isArray(record.entries)) return 0;
    return record.entries.reduce((sum, e) => sum + (Number(e.hours) || 0), 0);
}

function formatEntryDate(date) {
    if (!date) return 'Earlier this semester';
    const parsed = new Date(date + 'T00:00:00');
    if (isNaN(parsed)) return 'Unknown date';
    return parsed.toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short' });
}

function todayISO() {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}

function attendanceRecordFor(type, code, customIndex) {
    return type === 'semester'
        ? attendanceData.semester[code]
        : attendanceData.custom[customIndex];
}

window.initAttendanceTracker = function() {
    const semContainer = document.getElementById('y2s3-container');
    if (!semContainer || typeof myDatabase === 'undefined') return;

    const profile = getProfile();

    const tabBtn = document.getElementById('tab-y2s3');
    if (tabBtn) tabBtn.textContent = `${profile.semester} Subjects`;

    currentSemesterCourses = myDatabase.programmes[profile.programme].curriculum[profile.semester];

    if (!currentSemesterCourses || currentSemesterCourses.length === 0) {
        semContainer.innerHTML = "<p>No subjects found for this semester.</p>";
        renderCustomAttendance();
        return;
    }

    renderSemesterAttendance();
    renderCustomAttendance();
}

window.renderSemesterAttendance = function() {
    const container = document.getElementById('y2s3-container');
    container.innerHTML = '';

    currentSemesterCourses.forEach(course => {
        const existing = attendanceData.semester[course.code];

        // data.js is the source of truth for weeklyHours: re-read it on every
        // render so editing the timetable takes effect for existing users too.
        // Only the absence entries belong to the student, so those carry over.
        attendanceData.semester[course.code] = {
            weeklyHours: course.weeklyHours || 3,
            entries: migrateEntries(existing)
        };

        const record = attendanceData.semester[course.code];
        container.appendChild(createAttendanceCard(course.code, course.name, record, 'semester'));
    });

    // Save the corrected structure immediately
    saveAttendance();
}

window.renderCustomAttendance = function() {
    const container = document.getElementById('custom-container');
    container.innerHTML = `
        <div style="margin-bottom: 20px; text-align: right;">
            <button id="add-custom-subject" class="btn-primary" style="width: auto; padding: 10px 15px; border-radius: 8px; margin-top: 0;">
                + Add Custom Subject
            </button>
        </div>
    `;
    container.querySelector('#add-custom-subject').addEventListener('click', addCustomSubject);

    if (attendanceData.custom.length === 0) {
        const empty = document.createElement('p');
        empty.style.cssText = 'text-align: center; color: var(--text-muted);';
        empty.textContent = 'No custom subjects added yet.';
        container.appendChild(empty);
        return;
    }

    attendanceData.custom.forEach((course, index) => {
        if (course.weeklyHours === undefined) {
            course.weeklyHours = 3;
            course.totalWeeks = SEMESTER_WEEKS;
        }
        course.entries = migrateEntries(course);
        delete course.hoursMissed;
        container.appendChild(createAttendanceCard(course.code, course.name, course, 'custom', index));
    });
}

window.createAttendanceCard = function(code, name, record, type, customIndex = null) {
    const card = document.createElement('div');
    card.className = 'card-section';
    card.style.marginBottom = '20px';

    // Core Math: Strictly uses your timetable data
    const totalWeeksForMath = type === 'custom' ? (record.totalWeeks || SEMESTER_WEEKS) : SEMESTER_WEEKS;
    const totalHoursForSemester = record.weeklyHours * totalWeeksForMath;
    const hoursMissed = missedHours(record);
    const attendedHours = totalHoursForSemester - hoursMissed;
    const percentage = totalHoursForSemester === 0 ? 100 : ((attendedHours / totalHoursForSemester) * 100).toFixed(1);

    const isDanger = percentage < ATTENDANCE_THRESHOLD * 100;
    const statusColor = isDanger ? 'var(--danger)' : 'var(--success)';

    // Math for Safe Skips (20% rule)
    const maxMissesAllowed = Math.floor(totalHoursForSemester * (1 - ATTENDANCE_THRESHOLD));
    const safeHoursLeft = maxMissesAllowed - hoursMissed;

    let skipMessage = "";
    if (safeHoursLeft > 0) {
        skipMessage = `You can safely miss <strong>${safeHoursLeft}</strong> more hour${safeHoursLeft !== 1 ? 's' : ''} of class.`;
    } else if (safeHoursLeft === 0) {
        skipMessage = `<span style="color: var(--text-main);"><strong>0</strong> safe hours left. Do not miss any more!</span>`;
    } else {
        skipMessage = `<span style="color: var(--danger);"><strong>WARNING:</strong> You have exceeded the 20% limit by ${Math.abs(safeHoursLeft)} hour${Math.abs(safeHoursLeft) !== 1 ? 's' : ''}!</span>`;
    }

    // Super clean UI: NO "Total Classes" buttons. ONLY "Hours Missed".
    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border); padding-bottom: 15px; margin-bottom: 15px;">
            <div>
                <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: bold;">${escapeHtml(code)}</span>
                <h3 style="margin: 5px 0 0 0; color: var(--text-main); font-size: 1.1rem;">${escapeHtml(name)}</h3>
            </div>
            <div style="text-align: right;">
                <h2 style="margin: 0; color: ${statusColor}; font-size: 1.8rem;">${percentage}%</h2>
            </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
            <div>
                <div style="font-size: 0.95rem; color: var(--danger); font-weight: bold;">Hours Missed</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">(e.g. +2 for skipping a 2hr lecture)</div>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <button data-step="-1" aria-label="Remove one missed hour from ${escapeHtml(name)}" style="width: 35px; height: 35px; border-radius: 50%; border: 1px solid var(--danger); background: var(--input-bg); color: var(--danger); cursor: pointer; font-size: 1.2rem; font-weight: bold;">-</button>
                <span style="font-size: 1.5rem; font-weight: bold; color: var(--danger); width: 30px; text-align: center;">${hoursMissed}</span>
                <button data-step="1" aria-label="Add one missed hour to ${escapeHtml(name)}" style="width: 35px; height: 35px; border-radius: 50%; border: none; background: var(--danger); color: white; cursor: pointer; font-size: 1.2rem; font-weight: bold;">+</button>
            </div>
        </div>

        <div style="background: var(--bg-color); padding: 12px; border-radius: 8px; font-size: 0.9rem; color: var(--text-muted); text-align: center;">
            ${skipMessage}
        </div>

        ${record.entries.length > 0 ? `
        <details class="attendance-history">
            <summary>${record.entries.length} absence${record.entries.length !== 1 ? 's' : ''} logged</summary>
            <ul>
                ${record.entries.map((entry, i) => `
                    <li>
                        <span>${escapeHtml(formatEntryDate(entry.date))}</span>
                        <span class="history-hours">${entry.hours}h</span>
                        <button type="button" data-entry="${i}" class="btn-delete tt-mini" aria-label="Undo this absence">Undo</button>
                    </li>
                `).join('')}
            </ul>
        </details>` : ''}

        ${type === 'custom' ? `<button data-remove="1" class="btn-delete" style="width: 100%; margin-top: 15px; padding: 10px; border-radius: 8px;">Remove Subject</button>` : ''}
    `;

    // Wired as listeners, not inline onclick strings: a subject code or name
    // containing a quote used to break out of the attribute and kill the card.
    card.querySelectorAll('[data-step]').forEach(btn => {
        btn.addEventListener('click', () => {
            updateAttendance(type, code, Number(btn.dataset.step), customIndex);
        });
    });

    card.querySelectorAll('[data-entry]').forEach(btn => {
        btn.addEventListener('click', () => {
            undoAbsence(type, code, Number(btn.dataset.entry), customIndex);
        });
    });

    const removeBtn = card.querySelector('[data-remove]');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => deleteCustomSubject(customIndex));
    }

    return card;
}

window.updateAttendance = function(type, code, change, customIndex) {
    const record = attendanceRecordFor(type, code, customIndex);
    if (!record) return;

    const totalWeeks = type === 'custom' ? (record.totalWeeks || SEMESTER_WEEKS) : SEMESTER_WEEKS;
    const maxHours = record.weeklyHours * totalWeeks;

    if (change > 0) {
        if (missedHours(record) + change > maxHours) return;
        record.entries.push({ date: todayISO(), hours: change });
    } else {
        // Take the hour back off the most recent absence, dropping the entry
        // entirely once it reaches zero.
        const last = record.entries[record.entries.length - 1];
        if (!last) return;
        last.hours += change;
        if (last.hours <= 0) record.entries.pop();
    }

    saveAttendance();

    if (type === 'semester') renderSemesterAttendance();
    else renderCustomAttendance();
}

window.undoAbsence = function(type, code, entryIndex, customIndex) {
    const record = attendanceRecordFor(type, code, customIndex);
    if (!record || !record.entries[entryIndex]) return;

    record.entries.splice(entryIndex, 1);
    saveAttendance();

    if (type === 'semester') renderSemesterAttendance();
    else renderCustomAttendance();
}

window.addCustomSubject = function() {
    const code = prompt("Enter Subject Code (e.g., EGU2):");
    if (!code) return;
    const name = prompt("Enter Subject Name (e.g., Bahasa Kebangsaan A):");
    if (!name) return;

    const lec = parseFloat(prompt("Enter LECTURE hours per week (Enter 0 if none):")) || 0;
    const tut = parseFloat(prompt("Enter TUTORIAL hours per week (Enter 0 if none):")) || 0;
    const prac = parseFloat(prompt("Enter PRACTICAL hours per week (Enter 0 if none):")) || 0;
    const weeks = parseInt(prompt("Enter Total Weeks for this class (Usually 14):")) || 14;

    const totalWeekly = lec + tut + prac;

    if (totalWeekly <= 0) {
        alert("Error: Total weekly hours cannot be 0. Subject not added.");
        return;
    }

    attendanceData.custom.push({ 
        code: code.toUpperCase(), 
        name: name.toUpperCase(), 
        lecture: lec,
        tutorial: tut,
        practical: prac,
        weeklyHours: totalWeekly,
        totalWeeks: weeks,
        entries: []
    });
    
    saveAttendance();
    renderCustomAttendance();
}

window.deleteCustomSubject = function(index) {
    if (confirm("Remove this custom subject?")) {
        attendanceData.custom.splice(index, 1);
        saveAttendance();
        renderCustomAttendance();
    }
}

window.saveAttendance = function() {
    localStorage.setItem('attendanceRecord', JSON.stringify(attendanceData));
}

window.resetAttendance = function() {
    if(confirm("🚨 WARNING: This will reset ALL your missed hours back to 0. Are you sure?")) {
        for (let key in attendanceData.semester) {
            attendanceData.semester[key].entries = [];
        }
        attendanceData.custom.forEach(course => course.entries = []);
        
        saveAttendance();
        renderSemesterAttendance();
        renderCustomAttendance();
    }
}

window.switchTab = function(tabName) {
    const y2s3Tab = document.getElementById('tab-y2s3');
    const customTab = document.getElementById('tab-custom');
    const semContainer = document.getElementById('y2s3-container');
    const customContainer = document.getElementById('custom-container');

    if (tabName === 'y2s3') {
        y2s3Tab.style.color = 'var(--danger)';
        y2s3Tab.style.borderBottomColor = 'var(--danger)';
        customTab.style.color = 'var(--text-muted)';
        customTab.style.borderBottomColor = 'transparent';
        
        semContainer.style.display = 'block';
        customContainer.style.display = 'none';
    } else {
        customTab.style.color = 'var(--danger)';
        customTab.style.borderBottomColor = 'var(--danger)';
        y2s3Tab.style.color = 'var(--text-muted)';
        y2s3Tab.style.borderBottomColor = 'transparent';
        
        semContainer.style.display = 'none';
        customContainer.style.display = 'block';
    }
}


/* ==============================================================
   ADVANCED TARGET MARKS CALCULATOR LOGIC (AUTO-RATIO & FULL GRADES)
============================================================== */

// Assessment breakdowns now live alongside the courses in data.js. This is a
// flat code -> course lookup over every programme, built on first use.
let courseIndex = null;

function getCourse(code) {
    if (typeof myDatabase === 'undefined') return null;

    if (!courseIndex) {
        courseIndex = {};
        Object.values(myDatabase.programmes).forEach(programme => {
            Object.values(programme.curriculum).forEach(courses => {
                courses.forEach(course => {
                    courseIndex[course.code.toUpperCase()] = course;
                    validateAssessment(course);
                });
            });
        });
    }

    return courseIndex[String(code).toUpperCase()] || null;
}

function getAssessment(code) {
    const course = getCourse(code);
    return course ? course.assessment : null;
}

// Catches a mistyped weight in data.js immediately instead of silently
// producing targets that can never add up to 100%.
function validateAssessment(course) {
    const a = course.assessment;
    if (!a) {
        console.warn(`${course.code}: no assessment breakdown defined`);
        return;
    }
    const total = a.final + a.components.reduce((sum, c) => sum + c.weight, 0);
    if (Math.abs(total - 100) > 0.01) {
        console.warn(`${course.code}: assessment weights total ${total}%, expected 100%`);
    }
}

// Passing grades only — "what do I need for an F" is not a useful target.
const passingGrades = () => gradingScale.filter(g => g.point > 0);

// Renders the grading-scale reference table shared by marks.html and
// calculator.html, so the two can never drift from data.js or each other.
function renderGradingScaleTable() {
    document.querySelectorAll('[data-grading-scale]').forEach(table => {
        table.innerHTML = `
            <thead>
                <tr><th>Grade</th><th>Marks (%)</th><th>Grade Point</th></tr>
            </thead>
            <tbody>
                ${gradingScale.map(g => {
                    const colour = g.point === 0 ? 'var(--danger)' : 'var(--text-main)';
                    return `<tr>
                        <td><strong style="color: ${colour};">${g.grade}</strong></td>
                        <td>${g.min} - ${g.max}</td>
                        <td>${g.point.toFixed(2)}</td>
                    </tr>`;
                }).join('')}
            </tbody>
        `;
    });
}

window.initMarksTracker = function() {
    if (typeof myDatabase === 'undefined') return;

    const profile = getProfile();
    const courses = myDatabase.programmes[profile.programme].curriculum[profile.semester];
    const subjectSelect = document.getElementById('marks-subject');
    if (!subjectSelect || !courses) return;

    subjectSelect.innerHTML = '<option value="">-- Choose Subject --</option>';

    courses.forEach(course => {
        // Subjects flagged targetMarks: false in data.js (Gym, Pickleball) and
        // anything lacking a breakdown are skipped rather than crashing later.
        if (course.targetMarks === false || !course.assessment) return;

        const option = document.createElement('option');
        option.value = course.code.toUpperCase();
        option.textContent = `${course.code}  ${course.name}`;
        subjectSelect.appendChild(option);
    });
}

window.renderInterface = function() {
    const subjCode = document.getElementById('marks-subject').value;
    let mode = document.getElementById('calc-mode').value;
    const modeSelect = document.getElementById('calc-mode');
    const inputContainer = document.getElementById('dynamic-input-container');
    const resultSection = document.getElementById('marks-result-section');

    if (!subjCode) {
        inputContainer.innerHTML = '';
        resultSection.style.display = 'none';
        return;
    }

    const data = getAssessment(subjCode);
    if (!data) {
        inputContainer.innerHTML = '';
        resultSection.style.display = 'none';
        return;
    }

    // Safety check for 100% Coursework Subjects
    if (data.final === 0) {
        modeSelect.value = 'mode-reverse';
        modeSelect.options[0].disabled = true; // Disable "predict final exam"
        mode = 'mode-reverse';
    } else {
        modeSelect.options[0].disabled = false;
    }

    let html = '';

    if (mode === 'mode-final') {
        html += `<h4 style="margin: 0 0 15px 0; color: var(--primary);">Enter Known Coursework Scores</h4>`;
        data.components.forEach(comp => { html += createRatioInput(comp.id, comp.name, comp.weight); });
    } else if (mode === 'mode-reverse') {
        html += `
            <div style="margin-bottom: 20px;">
                <label style="font-weight: bold; color: var(--primary); display: block; margin-bottom: 8px;">Find missing score for:</label>
                <select id="find-target" class="styled-select" onchange="renderInterfaceReverseInputs()">
                    ${data.components.map(c => `<option value="${c.id}">${escapeHtml(c.name)} (Worth ${c.weight}%)</option>`).join('')}
                    ${data.final > 0 ? `<option value="final">Final Exam (Worth ${data.final}%)</option>` : ''}
                </select>
            </div>
            <div id="reverse-inputs"></div>
        `;
    }

    inputContainer.innerHTML = html;
    resultSection.style.display = 'block';

    if (mode === 'mode-reverse') renderInterfaceReverseInputs();
    else calculateDynamic();
}

/* Scores you have already typed, kept per subject + component so the page
   isn't blank every time you come back to it. */
function loadMarksScores() {
    try {
        const stored = JSON.parse(localStorage.getItem('marksScores'));
        if (stored && typeof stored === 'object') return stored;
    } catch (e) { /* fall through */ }
    return {};
}

window.saveMarksScores = function() {
    const subjCode = document.getElementById('marks-subject').value;
    if (!subjCode) return;

    const all = loadMarksScores();
    const forSubject = {};

    document.querySelectorAll('[data-component]').forEach(input => {
        const comp = input.dataset.component;
        const field = input.dataset.field;
        if (input.value === '') return;
        forSubject[comp] = forSubject[comp] || {};
        forSubject[comp][field] = input.value;
    });

    all[subjCode] = forSubject;
    localStorage.setItem('marksScores', JSON.stringify(all));
};

window.createRatioInput = function(id, name, weight) {
    const subjCode = document.getElementById('marks-subject').value;
    const saved = (loadMarksScores()[subjCode] || {})[id] || {};
    const score = saved.score !== undefined ? escapeHtml(saved.score) : '';
    const outof = saved.outof !== undefined ? escapeHtml(saved.outof) : weight;

    return `
        <div style="margin-bottom: 15px; background: var(--bg-color); padding: 15px; border-radius: 8px; border: 1px solid var(--border);">
            <label for="score-${id}" style="font-size: 0.95rem; font-weight: bold; color: var(--text-main); display: block; margin-bottom: 10px;">
                ${escapeHtml(name)} <span style="color: var(--primary); font-size: 0.8rem; font-weight: normal; margin-left: 5px;">(Worth ${weight}% of total grade)</span>
            </label>
            <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 10px; align-items: center;">
                <input type="number" id="score-${id}" value="${score}" data-component="${id}" data-field="score" placeholder="Your Score" oninput="calculateDynamic()" class="styled-select" style="text-align: center;" aria-label="${escapeHtml(name)} score">
                <span style="color: var(--text-muted); font-weight: bold;">/</span>
                <input type="number" id="outof-${id}" value="${outof}" data-component="${id}" data-field="outof" placeholder="Max" oninput="calculateDynamic()" class="styled-select" style="text-align: center;" aria-label="${escapeHtml(name)} maximum">
            </div>
        </div>
    `;
}

window.renderInterfaceReverseInputs = function() {
    const subjCode = document.getElementById('marks-subject').value;
    const data = getAssessment(subjCode);
    const findTargetId = document.getElementById('find-target').value;
    const container = document.getElementById('reverse-inputs');

    let html = `<h4 style="margin: 0 0 15px 0; color: var(--primary);">Enter Known Scores</h4>`;

    if (findTargetId !== 'final' && data.final > 0) {
        html += createRatioInput('final', 'Final Exam', data.final);
    }

    data.components.forEach(comp => {
        if (comp.id !== findTargetId) {
            html += createRatioInput(comp.id, comp.name, comp.weight);
        }
    });

    container.innerHTML = html;
    calculateDynamic();
}

window.calculateDynamic = function() {
    const subjCode = document.getElementById('marks-subject').value;
    const mode = document.getElementById('calc-mode').value;
    const data = getAssessment(subjCode);
    const resultContainer = document.getElementById('dynamic-result-container');
    if (!data) return;

    saveMarksScores();

    let currentTotalWeightage = 0;
    let isMissingInputs = false;
    let targetComponentWeight = 0;
    let targetComponentName = "";

    if (mode === 'mode-final') {
        targetComponentWeight = data.final;
        targetComponentName = "Final Exam";

        data.components.forEach(comp => {
            const score = parseFloat(document.getElementById(`score-${comp.id}`).value);
            const outof = parseFloat(document.getElementById(`outof-${comp.id}`).value);
            if (isNaN(score) || isNaN(outof) || outof === 0) isMissingInputs = true;
            else currentTotalWeightage += (score / outof) * comp.weight;
        });
    } else if (mode === 'mode-reverse') {
        const findTargetId = document.getElementById('find-target').value;

        if (findTargetId === 'final') {
            targetComponentWeight = data.final;
            targetComponentName = "Final Exam";
        } else {
            const targetComp = data.components.find(c => c.id === findTargetId);
            targetComponentWeight = targetComp.weight;
            targetComponentName = targetComp.name;
        }

        if (findTargetId !== 'final' && data.final > 0) {
            const finalScore = parseFloat(document.getElementById(`score-final`).value);
            const finalOutof = parseFloat(document.getElementById(`outof-final`).value);
            if (isNaN(finalScore) || isNaN(finalOutof) || finalOutof === 0) isMissingInputs = true;
            else currentTotalWeightage += (finalScore / finalOutof) * data.final;
        }

        data.components.forEach(comp => {
            if (comp.id !== findTargetId) {
                const score = parseFloat(document.getElementById(`score-${comp.id}`).value);
                const outof = parseFloat(document.getElementById(`outof-${comp.id}`).value);
                if (isNaN(score) || isNaN(outof) || outof === 0) isMissingInputs = true;
                else currentTotalWeightage += (score / outof) * comp.weight;
            }
        });
    }

    if (isMissingInputs) {
        resultContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px; border: 1px dashed var(--border); border-radius: 8px;">Fill out all your known scores above to reveal your required targets.</div>`;
        return;
    }

    let tableHtml = `
        <h4 style="margin: 0 0 10px 0; color: var(--text-main); text-align: center;">Required <span style="color: var(--primary);">${targetComponentName}</span> Score</h4>
        <div style="background: var(--bg-color); border: 1px solid var(--border); border-radius: 8px; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; padding: 10px 15px; background: var(--input-bg); font-weight: bold; border-bottom: 1px solid var(--border);">
                <span style="color: var(--text-muted);">Desired Grade</span>
                <span style="color: var(--text-muted);">Required Score on Paper</span>
            </div>
    `;

    passingGrades().forEach(grade => {
        const marksNeededToHitGrade = grade.min - currentTotalWeightage;
        const percentageNeededOnPaper = (marksNeededToHitGrade / targetComponentWeight) * 100;
        
        let displayScore = "";
        let rowColor = "var(--text-main)";

        if (percentageNeededOnPaper > 100) {
            displayScore = "Impossible";
            rowColor = "var(--danger)";
        } else if (percentageNeededOnPaper <= 0) {
            displayScore = "Secured!";
            rowColor = "var(--success)";
        } else {
            displayScore = `${percentageNeededOnPaper.toFixed(1)}%`;
            rowColor = "var(--primary)";
        }

        tableHtml += `
            <div style="display: flex; justify-content: space-between; padding: 12px 15px; border-bottom: 1px solid var(--border);">
                <span style="font-weight: bold; color: var(--text-main); font-size: 1.1rem;">${grade.grade} <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: normal;">(&ge; ${grade.min})</span></span>
                <span style="font-weight: bold; color: ${rowColor}; font-size: 1.1rem;">${displayScore}</span>
            </div>
        `;
    });

    tableHtml += `</div>`;
    resultContainer.innerHTML = tableHtml;
}


// ==========================================
// 1. PWA SERVICE WORKER REGISTRATION
// ==========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('PWA Registered!', reg.scope))
      .catch(err => console.log('PWA Failed!', err));
  });
}


/* ==============================================================
   TIMETABLE
   --------------------------------------------------------------
   Class times are personal (they vary by tutorial group), so unlike
   the curriculum they live in localStorage rather than data.js.
   Stored as: { id, code, type, day, start, end, venue }
   `day` follows Date.getDay(): 0 = Sunday ... 6 = Saturday.
============================================================== */
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// Teaching week order — Monday first, Sunday last.
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function loadTimetable() {
    try {
        const stored = JSON.parse(localStorage.getItem('timetable'));
        if (Array.isArray(stored)) return stored;
    } catch (e) { /* fall through */ }
    return [];
}

function saveTimetable(entries) {
    localStorage.setItem('timetable', JSON.stringify(entries));
}

function minutesOf(time) {
    const [h, m] = String(time).split(':').map(Number);
    return (h * 60) + (m || 0);
}

function formatTime(time) {
    const [h, m] = String(time).split(':').map(Number);
    const suffix = h < 12 ? 'am' : 'pm';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m || 0).padStart(2, '0')}${suffix}`;
}

// Duration in hours, used when marking a class as missed.
function durationHours(entry) {
    return Math.max(0, (minutesOf(entry.end) - minutesOf(entry.start)) / 60);
}

function nextClassToday() {
    const now = new Date();
    const nowMinutes = (now.getHours() * 60) + now.getMinutes();

    return loadTimetable()
        .filter(e => e.day === now.getDay() && minutesOf(e.start) >= nowMinutes)
        .sort((a, b) => minutesOf(a.start) - minutesOf(b.start))
        .map(e => ({ ...e, start: formatTime(e.start) }))[0] || null;
}

window.initTimetable = function() {
    if (typeof myDatabase === 'undefined') return;

    const profile = getProfile();
    const courses = myDatabase.programmes[profile.programme].curriculum[profile.semester] || [];

    const subjectSelect = document.getElementById('tt-subject');
    subjectSelect.innerHTML = courses
        .map(c => `<option value="${escapeHtml(c.code)}">${escapeHtml(c.code)} — ${escapeHtml(c.name)}</option>`)
        .join('');

    const daySelect = document.getElementById('tt-day');
    daySelect.innerHTML = DAY_ORDER
        .map(d => `<option value="${d}">${DAY_NAMES[d]}</option>`)
        .join('');

    document.getElementById('tt-form').addEventListener('submit', addTimetableEntry);
    renderTimetable();
};

function addTimetableEntry(event) {
    event.preventDefault();

    const start = document.getElementById('tt-start').value;
    const end = document.getElementById('tt-end').value;
    const status = document.getElementById('tt-status');

    if (minutesOf(end) <= minutesOf(start)) {
        status.textContent = 'End time must be after the start time.';
        status.style.color = 'var(--danger)';
        return;
    }

    const entries = loadTimetable();
    entries.push({
        id: `tt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        code: document.getElementById('tt-subject').value,
        type: document.getElementById('tt-type').value,
        day: Number(document.getElementById('tt-day').value),
        start,
        end,
        venue: document.getElementById('tt-venue').value.trim()
    });

    saveTimetable(entries);
    status.textContent = 'Class added.';
    status.style.color = 'var(--success)';
    document.getElementById('tt-venue').value = '';
    renderTimetable();
}

window.deleteTimetableEntry = function(id) {
    const entries = loadTimetable().filter(e => e.id !== id);
    saveTimetable(entries);
    renderTimetable();
};

// Records the class's full duration against the attendance tracker, so you
// don't have to work out "how many hours was that lecture" by hand.
window.markClassMissed = function(id) {
    const entry = loadTimetable().find(e => e.id === id);
    if (!entry) return;

    const hours = durationHours(entry);
    if (!confirm(`Add ${hours} hour${hours !== 1 ? 's' : ''} of missed class to ${entry.code}?`)) return;

    const data = loadAttendanceData();
    const record = data.semester[entry.code];
    if (!record) {
        alert(`${entry.code} has no attendance record yet. Open the Attendance Tracker once first.`);
        return;
    }

    record.entries = migrateEntries(record);
    delete record.hoursMissed;

    const max = record.weeklyHours * SEMESTER_WEEKS;
    if (missedHours(record) + hours > max) {
        alert(`That would exceed the total timetabled hours for ${entry.code}.`);
        return;
    }

    record.entries.push({ date: todayISO(), hours });
    localStorage.setItem('attendanceRecord', JSON.stringify(data));

    const status = document.getElementById('tt-status');
    status.textContent = `Recorded ${hours}h missed for ${entry.code}.`;
    status.style.color = 'var(--text-main)';
};

function renderTimetable() {
    const container = document.getElementById('timetable-grid');
    if (!container) return;

    const entries = loadTimetable();

    if (entries.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 30px 0;">
            No classes added yet. Use the form above to build your weekly schedule.</p>`;
        return;
    }

    const today = new Date().getDay();

    container.innerHTML = DAY_ORDER.map(day => {
        const forDay = entries
            .filter(e => e.day === day)
            .sort((a, b) => minutesOf(a.start) - minutesOf(b.start));

        if (forDay.length === 0) return '';

        return `
            <div class="tt-day ${day === today ? 'tt-today' : ''}">
                <h3>${DAY_NAMES[day]}${day === today ? ' <span class="tt-badge">Today</span>' : ''}</h3>
                ${forDay.map(e => `
                    <div class="tt-entry">
                        <div class="tt-time">
                            <strong>${formatTime(e.start)}</strong>
                            <span>${formatTime(e.end)}</span>
                        </div>
                        <div class="tt-detail">
                            <strong>${escapeHtml(e.code)}</strong>
                            <span>${escapeHtml(e.type)}${e.venue ? ' · ' + escapeHtml(e.venue) : ''}</span>
                        </div>
                        <div class="tt-actions">
                            <button type="button" class="btn-delete tt-mini" onclick="markClassMissed('${e.id}')" title="Record this class as missed">Missed</button>
                            <button type="button" class="btn-delete tt-mini" onclick="deleteTimetableEntry('${e.id}')" aria-label="Remove class">✕</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
}

/* ==============================================================
   BACKUP & RESTORE
   --------------------------------------------------------------
   Everything the app knows lives in localStorage, which a browser
   "clear site data" wipes without warning. These let a semester of
   attendance tracking survive that.
============================================================== */
const BACKUP_KEYS = ['studentProfile', 'attendanceRecord', 'timetable', 'gpaState', 'marksScores', 'theme'];
const BACKUP_APP_ID = 'tarumt-student-toolkit';

window.exportData = function() {
    const data = {};
    BACKUP_KEYS.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) data[key] = value;
    });

    const backup = {
        app: BACKUP_APP_ID,
        version: 1,
        exportedAt: new Date().toISOString(),
        data
    };

    // Local date, not UTC — otherwise a late-night export here (UTC+8) is
    // filed under the previous day.
    const now = new Date();
    const stamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0')
    ].join('-');
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `student-toolkit-backup-${stamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setBackupStatus('Backup downloaded.', 'var(--success)');
};

window.importData = function(file) {
    if (!file) return;

    const reader = new FileReader();

    reader.onerror = () => setBackupStatus('Could not read that file.', 'var(--danger)');

    reader.onload = () => {
        let backup;
        try {
            backup = JSON.parse(reader.result);
        } catch (e) {
            setBackupStatus('That file is not valid JSON.', 'var(--danger)');
            return;
        }

        if (!backup || backup.app !== BACKUP_APP_ID || !backup.data) {
            setBackupStatus('That does not look like a Student Toolkit backup.', 'var(--danger)');
            return;
        }

        const restoring = BACKUP_KEYS.filter(key => typeof backup.data[key] === 'string');
        if (restoring.length === 0) {
            setBackupStatus('That backup is empty.', 'var(--danger)');
            return;
        }

        const when = backup.exportedAt ? new Date(backup.exportedAt).toLocaleString('en-MY') : 'an unknown date';
        if (!confirm(`Restore backup from ${when}?\n\nThis replaces your current profile and attendance data.`)) {
            setBackupStatus('Restore cancelled.', 'var(--text-muted)');
            return;
        }

        restoring.forEach(key => localStorage.setItem(key, backup.data[key]));
        setBackupStatus('Restored. Reloading…', 'var(--success)');
        setTimeout(() => window.location.reload(), 600);
    };

    reader.readAsText(file);
};

function setBackupStatus(message, color) {
    const el = document.getElementById('backup-status');
    if (!el) return;
    el.textContent = message;
    el.style.color = color;
}

/* ==============================================================
   DISPLAY CURRENT PROFILE BADGE (GLOBAL)
============================================================== */
function renderProfileBadge() {
    const header = document.querySelector('header');

    // The dashboard shows its own programme selector, so it needs no badge.
    const isDashboard = !!document.getElementById('programme-selector');
    if (isDashboard || !header || typeof myDatabase === 'undefined') return;

    const profile = getProfile();
    const progData = myDatabase.programmes[profile.programme];
    if (!progData) return;

    // Format the text to look like "Year 2 Sem 3"
    const semText = profile.semester
        ? ` • Year ${profile.semester.charAt(1)} Sem ${profile.semester.charAt(3)}`
        : '';

    const badge = document.createElement('div');
    badge.style.cssText = "display: inline-block; background: var(--bg-color); color: var(--primary); padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; margin-top: 15px; border: 1px solid var(--primary); box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: center;";
    badge.textContent = progData.title + semText;

    header.appendChild(badge);
}