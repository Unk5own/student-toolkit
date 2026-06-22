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
   DASHBOARD INLINE PROFILE LOGIC
============================================================== */
let dashboardUniData = null;

window.initDashboardProfile = async function() {
    if (typeof myDatabase !== 'undefined') {
        dashboardUniData = myDatabase;
        
        loadProfile();
    }
};

window.loadProfile = function() {
    const savedJSON = localStorage.getItem('studentProfile');
    if (savedJSON) {
        const profile = JSON.parse(savedJSON);
        const progSelector = document.getElementById('programme-selector');
        if (progSelector && profile.programme) {
            progSelector.value = profile.programme;
        }
        updateWelcomeMessage(profile.programme);
    }
};

window.saveProfile = function() {
    const progSelector = document.getElementById('programme-selector');
    
    // If they select the blank default option, do nothing
    if (!progSelector.value) {
        return;
    }
    
    // Automatically assign the exact correct semester!
    const sem = progSelector.value === 'RIS' ? 'Y2S3' : 'Y3S1';
    
    const profile = {
        programme: progSelector.value,
        semester: sem
    };
    
    // Save to local storage instantly
    localStorage.setItem('studentProfile', JSON.stringify(profile));
    
    // Automatically refresh the page to apply changes to the badge and memory
    window.location.reload();
};

window.updateWelcomeMessage = function(programmeKey) {
    const headerTitle = document.querySelector('header h1');
    const headerSub = document.querySelector('header .subtitle');
    if (headerTitle && dashboardUniData) {
        headerTitle.textContent = "Welcome back!";
        // Only displays the Programme Title now
        headerSub.innerHTML = `<strong>${dashboardUniData.programmes[programmeKey].title}</strong>`;
    }
};


/* ==============================================================
   GPA / CGPA CALCULATOR LOGIC
============================================================== */
let universityData = null;
let currentProgramme = "RIS"; 
let activeSemester = "Y2S3";
let currentTermQP = 0;      
let currentTermCredits = 0; 

// Run initGPACalculator when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes('calculator.html')) {
        initGPACalculator();
    }
});

window.initGPACalculator = async function() {
    const savedProfileJSON = localStorage.getItem('studentProfile');
    
    if (savedProfileJSON) {
        const profile = JSON.parse(savedProfileJSON);
        currentProgramme = profile.programme;
        activeSemester = profile.semester; // Auto-pulls Y2S3 or Y3S1
    }

    if (typeof myDatabase !== 'undefined') {
        universityData = myDatabase;
        loadTermSubjects();
    } else {
        document.getElementById('course-list').innerHTML = "<p style='color: var(--danger);'>Error loading data.js</p>";
    }
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
            <select class="styled-select grade-select" style="width: 130px; cursor: pointer;" data-credits="${course.credits}" onchange="calculateGPA()">
                <option value="" selected disabled>Grade</option>
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
        courseListContainer.appendChild(row);
    });

    calculateGPA(); 
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
}

window.resetAll = function() {
    if(confirm("Are you sure you want to clear all inputs?")) {
        document.querySelectorAll('.grade-select').forEach(select => select.value = "");
        document.getElementById('prev-cgpa').value = "";
        document.getElementById('prev-credits').value = "";
        calculateGPA(); 
    }
}

/* ==============================================================
   ATTENDANCE TRACKER LOGIC (HOURS-BASED, LOCKED TIMETABLE)
============================================================== */
let attendanceData = JSON.parse(localStorage.getItem('attendanceRecord')) || { semester: {}, custom: [] };
let currentSemesterCourses = [];

// Run initAttendanceTracker when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
     if (window.location.pathname.includes('attendance.html')) {
         initAttendanceTracker();
     }
});

window.initAttendanceTracker = async function() {
    const semContainer = document.getElementById('y2s3-container');
    if (!semContainer) return;

    const savedProfileJSON = localStorage.getItem('studentProfile');
    if (!savedProfileJSON) {
        alert("Please setup your profile first!");
        window.location.href = "index.html";
        return;
    }

    const profile = JSON.parse(savedProfileJSON);
    
    const tabBtn = document.getElementById('tab-y2s3');
    const displaySem = profile.semester;
    if (tabBtn) tabBtn.textContent = `${displaySem} Subjects`;

    try {
        if (typeof myDatabase !== 'undefined') {
            currentSemesterCourses = myDatabase.programmes[profile.programme].curriculum[profile.semester];
            
            if(currentSemesterCourses) {
                 renderSemesterAttendance();
                 renderCustomAttendance();
            } else {
                 semContainer.innerHTML = "<p>No subjects found for this semester.</p>";
            }
        }
    } catch (error) {
        console.error(error);
        semContainer.innerHTML = "<p>Error loading subjects.</p>";
    }
}

window.renderSemesterAttendance = function() {
    const container = document.getElementById('y2s3-container');
    container.innerHTML = '';

    currentSemesterCourses.forEach(course => {
        // Automatically pull the exact hours from data.js
        const defaultHours = course.weeklyHours || 3;

        // Force a data structure update if the browser is stuck
        if (!attendanceData.semester[course.code] || attendanceData.semester[course.code].hoursMissed === undefined) {
            attendanceData.semester[course.code] = { 
                weeklyHours: defaultHours, 
                hoursMissed: 0 
            };
        }
        
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
            <button onclick="addCustomSubject()" class="btn-primary" style="padding: 10px 15px; border-radius: 8px; border: none; background: var(--primary); color: white; font-weight: bold; cursor: pointer;">
                + Add Custom Subject
            </button>
        </div>
    `;

    if (attendanceData.custom.length === 0) {
        container.innerHTML += `<p style="text-align: center; color: var(--text-muted);">No custom subjects added yet.</p>`;
    } else {
        attendanceData.custom.forEach((course, index) => {
            if (course.weeklyHours === undefined) {
                course.weeklyHours = 3;
                course.totalWeeks = 14;
                course.hoursMissed = course.missed || 0;
            }
            container.appendChild(createAttendanceCard(course.code, course.name, course, 'custom', index));
        });
    }
}

window.createAttendanceCard = function(code, name, record, type, customIndex = null) {
    const card = document.createElement('div');
    card.className = 'card-section';
    card.style.marginBottom = '20px';

    // Core Math: Strictly uses your timetable data
    const totalWeeksForMath = type === 'custom' ? (record.totalWeeks || 14) : 14;
    const totalHoursForSemester = record.weeklyHours * totalWeeksForMath;
    const attendedHours = totalHoursForSemester - record.hoursMissed;
    const percentage = totalHoursForSemester === 0 ? 100 : ((attendedHours / totalHoursForSemester) * 100).toFixed(1);
    
    const isDanger = percentage < 80;
    const statusColor = isDanger ? 'var(--danger)' : 'var(--success)';

    // Math for Safe Skips (20% rule)
    const maxMissesAllowed = Math.floor(totalHoursForSemester * 0.2);
    const safeHoursLeft = maxMissesAllowed - record.hoursMissed;

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
                <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: bold;">${code}</span>
                <h3 style="margin: 5px 0 0 0; color: var(--text-main); font-size: 1.1rem;">${name}</h3>
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
                <button onclick="updateAttendance('${code}', '${type}', 'hoursMissed', -1, ${customIndex})" style="width: 35px; height: 35px; border-radius: 50%; border: 1px solid var(--danger); background: var(--input-bg); color: var(--danger); cursor: pointer; font-size: 1.2rem; font-weight: bold;">-</button>
                <span style="font-size: 1.5rem; font-weight: bold; color: var(--danger); width: 30px; text-align: center;">${record.hoursMissed}</span>
                <button onclick="updateAttendance('${code}', '${type}', 'hoursMissed', 1, ${customIndex})" style="width: 35px; height: 35px; border-radius: 50%; border: none; background: var(--danger); color: white; cursor: pointer; font-size: 1.2rem; font-weight: bold;">+</button>
            </div>
        </div>

        <div style="background: var(--bg-color); padding: 12px; border-radius: 8px; font-size: 0.9rem; color: var(--text-muted); text-align: center;">
            ${skipMessage}
        </div>
        
        ${type === 'custom' ? `<button onclick="deleteCustomSubject(${customIndex})" class="btn-delete" style="width: 100%; margin-top: 15px; padding: 10px; border-radius: 8px;">Remove Subject</button>` : ''}
    `;

    return card;
}

window.updateAttendance = function(code, type, field, change, customIndex) {
    let targetRecord;
    
    if (type === 'semester') {
        targetRecord = attendanceData.semester[code];
    } else {
        targetRecord = attendanceData.custom[customIndex];
    }

    targetRecord[field] += change;

    // Safety Checks
    if (targetRecord.hoursMissed < 0) targetRecord.hoursMissed = 0;
    
    const totalWeeksForMath = type === 'custom' ? (targetRecord.totalWeeks || 14) : 14;
    const maxHours = targetRecord.weeklyHours * totalWeeksForMath;
    if (targetRecord.hoursMissed > maxHours) targetRecord.hoursMissed = maxHours;

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
        hoursMissed: 0 
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
            attendanceData.semester[key].hoursMissed = 0;
        }
        attendanceData.custom.forEach(course => course.hoursMissed = 0);
        
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

const targetMarksData = {
    // IT Subjects (RIS)
    "BMCS2003": { final: 30, cw: [{id: "c1", name: "Test", w: 28}, {id: "c2", name: "Assignment", w: 42}] },
    "BMIT2023": { final: 30, cw: [{id: "c1", name: "Test", w: 14}, {id: "c2", name: "Assignment", w: 56}] },
    "BMIT2083": { final: 50, cw: [{id: "c1", name: "Assignment", w: 25}, {id: "c2", name: "Written Test", w: 20}, {id: "c3", name: "Quiz", w: 5}] },
    "BMIT3173": { final: 30, cw: [{id: "c1", name: "Quiz", w: 7}, {id: "c2", name: "Assignment", w: 63}] },
    "MPU-3133": { final: 0,  cw: [{id: "c1", name: "Tugasan Bertulis", w: 30}, {id: "c2", name: "Pembentangan", w: 30}, {id: "c3", name: "Ujian", w: 40}] },
    "MPU-34E2": { final: 0,  cw: [{id: "c1", name: "Continuous Assessment", w: 100}] },
    
    // Finance Subjects (RFI)
    "BBMF3033": { final: 50, cw: [{id: "c1", name: "Assignment", w: 35}, {id: "c2", name: "Test", w: 15}] },
    "BBMF3023": { final: 50, cw: [{id: "c1", name: "Assignment", w: 20}, {id: "c2", name: "Individual Test", w: 30}] },
    "BBMF3173": { final: 50, cw: [{id: "c1", name: "Test", w: 20}, {id: "c2", name: "Assignment", w: 30}] },
    "BBBD3023": { final: 50, cw: [{id: "c1", name: "Test", w: 25}, {id: "c2", name: "Group Assignment", w: 25}] },
    "BBMF3304": { final: 50, cw: [{id: "c1", name: "Individual Test", w: 20}, {id: "c2", name: "Assignment", w: 30}] },
    "MPU-3202": { final: 0,  cw: [{id: "c1", name: "Proposal Writing", w: 30}, {id: "c2", name: "Project Presentation", w: 40}, {id: "c3", name: "Reflective Essay", w: 30}] },
    "MPU-34Q2": { final: 0,  cw: [{id: "c1", name: "Continuous Assessment", w: 100}] }
};

const gradingScale = [
    { grade: 'A', min: 80, color: 'var(--text-main)' },
    { grade: 'A-', min: 75, color: 'var(--text-main)' },
    { grade: 'B+', min: 70, color: 'var(--text-main)' },
    { grade: 'B', min: 65, color: 'var(--text-main)' },
    { grade: 'B-', min: 60, color: 'var(--text-main)' },
    { grade: 'C+', min: 55, color: 'var(--text-main)' },
    { grade: 'C', min: 50, color: 'var(--text-main)' }
];

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes('marks.html')) {
        initMarksTracker();
    }
});

window.initMarksTracker = async function() {
    const profileJSON = localStorage.getItem('studentProfile');
    if (!profileJSON || typeof myDatabase === 'undefined') return;

    const profile = JSON.parse(profileJSON);
    const courses = myDatabase.programmes[profile.programme].curriculum[profile.semester];
    const subjectSelect = document.getElementById('marks-subject');
    
    if (subjectSelect && courses) {
        subjectSelect.innerHTML = '<option value="">-- Choose Subject --</option>';
        
        // List of subject codes to hide from the Target Marks calculator
        const hiddenSubjects = ["MPU-34E2", "MPU-34Q2"]; 

        courses.forEach(course => {
            // If the course is Gym or Pickleball, skip it!
            if (hiddenSubjects.includes(course.code.toUpperCase())) {
                return; 
            }

            const option = document.createElement('option');
            option.value = course.code.toUpperCase();
            option.textContent = `${course.code}  ${course.name}`;
            subjectSelect.appendChild(option);
        });
    }
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

    const data = targetMarksData[subjCode];
    
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
        data.cw.forEach(comp => { html += createRatioInput(comp.id, comp.name, comp.w); });
    } else if (mode === 'mode-reverse') {
        html += `
            <div style="margin-bottom: 20px;">
                <label style="font-weight: bold; color: var(--primary); display: block; margin-bottom: 8px;">Find missing score for:</label>
                <select id="find-target" class="styled-select" onchange="renderInterfaceReverseInputs()">
                    ${data.cw.map(c => `<option value="${c.id}">${c.name} (Worth ${c.w}%)</option>`).join('')}
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

window.createRatioInput = function(id, name, weight) {
    return `
        <div style="margin-bottom: 15px; background: var(--bg-color); padding: 15px; border-radius: 8px; border: 1px solid var(--border);">
            <label style="font-size: 0.95rem; font-weight: bold; color: var(--text-main); display: block; margin-bottom: 10px;">
                ${name} <span style="color: var(--primary); font-size: 0.8rem; font-weight: normal; margin-left: 5px;">(Worth ${weight}% of total grade)</span>
            </label>
            <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 10px; align-items: center;">
                <input type="number" id="score-${id}" placeholder="Your Score" oninput="calculateDynamic()" class="styled-select" style="text-align: center;">
                <span style="color: var(--text-muted); font-weight: bold;">/</span>
                <input type="number" id="outof-${id}" value="${weight}" placeholder="Max" oninput="calculateDynamic()" class="styled-select" style="text-align: center;">
            </div>
        </div>
    `;
}

window.renderInterfaceReverseInputs = function() {
    const subjCode = document.getElementById('marks-subject').value;
    const data = targetMarksData[subjCode];
    const findTargetId = document.getElementById('find-target').value;
    const container = document.getElementById('reverse-inputs');

    let html = `<h4 style="margin: 0 0 15px 0; color: var(--primary);">Enter Known Scores</h4>`;
    
    if (findTargetId !== 'final' && data.final > 0) {
        html += createRatioInput('final', 'Final Exam', data.final);
    }

    data.cw.forEach(comp => {
        if (comp.id !== findTargetId) {
            html += createRatioInput(comp.id, comp.name, comp.w);
        }
    });

    container.innerHTML = html;
    calculateDynamic();
}

window.calculateDynamic = function() {
    const subjCode = document.getElementById('marks-subject').value;
    const mode = document.getElementById('calc-mode').value;
    const data = targetMarksData[subjCode];
    const resultContainer = document.getElementById('dynamic-result-container');

    let currentTotalWeightage = 0;
    let isMissingInputs = false;
    let targetComponentWeight = 0;
    let targetComponentName = "";

    if (mode === 'mode-final') {
        targetComponentWeight = data.final;
        targetComponentName = "Final Exam";
        
        data.cw.forEach(comp => {
            const score = parseFloat(document.getElementById(`score-${comp.id}`).value);
            const outof = parseFloat(document.getElementById(`outof-${comp.id}`).value);
            if (isNaN(score) || isNaN(outof) || outof === 0) isMissingInputs = true;
            else currentTotalWeightage += (score / outof) * comp.w;
        });
    } else if (mode === 'mode-reverse') {
        const findTargetId = document.getElementById('find-target').value;
        
        if (findTargetId === 'final') {
            targetComponentWeight = data.final;
            targetComponentName = "Final Exam";
        } else {
            const targetComp = data.cw.find(c => c.id === findTargetId);
            targetComponentWeight = targetComp.w;
            targetComponentName = targetComp.name;
        }

        if (findTargetId !== 'final' && data.final > 0) {
            const finalScore = parseFloat(document.getElementById(`score-final`).value);
            const finalOutof = parseFloat(document.getElementById(`outof-final`).value);
            if (isNaN(finalScore) || isNaN(finalOutof) || finalOutof === 0) isMissingInputs = true;
            else currentTotalWeightage += (finalScore / finalOutof) * data.final;
        }

        data.cw.forEach(comp => {
            if (comp.id !== findTargetId) {
                const score = parseFloat(document.getElementById(`score-${comp.id}`).value);
                const outof = parseFloat(document.getElementById(`outof-${comp.id}`).value);
                if (isNaN(score) || isNaN(outof) || outof === 0) isMissingInputs = true;
                else currentTotalWeightage += (score / outof) * comp.w;
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

    gradingScale.forEach(grade => {
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
                <span style="font-weight: bold; color: ${grade.color}; font-size: 1.1rem;">${grade.grade} <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: normal;">(> ${grade.min})</span></span>
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
   DISPLAY CURRENT PROFILE BADGE (GLOBAL)
============================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const savedProfileJSON = localStorage.getItem('studentProfile');
    const header = document.querySelector('header');
    
    // Check if we are on a tool page (skip the main dashboard)
    const isDashboard = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/');
    
    if (!isDashboard && header && savedProfileJSON && typeof myDatabase !== 'undefined') {
        const profile = JSON.parse(savedProfileJSON);
        const progData = myDatabase.programmes[profile.programme];
        
        if (progData) {
            const progTitle = progData.title;
            // Format the text to look like "Year 2 Sem 3"
            const semText = profile.semester ? ` • Year ${profile.semester.charAt(1)} Sem ${profile.semester.charAt(3)}` : '';

            // Create the badge element
            const badge = document.createElement('div');
            badge.style.cssText = "display: inline-block; background: var(--bg-color); color: var(--primary); padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; margin-top: 15px; border: 1px solid var(--primary); box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: center;";
            badge.textContent = progTitle + semText;
            
            // Inject it right at the bottom of the header
            header.appendChild(badge);
        }
    }
});