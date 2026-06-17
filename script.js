/* ==============================================================
   1. GLOBAL & THEME LOGIC
============================================================== */
window.onload = function() {
    loadTheme();
    
    if (document.getElementById('programme-selector')) {
        initDashboardProfile();
    } else if (document.getElementById('course-list')) {
        initGPACalculator(); 
    } else if (document.getElementById('attendance-list') || document.getElementById('y2s3-container')) {
        initAttendanceTracker(); 
    } else if (document.getElementById('tarumt-map')) {
        initMap(); 
    } else if (document.getElementById('marks-subject')) {
        initMarksCalculator();
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
    
    const defaultScale = Math.min(1, containerWidth / 1496);

    // Center the SVG inside container
    const startX = (containerWidth - (1496 * defaultScale)) / 2;
    const startY = (containerHeight - (963 * defaultScale)) / 2;

    
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

    // Apply centered default position
    myPanzoom.zoomAbs(0, 0, defaultScale);
    myPanzoom.moveTo(startX, startY);

    // =========================================================
    // NEW: RECENTER BUTTON LOGIC (FULL FACTORY RESET)
    // =========================================================
    const recenterBtn = document.getElementById('recenter-map');
    if (recenterBtn) {
        recenterBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            const currentContainerWidth = mapContainer.clientWidth;
            const currentContainerHeight = mapContainer.clientHeight;
            
            const mapBaseWidth = 1496;
            const mapBaseHeight = 963;
            
            const newDefaultScale = Math.min(1, currentContainerWidth / mapBaseWidth);
            const newStartX = (currentContainerWidth - (mapBaseWidth * newDefaultScale)) / 2;
            const newStartY = (currentContainerHeight - (mapBaseHeight * newDefaultScale)) / 2;

            // 2. Reset Pan & Zoom
            myPanzoom.moveTo(0, 0); 
            myPanzoom.zoomAbs(0, 0, newDefaultScale);
            myPanzoom.moveTo(newStartX, newStartY);

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

        "se": "block-se-building",
        
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

        "sf": "block-sf-building",

        "sd": "block-sd-building",

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
   GPA / CGPA CALCULATOR LOGIC
============================================================== */

// Global variables for the calculator
let universityData = null;
let currentProgramme = "RIS"; // Default fallback
let currentTermQP = 0;      // Quality Points for current semester
let currentTermCredits = 0; // Credits for current semester

// Standard TAR UMT Grade Scale
const gradeScale = {
    "A": 4.00, "A-": 3.75, "B+": 3.50, "B": 3.00, 
    "B-": 2.75, "C+": 2.50, "C": 2.00, "F": 0.00
};

// 1. Initialize the Calculator when the page loads
window.initGPACalculator = async function() {
    const yearSelect = document.getElementById('year-select');
    if (!yearSelect) return; 

    // Load user profile from Local Storage
    const savedProfileJSON = localStorage.getItem('studentProfile');
    let defaultTerm = "Y2S2"; // Default fallback
    
    if (savedProfileJSON) {
        const profile = JSON.parse(savedProfileJSON);
        currentProgramme = profile.programme;
        defaultTerm = profile.semester; // e.g., "Y2S2"
        
        // Auto-set the dropdowns to match their saved profile
        document.getElementById('year-select').value = defaultTerm.substring(0, 2); 
        document.getElementById('sem-select').value = defaultTerm.substring(2, 4);  
    }

    // Fetch the course database
    try {
        const response = await fetch('university.json');
        universityData = await response.json();
        
        // Load the subjects for the selected term
        loadTermSubjects();
    } catch (error) {
        console.error("Failed to load university.json:", error);
        document.getElementById('course-list').innerHTML = "<p style='color: var(--danger);'>Error loading courses. Make sure university.json is in the same folder.</p>";
    }
}

// 2. Load the specific courses into the list
window.loadTermSubjects = function() {
    if (!universityData) return;

    const year = document.getElementById('year-select').value;
    const sem = document.getElementById('sem-select').value;
    const termKey = year + sem; // e.g., "Y2S2"

    const courseListContainer = document.getElementById('course-list');
    courseListContainer.innerHTML = ''; // Clear old courses

    // Drill down into the JSON
    const programmeData = universityData.programmes[currentProgramme];
    const courses = programmeData.curriculum[termKey];

    if (!courses || courses.length === 0) {
        courseListContainer.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 20px;">No courses found for ${termKey}.</p>`;
        resetScores();
        return;
    }

    // Build the HTML for each course
    courses.forEach((course, index) => {
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
            <select class="styled-select grade-select" style="width: 130px; cursor: pointer;" data-credits="${course.credits}" onchange="calculateGPA()">
                <option value="" selected disabled>Grade</option>
                <option value="4.00">A (4.00)</option>
                <option value="3.75">A- (3.75)</option>
                <option value="3.50">B+ (3.50)</option>
                <option value="3.00">B (3.00)</option>
                <option value="2.75">B- (2.75)</option>
                <option value="2.50">C+ (2.50)</option>
                <option value="2.00">C (2.00)</option>
                <option value="0.00">F (0.00)</option>
            </select>
        `;
        courseListContainer.appendChild(row);
    });

    // Reset calculators when switching terms
    calculateGPA(); 
}

// 3. Calculate the Current Semester GPA
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
        const gpa = currentTermQP / currentTermCredits;
        gpaScoreElement.textContent = gpa.toFixed(4);
    } else {
        gpaScoreElement.textContent = "0.0000";
    }

    // Instantly update the CGPA whenever the Semester GPA changes!
    calculateCGPA();
}

// 4. Calculate the Cumulative GPA (CGPA)
window.calculateCGPA = function() {
    const prevCgpaInput = document.getElementById('prev-cgpa').value;
    const prevCreditsInput = document.getElementById('prev-credits').value;
    const cgpaScoreElement = document.getElementById('cgpa-score');

    const prevCgpa = parseFloat(prevCgpaInput) || 0;
    const prevCredits = parseInt(prevCreditsInput) || 0;

    // Math: Previous Quality Points + Current Semester Quality Points
    const prevQP = prevCgpa * prevCredits;
    const totalQP = prevQP + currentTermQP;
    const totalCredits = prevCredits + currentTermCredits;

    if (totalCredits > 0) {
        const overallCgpa = totalQP / totalCredits;
        cgpaScoreElement.textContent = overallCgpa.toFixed(4);
    } else {
        cgpaScoreElement.textContent = "0.0000";
    }
}

// 5. Reset everything
function resetAll() {
    if(confirm("Are you sure you want to clear all inputs?")) {
        // Reset Semester Dropdowns
        const gradeSelects = document.querySelectorAll('.grade-select');
        gradeSelects.forEach(select => select.value = "");
        
        // Reset CGPA Inputs
        document.getElementById('prev-cgpa').value = "";
        document.getElementById('prev-credits').value = "";
        
        calculateGPA(); // This will reset the scores back to 0.0000
    }
}



/* ==============================================================
   ATTENDANCE TRACKER LOGIC
============================================================== */

let attendanceData = JSON.parse(localStorage.getItem('attendanceRecord')) || { semester: {}, custom: [] };
let currentSemesterCourses = [];

async function initAttendanceTracker() {
    // Check if we are on the attendance page
    const semContainer = document.getElementById('y2s3-container');
    if (!semContainer) return;

    const savedProfileJSON = localStorage.getItem('studentProfile');
    if (!savedProfileJSON) {
        alert("Please setup your profile first!");
        window.location.href = "profile.html";
        return;
    }

    const profile = JSON.parse(savedProfileJSON);
    
    // 1. Update the Tab Name dynamically (e.g., changes "Y2S3 Subjects" to "Y1S2 Subjects")
    const tabBtn = document.getElementById('tab-y2s3');
    const displaySem = profile.semester; // e.g., "Y2S2"
    if (tabBtn) tabBtn.textContent = `${displaySem} Subjects`;

    // 2. Fetch the university data
    try {
        const response = await fetch('university.json');
        const data = await response.json();
        currentSemesterCourses = data.programmes[profile.programme].curriculum[profile.semester];
        
        renderSemesterAttendance();
        renderCustomAttendance();
    } catch (error) {
        semContainer.innerHTML = "<p>Error loading subjects.</p>";
    }
}

// Render the main semester subjects
function renderSemesterAttendance() {
    const container = document.getElementById('y2s3-container');
    container.innerHTML = '';

    currentSemesterCourses.forEach(course => {
        // Initialize data if it doesn't exist
        if (!attendanceData.semester[course.code]) {
            attendanceData.semester[course.code] = { attended: 0, total: 0 };
        }
        
        const record = attendanceData.semester[course.code];
        container.appendChild(createAttendanceCard(course.code, course.name, record, 'semester'));
    });
}

// Render custom subjects
function renderCustomAttendance() {
    const container = document.getElementById('custom-container');
    container.innerHTML = `
        <div style="margin-bottom: 20px; text-align: right;">
            <button onclick="addCustomSubject()" class="btn-primary" style="padding: 10px 15px; border-radius: 8px; border: none; background: var(--primary); color: white; font-weight: bold; cursor: pointer;">
                + Add Custom Subject
            </button>
        </div>
    `;

    if (attendanceData.custom.length === 0) {
        container.innerHTML += `<p style="text-align: center; color: var(--text-muted);">No custom subjects added yet.</p>`;
    } else {
        attendanceData.custom.forEach((course, index) => {
            container.appendChild(createAttendanceCard(course.code, course.name, course, 'custom', index));
        });
    }
}

// UI Builder for the Attendance Cards
function createAttendanceCard(code, name, record, type, customIndex = null) {
    const card = document.createElement('div');
    card.className = 'card-section';
    card.style.marginBottom = '20px';

    const percentage = record.total === 0 ? 100 : ((record.attended / record.total) * 100).toFixed(1);
    const isDanger = percentage < 80 && record.total > 0;
    const statusColor = isDanger ? 'var(--danger)' : 'var(--success)';

    // Math for Safe Skips
    let skipMessage = "";
    if (record.total === 0) {
        skipMessage = "Start tracking to see safe skips.";
    } else if (percentage >= 80) {
        // How many more classes can I skip and stay >= 80%?
        const safeSkips = Math.floor((record.attended - 0.8 * record.total) / 0.8);
        skipMessage = `You can safely skip <strong>${safeSkips}</strong> more class${safeSkips !== 1 ? 'es' : ''}.`;
    } else {
        // How many classes do I need to attend sequentially to reach 80%?
        const needed = Math.ceil((0.8 * record.total - record.attended) / 0.2);
        skipMessage = `<span style="color: var(--danger);">Attend the next <strong>${needed}</strong> class${needed !== 1 ? 'es' : ''} to reach 80%.</span>`;
    }

    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border); padding-bottom: 15px; margin-bottom: 15px;">
            <div>
                <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: bold;">${code}</span>
                <h3 style="margin: 5px 0 0 0; color: var(--text-main); font-size: 1.1rem;">${name}</h3>
            </div>
            <div style="text-align: right;">
                <h2 style="margin: 0; color: ${statusColor}; font-size: 1.8rem;">${percentage}%</h2>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: center; margin-bottom: 15px;">
            <div>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">Classes Attended</div>
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
                    <button onclick="updateAttendance('${code}', '${type}', 'attended', -1, ${customIndex})" style="width: 35px; height: 35px; border-radius: 50%; border: 1px solid var(--border); background: var(--input-bg); color: var(--text-main); cursor: pointer; font-size: 1.2rem; font-weight: bold;">-</button>
                    <span style="font-size: 1.3rem; font-weight: bold; color: var(--text-main); width: 30px;">${record.attended}</span>
                    <button onclick="updateAttendance('${code}', '${type}', 'attended', 1, ${customIndex})" style="width: 35px; height: 35px; border-radius: 50%; border: none; background: var(--primary); color: white; cursor: pointer; font-size: 1.2rem; font-weight: bold;">+</button>
                </div>
            </div>
            
            <div>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">Total Classes Held</div>
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
                    <button onclick="updateAttendance('${code}', '${type}', 'total', -1, ${customIndex})" style="width: 35px; height: 35px; border-radius: 50%; border: 1px solid var(--border); background: var(--input-bg); color: var(--text-main); cursor: pointer; font-size: 1.2rem; font-weight: bold;">-</button>
                    <span style="font-size: 1.3rem; font-weight: bold; color: var(--text-main); width: 30px;">${record.total}</span>
                    <button onclick="updateAttendance('${code}', '${type}', 'total', 1, ${customIndex})" style="width: 35px; height: 35px; border-radius: 50%; border: none; background: var(--text-muted); color: white; cursor: pointer; font-size: 1.2rem; font-weight: bold;">+</button>
                </div>
            </div>
        </div>

        <div style="background: var(--bg-color); padding: 12px; border-radius: 8px; font-size: 0.9rem; color: var(--text-muted); text-align: center;">
            ${skipMessage}
        </div>
        
        ${type === 'custom' ? `<button onclick="deleteCustomSubject(${customIndex})" class="btn-delete" style="width: 100%; margin-top: 15px; padding: 10px; border-radius: 8px;">Remove Subject</button>` : ''}
    `;

    return card;
}

// Logic for updating counts
function updateAttendance(code, type, field, change, customIndex) {
    let targetRecord;
    
    if (type === 'semester') {
        targetRecord = attendanceData.semester[code];
    } else {
        targetRecord = attendanceData.custom[customIndex];
    }

    targetRecord[field] += change;

    // Validation: Cannot go below 0, and Attended cannot exceed Total
    if (targetRecord[field] < 0) targetRecord[field] = 0;
    if (targetRecord.attended > targetRecord.total) {
        if (field === 'attended') targetRecord.total = targetRecord.attended; // Pushing attended up pushes total up
        if (field === 'total') targetRecord.attended = targetRecord.total;    // Pushing total down pushes attended down
    }

    saveAttendance();
    
    // Re-render
    if (type === 'semester') renderSemesterAttendance();
    else renderCustomAttendance();
}

// Adding / Deleting Custom Subjects
function addCustomSubject() {
    const code = prompt("Enter Subject Code (e.g., EGU2):");
    if (!code) return;
    const name = prompt("Enter Subject Name (e.g., Bahasa Kebangsaan A):");
    if (!name) return;

    attendanceData.custom.push({ code: code.toUpperCase(), name: name.toUpperCase(), attended: 0, total: 0 });
    saveAttendance();
    renderCustomAttendance();
}

function deleteCustomSubject(index) {
    if (confirm("Remove this custom subject?")) {
        attendanceData.custom.splice(index, 1);
        saveAttendance();
        renderCustomAttendance();
    }
}

// Save to LocalStorage
function saveAttendance() {
    localStorage.setItem('attendanceRecord', JSON.stringify(attendanceData));
}

// Reset Everything
function resetAttendance() {
    if(confirm("🚨 WARNING: This will reset ALL your attendance data to 0. Are you sure?")) {
        // Reset Semester
        for (let key in attendanceData.semester) {
            attendanceData.semester[key] = { attended: 0, total: 0 };
        }
        // Clear Custom
        attendanceData.custom = [];
        
        saveAttendance();
        renderSemesterAttendance();
        renderCustomAttendance();
    }
}

// Tab Switching Logic (Called by HTML inline onclick)
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
   TARGET MARKS CALCULATOR LOGIC
============================================================== */

async function initMarksCalculator() {
    const subjectSelect = document.getElementById('marks-subject');
    if (!subjectSelect) return; // Exit if not on marks.html

    const profileJSON = localStorage.getItem('studentProfile');
    if (!profileJSON) {
        alert("Please set up your profile first!");
        window.location.href = "profile.html";
        return;
    }

    const profile = JSON.parse(profileJSON);
    
    try {
        const response = await fetch('university.json');
        const data = await response.json();
        const currentCourses = data.programmes[profile.programme].curriculum[profile.semester];
        
        // Populate the dropdown with the user's specific subjects!
        subjectSelect.innerHTML = '<option value="">-- Choose Subject --</option>';
        currentCourses.forEach(course => {
            subjectSelect.innerHTML += `<option value="${course.code}">${course.code} - ${course.name}</option>`;
        });
        
        renderInterface(); // Initialize the empty state
        
    } catch(e) {
        console.error("Error loading subjects for Marks Calculator:", e);
        subjectSelect.innerHTML = '<option value="">Error loading subjects</option>';
    }
}

// Dynamically build the input forms based on the selected mode
window.renderInterface = function() {
    const subject = document.getElementById('marks-subject').value;
    const mode = document.getElementById('calc-mode').value;
    const inputContainer = document.getElementById('dynamic-input-container');
    const resultSection = document.getElementById('marks-result-section');
    
    // Hide previous results when changing modes or subjects
    if (resultSection) resultSection.style.display = 'none'; 

    if (!subject) {
        inputContainer.innerHTML = '<div style="padding: 30px; text-align: center; color: var(--text-muted); background: var(--input-bg); border-radius: 12px; border: 1px dashed var(--border);">Select a subject above to begin calculating.</div>';
        return;
    }

    if (mode === 'mode-final') {
        inputContainer.innerHTML = `
            <div style="background: var(--input-bg); border: 1px solid var(--border); border-radius: 12px; padding: 25px; animation: fadeUp 0.3s ease-out;">
                <h3 style="margin-top:0; color: var(--text-main); border-bottom: 1px solid var(--border); padding-bottom: 10px;">Final Exam Predictor</h3>
                
                <div class="input-group-col" style="margin-bottom: 15px;">
                    <label style="font-weight: 600; color: var(--text-muted); margin-bottom: 5px;">Coursework Weightage (%)</label>
                    <input type="number" id="cw-weight" class="styled-select" placeholder="e.g. 50">
                </div>
                
                <div class="input-group-col" style="margin-bottom: 25px;">
                    <label style="font-weight: 600; color: var(--text-muted); margin-bottom: 5px;">Current Coursework Mark Obtained (%)</label>
                    <input type="number" id="cw-mark" class="styled-select" placeholder="e.g. 35 (out of your coursework weight)">
                </div>
                
                <button onclick="calculateFinalTargets()" class="btn-primary" style="width: 100%; padding: 14px; border-radius: 8px; border: none; font-weight: bold; font-size: 1.05rem; cursor: pointer; background: var(--primary); color: white; transition: 0.2s;">
                    Calculate Final Exam Targets
                </button>
            </div>
        `;
    } else {
        inputContainer.innerHTML = `
            <div style="background: var(--input-bg); border: 1px solid var(--border); border-radius: 12px; padding: 25px; animation: fadeUp 0.3s ease-out;">
                <h3 style="margin-top:0; color: var(--text-main); border-bottom: 1px solid var(--border); padding-bottom: 10px;">Reverse Component Calculator</h3>
                
                <div class="input-group-col" style="margin-bottom: 15px;">
                    <label style="font-weight: 600; color: var(--text-muted); margin-bottom: 5px;">Missing Component Name</label>
                    <input type="text" id="rev-name" class="styled-select" placeholder="e.g. Midterm Test">
                </div>
                
                <div class="input-group-col" style="margin-bottom: 15px;">
                    <label style="font-weight: 600; color: var(--text-muted); margin-bottom: 5px;">Weightage of Missing Component (%)</label>
                    <input type="number" id="rev-weight" class="styled-select" placeholder="e.g. 20">
                </div>
                
                <div class="input-group-col" style="margin-bottom: 15px;">
                    <label style="font-weight: 600; color: var(--text-muted); margin-bottom: 5px;">Marks Obtained from OTHER Coursework (%)</label>
                    <input type="number" id="rev-other" class="styled-select" placeholder="e.g. 25">
                </div>
                
                <div class="input-group-col" style="margin-bottom: 25px;">
                    <label style="font-weight: 600; color: var(--text-muted); margin-bottom: 5px;">Target Overall Coursework Mark (%)</label>
                    <input type="number" id="rev-target" class="styled-select" placeholder="e.g. 40">
                </div>
                
                <button onclick="calculateReverse()" class="btn-primary" style="width: 100%; padding: 14px; border-radius: 8px; border: none; font-weight: bold; font-size: 1.05rem; cursor: pointer; background: var(--primary); color: white; transition: 0.2s;">
                    Calculate Missing Score
                </button>
            </div>
        `;
    }
}

// Logic for Mode 1: Final Exam Targets
window.calculateFinalTargets = function() {
    const weight = parseFloat(document.getElementById('cw-weight').value);
    const currentMark = parseFloat(document.getElementById('cw-mark').value);
    
    if (isNaN(weight) || isNaN(currentMark)) {
        alert("Please enter valid numbers for weightage and marks.");
        return;
    }
    if (currentMark > weight) {
        alert("Your marks cannot be higher than the coursework weightage!");
        return;
    }
    
    const finalWeight = 100 - weight;
    
    // Using the TAR UMT grade thresholds from your HTML table
    const thresholds = [
        { grade: 'A', min: 80 }, { grade: 'A-', min: 75 },
        { grade: 'B+', min: 70 }, { grade: 'B', min: 65 },
        { grade: 'B-', min: 60 }, { grade: 'C+', min: 55 },
        { grade: 'C', min: 50 }
    ];

    let resultHTML = `
        <h3 style="text-align:center; color: var(--text-main); margin-top:0; margin-bottom: 20px;">Score required on Final Exam (out of 100%)</h3>
        <div style="display:flex; flex-direction:column; gap:8px;">
    `;

    thresholds.forEach(t => {
        const marksNeededOverall = t.min - currentMark;
        // Calculate what they need on the paper (out of 100) to get those weighted marks
        let finalScore100 = (marksNeededOverall / finalWeight) * 100;
        
        let color = "var(--text-main)";
        let text = `${finalScore100.toFixed(1)}%`;

        if (finalScore100 > 100) {
            color = "var(--danger)";
            text = "Impossible (>100%)";
        } else if (finalScore100 <= 0) {
            color = "var(--success)";
            text = "Already Secured!";
        } else if (finalScore100 < 50) {
             // Highlight easy targets in green
            color = "var(--success)";
        }

        resultHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; border-radius: 8px; background: var(--bg-color); border: 1px solid var(--border);">
                <strong style="color: ${color}; font-size: 1.1rem;">${t.grade} <span style="font-size: 0.85rem; color: var(--text-muted);">(${t.min}%)</span></strong>
                <span style="font-weight: bold; font-size: 1.1rem; color: ${color};">${text}</span>
            </div>
        `;
    });
    
    resultHTML += '</div>';

    document.getElementById('dynamic-result-container').innerHTML = resultHTML;
    document.getElementById('marks-result-section').style.display = 'block';
    document.getElementById('marks-result-section').scrollIntoView({ behavior: 'smooth' });
}

// Logic for Mode 2: Reverse Calculation (using your exact provided snippet layout!)
window.calculateReverse = function() {
    const name = document.getElementById('rev-name').value || "Missing Component";
    const weight = parseFloat(document.getElementById('rev-weight').value);
    const otherMarks = parseFloat(document.getElementById('rev-other').value);
    const target = parseFloat(document.getElementById('rev-target').value);

    if (isNaN(weight) || isNaN(otherMarks) || isNaN(target)) {
        alert("Please enter valid numbers for the calculation.");
        return;
    }

    let neededWeighted = target - otherMarks;
    if (neededWeighted < 0) neededWeighted = 0; // Already achieved target with other marks!
    
    // Scale it up to 100% for the specific paper
    const neededScore100 = (neededWeighted / weight) * 100;

    document.getElementById('dynamic-result-container').innerHTML = `
        <h3 style="margin: 0 0 15px 0; font-size: 1.1rem; color: var(--text-main); text-align: center;">Reverse Calculation Result</h3>
        <div style="background: var(--input-bg); border: 2px solid var(--primary); border-radius: 12px; padding: 25px; text-align: center;">
            <p style="margin: 0 0 10px 0; color: var(--text-muted); font-size: 0.95rem;">To achieve an overall coursework mark of <strong>${target}%</strong>, your score for the <strong>${name}</strong> must have been:</p>
            <h1 style="color: var(--primary); font-size: 3rem; margin: 0;">${neededScore100.toFixed(1)} <span style="font-size: 1.5rem; color: var(--text-muted);">/ 100</span></h1>
            <p style="margin: 10px 0 0 0; color: var(--text-muted); font-size: 0.85rem;">(This component carries ${weight}% weightage)</p>
        </div>
    `;
    
    document.getElementById('marks-result-section').style.display = 'block';
    document.getElementById('marks-result-section').scrollIntoView({ behavior: 'smooth' });
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


document.addEventListener('DOMContentLoaded', () => {
    // 1. Fill in the Current Date
    const dateSpan = document.getElementById('current-date');
    if (dateSpan) {
        // Formats the date nicely (e.g., "Monday, October 14, 2024")
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateSpan.textContent = new Date().toLocaleDateString('en-MY', dateOptions);
    }

    // 2. Load the Profile Data
    const savedProfileJSON = localStorage.getItem('studentProfile');
    const profileInfoSpan = document.getElementById('profile-info');
    const welcomeHeading = document.querySelector('.welcome-banner h1');

    if (savedProfileJSON) {
        // Parse the saved data
        const profile = JSON.parse(savedProfileJSON);
        
        // Format the text
        const programmeName = profile.programme === 'RIS' ? 'Information Security' : 'Finance & Investment';
        const year = profile.semester.substring(1, 2);
        const sem = profile.semester.substring(3, 4);

        // Update the UI
        if (welcomeHeading) welcomeHeading.textContent = "👋 Welcome back!";
        if (profileInfoSpan) {
            profileInfoSpan.textContent = `${programmeName} (Year ${year}, Semester ${sem})`;
        }
    } else {
        // If no profile is found, prompt them to set it up
        if (profileInfoSpan) {
            profileInfoSpan.innerHTML = `<a href="profile.html" style="color: inherit; text-decoration: underline;">Click here to setup your profile</a>`;
        }
    }
});


/* ==============================================================
   DASHBOARD INLINE PROFILE LOGIC
============================================================== */
let dashboardUniData = null;

async function initDashboardProfile() {
    const progSelector = document.getElementById('programme-selector');
    const semSelector = document.getElementById('semester-selector');
    
    // Only run this if we are actually on the index.html page
    if (!progSelector || !semSelector) return;

    // Fill in today's date if the span exists
    const dateSpan = document.getElementById('current-date');
    if (dateSpan) {
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateSpan.textContent = new Date().toLocaleDateString('en-MY', dateOptions);
    }

    try {
        const response = await fetch('university.json');
        dashboardUniData = await response.json();
        
        // Check if user already has a saved profile
        const savedProfileJSON = localStorage.getItem('studentProfile');
        
        if (savedProfileJSON) {
            const profile = JSON.parse(savedProfileJSON);
            progSelector.value = profile.programme;
            updateDashboardSemesters(); // Load the correct semesters for their programme
            semSelector.value = profile.semester; // Set it to their saved semester
        } else {
            // First time user: Just load defaults
            updateDashboardSemesters();
            saveDashboardProfile(); 
        }
    } catch (error) {
        console.error("Dashboard error loading university.json:", error);
        semSelector.innerHTML = '<option value="">Error loading data</option>';
    }
}

// Update the semester dropdown when programme changes
window.updateDashboardSemesters = function() {
    if (!dashboardUniData) return;
    
    const progSelector = document.getElementById('programme-selector');
    const semSelector = document.getElementById('semester-selector');
    const programmeData = dashboardUniData.programmes[progSelector.value];
    
    semSelector.innerHTML = '';
    
    if (programmeData && programmeData.curriculum) {
        Object.keys(programmeData.curriculum).forEach(semKey => {
            const option = document.createElement('option');
            option.value = semKey;
            
            // Clean up display text: "Y1S1" -> "Year 1, Semester 1"
            const year = semKey.replace('Y', '').split('S')[0];
            const sem = semKey.split('S')[1];
            option.textContent = `Year ${year}, Semester ${sem}`;
            
            semSelector.appendChild(option);
        });
    }
}

// Auto-save to localStorage
window.saveDashboardProfile = function() {
    const progSelector = document.getElementById('programme-selector');
    const semSelector = document.getElementById('semester-selector');
    
    if (!progSelector.value || !semSelector.value) return;

    const myProfile = {
        programme: progSelector.value,
        semester: semSelector.value
    };
    
    localStorage.setItem('studentProfile', JSON.stringify(myProfile));
}