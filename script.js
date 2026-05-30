/* ==============================================================
   1. GLOBAL & THEME LOGIC
============================================================== */
window.onload = function() {
    loadTheme();
    
    if (document.getElementById('course-list')) {
        initGPACalculator(); 
    } else if (document.getElementById('attendance-list') || document.getElementById('y2s2-container')) {
        initAttendanceTracker(); 
    } else if (document.getElementById('tarumt-map')) {
        initMap(); 
    }
};

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
}

/* ==============================================================
   MAP.html :D
============================================================== */

function initMap() {
    const mapElement = document.getElementById('tarumt-map');
    if (!mapElement) return;

    const mapContainer = mapElement.parentElement;

    const containerWidth = mapContainer.clientWidth;
    const containerHeight = mapContainer.clientHeight;
    
    const defaultScale = Math.min(1, containerWidth / 1440);

    // Center the SVG inside container
    const startX = (containerWidth - (1440 * defaultScale)) / 2;
    const startY = (containerHeight - (770 * defaultScale))/ 2;

    
    const myPanzoom = panzoom(mapElement, {
        maxZoom: 5,               
        minZoom: 0.7,     
        bounds: true,             
        boundsPadding: 0.07,      
        smoothScroll: false,      
        zoomDoubleClickSpeed: 1,     
             
        onTouch: function(e) { 
            return false;         
        }
    });

    // Apply centered default position
    myPanzoom.zoomAbs(0, 0, defaultScale);
    myPanzoom.moveTo(startX, startY);
    
    // 2. The Campus Directory (Map search terms to your SVG IDs)
    const campusDirectory = {
        "library": "library-building",

        "citc": "citc-building",
        
        "dtar": "dtar-building",
        "dewan tunku abdul rahman": "dtar-building",
        "hall": "dtar-building",

        "se": "se-building",
        
        "clubhouse": "clubhouse-building",
        "club house": "clubhouse-building",
        
        "sport complex": "sportscomplex-building",

        "swimming pool": "swimming-pool",

        "taruc hostel": "taruc-hostel",
        "tarumt hostel": "taruc-hostel",

        "vtar institute": "vtar-building",
        
        "kindergarden": "tarumt-kindergarden",
        "taska & tadika cece": "tarumt-kindergarden",

        "red bricks canteen": "red-brick-canteen-building",
        "red bricks cafeteria": "red-brick-canteen-building",

        "yum yum canteen": "yum-yum-canteen-building",

        "sc canteen": "sc-canteen-building",

        "tarumt arena": "tarumt-arena",

        "block a": "block-a-building",
        
        "bangunan tun tan siew sin": "tun-tan-siew-sin-building",

        "block k": "block-k-building",

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

        "sg": "sg-building",

        "sf": "sf-building",

        "sd": "sd-building",

        "sa": "sa-building",

        "sb": "sb-building",

        "block s": "block-s-building",
        "s": "block-s-building",


    };

    // 3. The Search Logic
    const searchInput = document.getElementById('map-search');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        // Step A: Remove highlights
        document.querySelectorAll('.building-highlight').forEach(el => {
            el.classList.remove('building-highlight');
        });

        if (query.length < 1) return; 

        // Step B: Loop through directory
        // Step B: Find the matching building
        let targetSvgId = null;

        // 1. EXACT MATCH PRIORITY: This instantly solves the "s" and "se" bug
        if (campusDirectory[query]) {
            targetSvgId = campusDirectory[query];
        } 
        // 2. PARTIAL MATCH FALLBACK: This still lets users type "lib" to find the library
        else {
            for (const [keyword, svgId] of Object.entries(campusDirectory)) {
                if (keyword.includes(query)) {
                    targetSvgId = svgId;
                    break; // Stop at the first partial match
                }
            }
        }

        // Step C: Highlight and Pan
        if (targetSvgId) {
            const targetBuilding = document.getElementById(targetSvgId);
            
            if (targetBuilding) {
                targetBuilding.classList.add('building-highlight');
                
                // --- Your existing PanZoom math ---
                const bbox = targetBuilding.getBBox();
                const svgCenterX = bbox.x + (bbox.width / 2);
                const svgCenterY = bbox.y + (bbox.height / 2);
                
                const currentTransform = myPanzoom.getTransform();
                const currentScale = currentTransform.scale;

                const mapContainer = mapElement.parentElement;
                const containerWidth = mapContainer.clientWidth;
                const containerHeight = mapContainer.clientHeight;

                // Keep current zoom level
                const moveX = (containerWidth / 2) - (svgCenterX * currentScale);
                const moveY = (containerHeight / 2) - (svgCenterY * currentScale);

                // Smoothly center only
                myPanzoom.smoothMoveTo(moveX, moveY);
            }
        }
    });
}


/* ==============================================================
   2. GPA & CGPA CALCULATOR LOGIC (CUSTOM SYLLABUS)
============================================================== */

const syllabusDatabase = {
    "Y1": {
        "S1": [
            { code: "BMIS1043", name: "Systems Analysis and Design", credits: 3 },
            { code: "BJEL1713", name: "English for Tertiary Studies", credits: 3 },
            { code: "MPU-3103", name: "Penghayatan Etika dan Peradaban", credits: 3 }
        ],
        "S2": [
            { code: "BMCS1013", name: "Problem Solving and Programming", credits: 3 },
            { code: "BMCS1053", name: "Database Management", credits: 3 },
            { code: "BMCS1113", name: "Computer Organisation and Architecture", credits: 3 },
            { code: "BMIT1173", name: "IT Fundamentals", credits: 3 }
        ],
        "S3": [
            { code: "BMCS2023", name: "Object-Oriented Programming", credits: 3 },
            { code: "BMCS2093", name: "Operating Systems", credits: 3 },
            { code: "BMIT2004", name: "Fundamentals of Computer Networks", credits: 4 },
            { code: "BMIT1023", name: "Web Design and Development", credits: 3 },
            { code: "MPU-3302", name: "Integrity and Anti-Corruption", credits: 2 }
        ]
    },
    "Y2": {
        "S1": [
            { code: "BMMS1653", name: "Discrete Structures", credits: 3 },
            { code: "BMIT2043", name: "Introduction to Internet Security", credits: 3 },
            { code: "BMIT2154", name: "Switching and Routing Technologies", credits: 4 }
        ],
        "S2": [
            { code: "BMCS2053", name: "Object-Oriented Analysis and Design", credits: 3 },
            { code: "BMIT2203", name: "Human Computer Interaction", credits: 3 },
            { code: "BMIT3084", name: "Enterprise Networking", credits: 4 },
            { code: "BMIT2183", name: "Software Security", credits: 3 },
            { code: "BMIT3143", name: "Digital Forensics", credits: 3 },
            { code: "MPU-3232", name: "Entrepreneurship", credits: 2 } // Chosen Elective
        ],
        "S3": [
            { code: "ECOQ", name: "Co-Curricular", credits: 2 },
            { code: "BMCS2003", name: "Artificial Intelligence", credits: 3 },
            { code: "BMIT3173", name: "Integrative Programming", credits: 3 },
            { code: "BMIT2023", name: "Web and Mobile Systems", credits: 3 },
            { code: "BMIT2083", name: "Information Assurance and Security", credits: 3 },
            { code: "MPU-3133", name: "Falsafah dan Isu Semasa", credits: 3 },
            { code: "BJEL1723", name: "Academic English", credits: 3 }
        ]
    },
    "Y3": {
        "S1": [
            { code: "BMCS3404", name: "Project I", credits: 4 },
            { code: "BMIT3273", name: "Cloud Computing", credits: 3 },
            { code: "BMIS2113", name: "Information Technology Infrastructure", credits: 3 }
        ],
        "S2": [
            { code: "BMCS3414", name: "Project II", credits: 4 },
            { code: "BMCS3183", name: "Advanced Database Management", credits: 3 },
            { code: "BMIT3123", name: "Vulnerability Assessment and Penetration Testing", credits: 3 },
            { code: "BMIT3113", name: "Systems Administration", credits: 3 },
            { code: "BMSE3153", name: "Software Project Management", credits: 3 },
            { code: "BJEL2013", name: "English for Career Preparation", credits: 3 }
        ],
        "S3": [
            { code: "BMIT305A", name: "Industrial Training", credits: 10 }
        ]
    },
};

function initGPACalculator() {
    const savedCGPA = localStorage.getItem('prev-cgpa');
    const savedCredits = localStorage.getItem('prev-credits');
    if (savedCGPA) document.getElementById('prev-cgpa').value = savedCGPA;
    if (savedCredits) document.getElementById('prev-credits').value = savedCredits;

    loadTermSubjects(); 
}

function loadTermSubjects() {
    const year = document.getElementById('year-select').value;
    const sem = document.getElementById('sem-select').value;
    const container = document.getElementById('course-list');
    
    if (!container) return;
    container.innerHTML = ''; 

    const subjects = syllabusDatabase[year][sem] || [];

    if (subjects.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: var(--text-muted); font-style: italic; padding: 20px 0;">No subjects found for ${year} ${sem}.</p>`;
        document.getElementById('gpa-score').innerText = "0.0000";
        calculateCGPA(0, 0);
        return;
    }

    subjects.forEach((subject, index) => {
        const div = document.createElement('div');
        div.className = 'input-group-col';
        div.style.marginBottom = '20px';
        // REMOVED THE CREDIT DISPLAY HERE:
        div.innerHTML = `
            <label style="font-weight: 600; color: var(--text-main); margin-bottom: 5px;">${subject.code} <span style="color: var(--text-muted); font-weight: normal;">- ${subject.name}</span></label>
            <select class="styled-select grade-select" data-credits="${subject.credits}" id="grade-${index}" onchange="calculateGPA()">
                <option value="-1">-- Select Grade --</option>
                <option value="4.00">A (4.00)</option>
                <option value="3.67">A- (3.67)</option>
                <option value="3.33">B+ (3.33)</option>
                <option value="3.00">B (3.00)</option>
                <option value="2.67">B- (2.67)</option>
                <option value="2.33">C+ (2.33)</option>
                <option value="2.00">C (2.00)</option>
                <option value="0.00">F (0.00)</option>
            </select>
        `;
        container.appendChild(div);
    });

    calculateGPA(); 
}

function calculateGPA() {
    const gradeSelects = document.querySelectorAll('.grade-select');
    let totalPoints = 0;
    let totalCredits = 0;

    gradeSelects.forEach(select => {
        const gradePoint = parseFloat(select.value);
        const credits = parseFloat(select.getAttribute('data-credits'));

        if (gradePoint >= 0) { 
            totalPoints += (gradePoint * credits);
            totalCredits += credits;
        }
    });

    const gpaScore = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
    document.getElementById('gpa-score').innerText = gpaScore.toFixed(4);
    
    calculateCGPA(gpaScore, totalCredits);
}

function calculateCGPA(currentGPA = null, currentCredits = null) {
    if (currentGPA === null || currentCredits === null) {
        const gradeSelects = document.querySelectorAll('.grade-select');
        let totalPoints = 0;
        currentCredits = 0;
        
        gradeSelects.forEach(select => {
            const gradePoint = parseFloat(select.value);
            const credits = parseFloat(select.getAttribute('data-credits'));
            if (gradePoint >= 0) { 
                totalPoints += (gradePoint * credits);
                currentCredits += credits;
            }
        });
        currentGPA = currentCredits > 0 ? (totalPoints / currentCredits) : 0;
    }

    const prevCGPA = parseFloat(document.getElementById('prev-cgpa').value) || 0;
    const prevCredits = parseFloat(document.getElementById('prev-credits').value) || 0;

    localStorage.setItem('prev-cgpa', document.getElementById('prev-cgpa').value);
    localStorage.setItem('prev-credits', document.getElementById('prev-credits').value);

    const totalPrevPoints = prevCGPA * prevCredits;
    const totalCurrentPoints = currentGPA * currentCredits;
    const totalCombinedCredits = prevCredits + currentCredits;
    
    if (totalCombinedCredits > 0) {
        const newCGPA = (totalPrevPoints + totalCurrentPoints) / totalCombinedCredits;
        document.getElementById('cgpa-score').innerText = newCGPA.toFixed(4);
    } else {
        document.getElementById('cgpa-score').innerText = prevCGPA > 0 ? prevCGPA.toFixed(4) : "0.0000";
    }
}

function resetAll() {
    if(confirm("🚨 Are you sure you want to reset all your calculator data?")) {
        // Clears the saved data from the browser memory
        localStorage.removeItem('prev-cgpa');
        localStorage.removeItem('prev-credits');
        // Refreshes the page to show the cleared inputs
        location.reload();
    }
}


/* ==============================================================
   3. ATTENDANCE TRACKER LOGIC (PRECISE HOURS)
============================================================== */
const y2s2AttendanceData = [
    { id: "MPU-3232", code: "MPU-3232", name: "Entrepreneurship", l: 1, t: 1, p: 0, weeks: 14 },
    { id: "BMIT2183", code: "BMIT2183", name: "Software Security", l: 2, t: 0, p: 2, weeks: 14 },
    { id: "BMIT3143", code: "BMIT3143", name: "Digital Forensics", l: 2, t: 0, p: 2, weeks: 14 },
    { id: "BMCS2053", code: "BMCS2053", name: "Object-Oriented Analysis", l: 2, t: 1, p: 1, weeks: 14 },
    { id: "BMIT2203", code: "BMIT2203", name: "Human Computer Interaction", l: 2, t: 1, p: 1, weeks: 14 },
    { id: "BMIT3084", code: "BMIT3084", name: "Enterprise Networking", l: 2, t: 1, p: 2, weeks: 14 }
];

let customSubjects = [];
let currentTab = 'y2s2';

function initAttendanceTracker() {
    const savedCustom = localStorage.getItem('custom-attendance');
    if (savedCustom) customSubjects = JSON.parse(savedCustom);
    renderAttendanceUI();
}

function switchTab(tab) {
    currentTab = tab;
    const btnY2S2 = document.getElementById('tab-y2s2');
    const btnCustom = document.getElementById('tab-custom');
    const contY2S2 = document.getElementById('y2s2-container');
    const contCustom = document.getElementById('custom-container');

    if (tab === 'y2s2') {
        btnY2S2.style.color = 'var(--danger)';
        btnY2S2.style.borderBottomColor = 'var(--danger)';
        btnCustom.style.color = 'var(--text-muted)';
        btnCustom.style.borderBottomColor = 'transparent';
        contY2S2.style.display = 'block';
        contCustom.style.display = 'none';
    } else {
        btnCustom.style.color = 'var(--danger)';
        btnCustom.style.borderBottomColor = 'var(--danger)';
        btnY2S2.style.color = 'var(--text-muted)';
        btnY2S2.style.borderBottomColor = 'transparent';
        contCustom.style.display = 'block';
        contY2S2.style.display = 'none';
    }
    renderAttendanceUI();
}

function renderAttendanceUI() {
    const container = currentTab === 'y2s2' ? document.getElementById('y2s2-container') : document.getElementById('custom-container');
    if (!container) return;
    
    container.innerHTML = '';
    const dataList = currentTab === 'y2s2' ? y2s2AttendanceData : customSubjects;

    dataList.forEach(subject => {
        let missed = parseInt(localStorage.getItem(`missed-${subject.id}`)) || 0;
        
        let weeklyHours = subject.l + subject.t + subject.p;
        let totalHours = weeklyHours * subject.weeks;
        let maxSkipsAllowed = Math.floor(totalHours * 0.2); 
        let remainingSkips = maxSkipsAllowed - missed;
        
        let attendancePct = totalHours > 0 ? (((totalHours - missed) / totalHours) * 100).toFixed(2) : 100.00;
        
        let safeColor = remainingSkips > 0 ? '#28a745' : 'var(--danger)'; 
        let pctColor = attendancePct >= 80 ? '#28a745' : 'var(--danger)';

        const deleteButtonHtml = currentTab === 'custom' 
            ? `<button onclick="deleteCustomSubject('${subject.id}')" class="btn-delete" style="padding: 6px 12px; font-size: 0.75rem; margin-top: 10px;">🗑️ Delete Subject</button>` 
            : '';

        const div = document.createElement('div');
        div.style.background = 'var(--input-bg)';
        div.style.border = '1px solid var(--border)';
        div.style.borderRadius = '12px';
        div.style.padding = '20px';
        div.style.marginBottom = '15px';
        div.style.display = 'grid';
        div.style.gridTemplateColumns = window.innerWidth > 768 ? '2fr 1fr 1fr' : '1fr';
        div.style.alignItems = window.innerWidth > 768 ? 'center' : 'stretch';
        div.style.gap = '20px';

        div.innerHTML = `
            <div>
                <h3 style="margin: 0 0 10px 0; color: var(--text-main); font-size: 1.15rem;">${subject.code} ${subject.name}</h3>
                <p style="margin: 0 0 5px 0; font-size: 0.85rem; color: var(--text-muted);"><strong>Weekly:</strong> L(${subject.l}h) | T(${subject.t}h) | P(${subject.p}h)</p>
                <p style="margin: 0 0 10px 0; font-size: 0.85rem; color: var(--text-muted);"><strong>Total:</strong> ${totalHours}h <span style="font-style: italic;">(${subject.weeks} weeks)</span></p>
                <p style="margin: 0; font-size: 0.9rem; font-weight: bold; color: var(--text-main);">Current Attendance: <span style="color: ${pctColor};">${attendancePct}%</span></p>
                ${deleteButtonHtml}
            </div>
            <div style="text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 0.85rem; color: var(--text-muted); font-weight: bold;">Hours Missed</p>
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <button onclick="updateMissedHours('${subject.id}', -1)" style="width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-color); color: var(--text-main); font-weight: bold; cursor: pointer;">-</button>
                    <div style="background: rgba(0,0,0,0.1); padding: 8px 20px; border-radius: 8px; font-weight: bold; font-size: 1.2rem; min-width: 60px; border: 1px solid var(--border);">${missed}</div>
                    <button onclick="updateMissedHours('${subject.id}', 1)" style="width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-color); color: var(--text-main); font-weight: bold; cursor: pointer;">+</button>
                </div>
            </div>
            <div style="display: flex; justify-content: ${window.innerWidth > 768 ? 'flex-end' : 'center'};">
                <div style="border: 2px solid ${safeColor}; border-radius: 12px; padding: 15px 30px; text-align: center; min-width: 140px; background: rgba(40, 167, 69, 0.05);">
                    <h2 style="margin: 0; font-size: 2.5rem; color: ${safeColor}; line-height: 1;">${remainingSkips}</h2>
                    <p style="margin: 5px 0 0 0; font-size: 0.75rem; color: ${safeColor}; font-weight: bold; letter-spacing: 1px;">SAFE SKIPS</p>
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    if (currentTab === 'custom') renderCustomBuilder(container);
}

function updateMissedHours(subjectId, change) {
    let missed = parseInt(localStorage.getItem(`missed-${subjectId}`)) || 0;
    missed += change;
    if (missed < 0) missed = 0;
    localStorage.setItem(`missed-${subjectId}`, missed);
    renderAttendanceUI();
}

function deleteCustomSubject(subjectId) {
    if(confirm("Are you sure you want to permanently delete this custom subject?")) {
        customSubjects = customSubjects.filter(sub => sub.id !== subjectId);
        localStorage.setItem('custom-attendance', JSON.stringify(customSubjects));
        localStorage.removeItem(`missed-${subjectId}`);
        renderAttendanceUI();
    }
}

function renderCustomBuilder(container) {
    const builder = document.createElement('div');
    builder.style.background = 'var(--input-bg)';
    builder.style.border = '1px solid var(--primary)';
    builder.style.borderRadius = '12px';
    builder.style.padding = '25px';
    builder.style.marginTop = '20px';
    
    builder.innerHTML = `
        <h3 style="margin: 0 0 20px 0; color: var(--primary);">Add Custom Subject</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <input type="text" id="cust-code" placeholder="Subject Code (e.g. ELE101)" class="styled-select">
            <input type="text" id="cust-name" placeholder="Subject Name" class="styled-select">
        </div>
        <p style="margin: 0 0 10px 0; font-size: 0.85rem; color: var(--text-muted); font-weight: bold;">Weekly Contact Hours:</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
            <input type="number" id="cust-l" placeholder="Lecture (h)" min="0" class="styled-select">
            <input type="number" id="cust-t" placeholder="Tutorial (h)" min="0" class="styled-select">
            <input type="number" id="cust-p" placeholder="Practical (h)" min="0" class="styled-select">
        </div>
        <div style="margin-bottom: 20px;">
            <label style="font-size: 0.85rem; color: var(--text-muted); font-weight: bold; display: block; margin-bottom: 5px;">Total Weeks</label>
            <input type="number" id="cust-w" value="14" min="1" class="styled-select">
        </div>
        <button onclick="saveCustomSubject()" class="btn-add" style="width: 100%;">Add to Tracker</button>
    `;
    container.appendChild(builder);
}

function saveCustomSubject() {
    const code = document.getElementById('cust-code').value;
    const name = document.getElementById('cust-name').value;
    const l = parseInt(document.getElementById('cust-l').value) || 0;
    const t = parseInt(document.getElementById('cust-t').value) || 0;
    const p = parseInt(document.getElementById('cust-p').value) || 0;
    const w = parseInt(document.getElementById('cust-w').value) || 14;

    if (!code || (l+t+p) === 0) return alert("Please enter a subject code and at least 1 contact hour.");

    customSubjects.push({ id: 'CUST-'+Date.now(), code, name, l, t, p, weeks: w });
    localStorage.setItem('custom-attendance', JSON.stringify(customSubjects));
    renderAttendanceUI();
}

function resetAttendance() {
    if(confirm("🚨 Reset all hours missed to zero?")) {
        y2s2AttendanceData.forEach(sub => localStorage.removeItem(`missed-${sub.id}`));
        customSubjects.forEach(sub => localStorage.removeItem(`missed-${sub.id}`));
        renderAttendanceUI();
    }
}

window.addEventListener('resize', () => {
    if (document.getElementById('attendance-list') || document.getElementById('y2s2-container')) {
        renderAttendanceUI();
    }
});


/* ==============================================================
   4. MARKS CALCULATOR LOGIC
============================================================== */
const subjectAssessments = {
    "BMIT3084": { final: 40, cw: [{ name: "Test", weight: 24 }, { name: "Practical Assessment", weight: 36 }] },
    "BMIT2203": { final: 50, cw: [{ name: "Test", weight: 15 }, { name: "Assignment", weight: 35 }] },
    "BMCS2053": { final: 50, cw: [{ name: "Test", weight: 20 }, { name: "Assignment", weight: 30 }] },
    "BMIT2183": { final: 30, cw: [{ name: "Test", weight: 28 }, { name: "Assignment", weight: 28 }, { name: "Practical", weight: 14 }] },
    "BMIT3143": { final: 30, cw: [{ name: "Test", weight: 28 }, { name: "Assignment", weight: 28 }, { name: "Practical", weight: 14 }] }
};

function renderInterface() {
    const subjectCode = document.getElementById('marks-subject').value;
    const calcMode = document.getElementById('calc-mode').value;
    const inputContainer = document.getElementById('dynamic-input-container');
    const resultSection = document.getElementById('marks-result-section');

    inputContainer.innerHTML = '';
    if (!subjectCode) { resultSection.style.display = 'none'; return; }

    const data = subjectAssessments[subjectCode];
    resultSection.style.display = 'block';

    if (calcMode === 'mode-final') {
        let maxCourseworkLimit = 0;
        data.cw.forEach(item => maxCourseworkLimit += item.weight);

        const quickEntryDiv = document.createElement('div');
        quickEntryDiv.style.background = 'rgba(0, 123, 255, 0.05)';
        quickEntryDiv.style.border = '1px solid var(--primary)';
        quickEntryDiv.style.borderRadius = '8px';
        quickEntryDiv.style.padding = '15px';
        quickEntryDiv.style.marginBottom = '20px';
        quickEntryDiv.innerHTML = `
            <label style="font-weight: bold; color: var(--primary); display: block; margin-bottom: 8px;">Quick Entry: Total Coursework Mark (%)</label>
            <p style="margin: 0 0 10px 0; font-size: 0.85rem; color: var(--text-muted);">Enter your percentage out of 100 to override the individual inputs.</p>
            <div class="fraction-input">
                <input type="number" id="quick-cw-total" placeholder="e.g. 74" oninput="calculateTargets()" style="box-sizing: border-box;">
                <span style="font-weight: bold; color: var(--border); font-size: 1.8rem;">%</span>
            </div>
        `;
        inputContainer.appendChild(quickEntryDiv);

        const divider = document.createElement('div');
        divider.style.textAlign = 'center';
        divider.style.margin = '15px 0';
        divider.style.fontSize = '0.85rem';
        divider.style.fontWeight = 'bold';
        divider.style.color = 'var(--text-muted)';
        divider.innerText = '— OR ENTER INDIVIDUAL MARKS —';
        inputContainer.appendChild(divider);

        data.cw.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'input-group-col';
            div.style.marginBottom = '20px';
            div.innerHTML = `
                <label style="font-weight: 600; color: var(--text-main); display: block; margin-bottom: 5px;">${item.name} <span style="color: var(--text-muted); font-weight: normal;">(Carries ${item.weight}%)</span></label>
                <div class="fraction-input">
                    <input type="number" class="cw-score individual-input" data-weight="${item.weight}" placeholder="Score" min="0" oninput="calculateTargets()" style="box-sizing: border-box;">
                    <span style="font-weight: bold; color: var(--border); font-size: 1.8rem;">/</span>
                    <input type="number" class="cw-total individual-input" value="100" placeholder="Total" min="1" oninput="calculateTargets()" style="box-sizing: border-box;">
                </div>
            `;
            inputContainer.appendChild(div);
        });
    } else {
        let missingOptions = '';
        let maxCourseworkLimit = 0;
        data.cw.forEach((item, index) => {
            missingOptions += `<option value="${index}">${item.name}</option>`;
            maxCourseworkLimit += item.weight;
        });

        const controlDiv = document.createElement('div');
        controlDiv.style.marginBottom = '25px';
        controlDiv.style.paddingBottom = '25px';
        controlDiv.style.borderBottom = '2px dashed var(--border)';
        controlDiv.innerHTML = `
            <div class="input-group-col" style="margin-bottom: 15px;">
                <label style="font-weight: bold; color: var(--danger); display: block; margin-bottom: 8px;">What is your Total Coursework Mark? (%) <span style="font-weight: normal; color: var(--text-muted); font-size: 0.9rem;">(Max: ${maxCourseworkLimit})</span></label>
                <div class="fraction-input">
                    <input type="number" id="known-carry" placeholder="e.g. 74" oninput="calculateTargets()" style="box-sizing: border-box;">
                    <span style="font-weight: bold; color: var(--border); font-size: 1.8rem;">%</span>
                </div>
            </div>
            <div class="input-group-col">
                <label style="font-weight: bold; color: var(--text-main); display: block; margin-bottom: 8px;">Which coursework are you trying to calculate?</label>
                <select id="missing-cw-select" class="styled-select" onchange="renderReverseInputs()">
                    ${missingOptions}
                </select>
            </div>
            <div id="reverse-known-inputs" style="margin-top: 25px;"></div>
        `;
        inputContainer.appendChild(controlDiv);
        renderReverseInputs(); 
    }
    calculateTargets();
}

function renderReverseInputs() {
    const subjectCode = document.getElementById('marks-subject').value;
    const missingIndex = document.getElementById('missing-cw-select').value;
    const container = document.getElementById('reverse-known-inputs');
    const data = subjectAssessments[subjectCode];
    
    container.innerHTML = '<label style="font-weight: bold; color: var(--text-main); margin-bottom: 15px; display: block;">Enter your other known marks:</label>';

    data.cw.forEach((item, index) => {
        if (index.toString() === missingIndex) return; 

        const div = document.createElement('div');
        div.className = 'input-group-col';
        div.style.marginBottom = '15px';
        div.innerHTML = `
            <label style="font-weight: 600; color: var(--text-main); font-size: 0.95rem; display: block; margin-bottom: 5px;">${item.name} <span style="color: var(--text-muted); font-weight: normal;">(Carries ${item.weight}%)</span></label>
            <div class="fraction-input">
                <input type="number" class="cw-score individual-input" data-weight="${item.weight}" placeholder="Score" min="0" oninput="calculateTargets()" style="box-sizing: border-box;">
                <span style="font-weight: bold; color: var(--border); font-size: 1.5rem;">/</span>
                <input type="number" class="cw-total individual-input" value="100" placeholder="Total" min="1" oninput="calculateTargets()" style="box-sizing: border-box;">
            </div>
        `;
        container.appendChild(div);
    });
    calculateTargets();
}

function calculateTargets() {
    const subjectCode = document.getElementById('marks-subject').value;
    const calcMode = document.getElementById('calc-mode').value;
    const resultContainer = document.getElementById('dynamic-result-container');
    const data = subjectAssessments[subjectCode];

    if (calcMode === 'mode-final') {
        let totalEarned = 0;
        let totalCwWeight = 0;
        data.cw.forEach(item => totalCwWeight += item.weight);

        const quickTotalInput = document.getElementById('quick-cw-total');
        
        if (quickTotalInput && quickTotalInput.value !== '') {
            const rawPercentage = parseFloat(quickTotalInput.value) || 0;
            totalEarned = (rawPercentage / 100) * totalCwWeight;
        } else {
            const scores = document.querySelectorAll('.cw-score');
            const totals = document.querySelectorAll('.cw-total');
            scores.forEach((scoreInput, idx) => {
                const weight = parseFloat(scoreInput.getAttribute('data-weight'));
                const score = parseFloat(scoreInput.value) || 0;
                const outOf = parseFloat(totals[idx].value) || 1; 
                totalEarned += (score / outOf) * weight;
            });
        }

        const finalWeight = data.final;
        const targetGrades = [
            { grade: 'A', min: 80 }, { grade: 'A-', min: 75 }, { grade: 'B+', min: 70 },
            { grade: 'B', min: 65 }, { grade: 'B-', min: 60 }, { grade: 'C+', min: 55 }, { grade: 'C', min: 50 }
        ];

        let html = `
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 20px;">
                <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: bold; text-transform: uppercase;">Current Coursework Marks</span>
                <h1 style="color: var(--primary); font-size: 2.8rem; margin: 5px 0;">${totalEarned.toFixed(2)} <span style="font-size: 1.2rem; color: var(--text-muted);">/ ${totalCwWeight}</span></h1>
            </div>
            <h3 style="margin: 0 0 15px 0; font-size: 1.1rem; color: var(--text-main);">Final Exam Targets (/100)</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
        `;

        targetGrades.forEach(t => {
            const marksNeededOverall = t.min - totalEarned;
            const marksNeededOnFinal = (marksNeededOverall / finalWeight) * 100;
            let displayTxt = marksNeededOverall <= 0 ? "Achieved! 🎉" : `${marksNeededOnFinal.toFixed(2)} / 100`;
            let color = marksNeededOverall <= 0 ? "var(--text-muted)" : (marksNeededOnFinal > 100 ? "var(--danger)" : "var(--success)");

            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; background: var(--input-bg); padding: 10px 15px; border-radius: 8px; border: 1px solid var(--border);">
                    <strong style="color: var(--text-main); font-size: 1.1rem;">${t.grade} <span style="color: var(--text-muted); font-size: 0.9rem; font-weight: normal;">(${t.min}%)</span></strong>
                    <span style="font-weight: bold; font-size: 1.15rem; color: ${color};">${displayTxt}</span>
                </div>
            `;
        });
        html += `</div>`;
        resultContainer.innerHTML = html;

    } else {
        let maxCourseworkLimit = 0;
        data.cw.forEach(item => maxCourseworkLimit += item.weight);

        const inputCarry = parseFloat(document.getElementById('known-carry').value) || 0;
        const totalCarryWeighted = (inputCarry / 100) * maxCourseworkLimit; 
        
        const missingIndex = document.getElementById('missing-cw-select').value;
        const missingItem = data.cw[missingIndex];
        
        let knownEarned = 0;
        const scores = document.querySelectorAll('.cw-score');
        const totals = document.querySelectorAll('.cw-total');

        scores.forEach((scoreInput, idx) => {
            const weight = parseFloat(scoreInput.getAttribute('data-weight'));
            const score = parseFloat(scoreInput.value) || 0;
            const outOf = parseFloat(totals[idx].value) || 1; 
            knownEarned += (score / outOf) * weight;
        });

        let neededWeighted = totalCarryWeighted - knownEarned;
        if (neededWeighted < 0) neededWeighted = 0;
        
        const neededScore100 = (neededWeighted / missingItem.weight) * 100;

        resultContainer.innerHTML = `
            <h3 style="margin: 0 0 15px 0; font-size: 1.1rem; color: var(--text-main); text-align: center;">Reverse Calculation Result</h3>
            <div style="background: var(--input-bg); border: 2px solid var(--primary); border-radius: 12px; padding: 25px; text-align: center;">
                <p style="margin: 0 0 10px 0; color: var(--text-muted); font-size: 0.95rem;">To achieve an overall coursework mark of <strong>${inputCarry}%</strong>, your score for the <strong>${missingItem.name}</strong> must have been:</p>
                <h1 style="color: var(--primary); font-size: 3rem; margin: 0;">${neededScore100.toFixed(2)} <span style="font-size: 1.5rem; color: var(--text-muted);">/ 100</span></h1>
                <p style="margin: 10px 0 0 0; color: var(--text-muted); font-size: 0.85rem;">(This component carries ${missingItem.weight}% weightage)</p>
            </div>
        `;
    }
}