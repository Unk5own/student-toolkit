/* ==============================================================
   1. GLOBAL & THEME LOGIC
============================================================== */
window.onload = function() {
    loadTheme();
    
    // Auto-detect which page we are on to initialize the right tool
    if (document.getElementById('course-list')) {
        initGPACalculator();
    } else if (document.getElementById('default-attendance-list')) {
        initAttendanceTracker();
    }
};

function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('theme-toggle');
    if (body.getAttribute('data-theme') === 'dark') {
        body.setAttribute('data-theme', 'light');
        btn.innerText = '🌙 Dark Mode';
        localStorage.setItem('tarumt_theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        btn.innerText = '☀️ Light Mode';
        localStorage.setItem('tarumt_theme', 'dark');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('tarumt_theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    const btn = document.getElementById('theme-toggle');
    if(btn) btn.innerText = savedTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

function openTab(tabName, clickedBtn) {
    const contents = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-link');

    // Force hide all tabs and remove active states
    contents.forEach(content => content.style.display = 'none');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Force show the selected tab
    document.getElementById(tabName).style.display = 'block';
    
    // Add active state to the button
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    } else {
        // If triggered programmatically, find the correct button
        buttons.forEach(btn => {
            if(btn.getAttribute('onclick').includes(tabName)) btn.classList.add('active');
        });
    }
}

/* ==============================================================
   2. ATTENDANCE SKIP BANK LOGIC
============================================================== */
let attendanceData = [];

// Y2S2 Default Classes extracted from Timetable
const defaultAttendance = [
    { name: "BMIT3084 Enterprise Networking", L: 2, T: 1, P: 2, missed: 0, isCustom: false },
    { name: "BMIT2203 Human Computer Interaction", L: 2, T: 1, P: 1, missed: 0, isCustom: false },
    { name: "BMCS2053 Object-Oriented Analysis", L: 2, T: 1, P: 1, missed: 0, isCustom: false },
    { name: "BMIT3143 Digital Forensics", L: 2, T: 0, P: 2, missed: 0, isCustom: false },
    { name: "BMIT2183 Software Security", L: 2, T: 0, P: 2, missed: 0, isCustom: false },
    { name: "MPU-3232 Entrepreneurship", L: 1, T: 1, P: 0, missed: 0, isCustom: false }
];

function initAttendanceTracker() {
    const savedData = localStorage.getItem('tarumt_attendance');
    let parsedData = [];
    
    if (savedData) {
        parsedData = JSON.parse(savedData);
    }

    // Bulletproof check: Ensure all default Y2S2 subjects exist in the data
    const defaultNames = defaultAttendance.map(d => d.name);
    const existingNames = parsedData.map(p => p.name);

    defaultAttendance.forEach(defSub => {
        if (!existingNames.includes(defSub.name)) {
            parsedData.unshift(JSON.parse(JSON.stringify(defSub))); 
        }
    });

    // Safety check for older data to ensure tabs work correctly
    parsedData.forEach(sub => {
        if (typeof sub.isCustom === 'undefined') {
            sub.isCustom = !defaultNames.includes(sub.name);
        }
    });

    attendanceData = parsedData;
    localStorage.setItem('tarumt_attendance', JSON.stringify(attendanceData));
    
    renderAttendanceList();
}

function renderAttendanceList() {
    const defaultList = document.getElementById('default-attendance-list');
    const customList = document.getElementById('custom-attendance-list');
    
    if(!defaultList || !customList) return; 
    
    defaultList.innerHTML = '';
    customList.innerHTML = '';

    let customCount = 0;

    attendanceData.forEach((sub, index) => {
        const weeks = sub.weeks || 14; 
        
        const weeklyHours = sub.L + sub.T + sub.P;
        const totalSemesterHours = weeklyHours * weeks;
        const requiredHours = Math.ceil(totalSemesterHours * 0.8);
        const maxSkips = totalSemesterHours - requiredHours;
        const skipsLeft = maxSkips - sub.missed;

        // Calculate the current percentage
        const attendedHours = totalSemesterHours - sub.missed;
        const currentPercent = ((attendedHours / totalSemesterHours) * 100).toFixed(2);
        
        // Determine percentage color (Green for safe, Red for danger)
        const percentColor = currentPercent >= 80 ? "var(--success)" : "var(--danger)";

        let statusColor = "var(--success)";
        let statusText = "SAFE SKIPS";
        
        if (skipsLeft === 0) {
            statusColor = "orange";
            statusText = "ZERO LEFT";
        } else if (skipsLeft < 0) {
            statusColor = "var(--danger)";
            statusText = "BARRED";
        }

        const card = document.createElement('div');
        card.className = 'attendance-card';
        card.innerHTML = `
            <div class="att-info">
                <h3>${sub.name}</h3>
                <div class="att-breakdown" style="line-height: 1.6;">
                    <strong>Weekly:</strong> L(${sub.L}h) | T(${sub.T}h) | P(${sub.P}h)<br>
                    <strong>Total:</strong> ${totalSemesterHours}h <em>(${weeks} weeks)</em><br>
                    <strong>Current Attendance:</strong> <span style="color: ${percentColor}; font-weight: bold; font-size: 1.05rem;">${currentPercent}%</span>
                </div>
                ${sub.isCustom ? `<br><button class="btn-delete" onclick="deleteSubject(${index})">Delete</button>` : ''}
            </div>
            
            <div class="att-missed">
                <label>Hours Missed</label>
                <input type="number" min="0" value="${sub.missed}" onchange="updateMissed(${index}, this.value)">
            </div>
            
            <div class="att-status" style="border-color: ${statusColor}; color: ${statusColor};">
                <h1>${skipsLeft}</h1>
                <span>${statusText}</span>
            </div>
        `;

        if (sub.isCustom) {
            customList.appendChild(card);
            customCount++;
        } else {
            defaultList.appendChild(card);
        }
    });

    if (customCount === 0) {
        customList.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding: 20px;">No custom subjects added yet.</p>';
    }
}

function updateMissed(index, value) {
    let missedVal = parseInt(value) || 0;
    if (missedVal < 0) missedVal = 0;
    
    attendanceData[index].missed = missedVal;
    localStorage.setItem('tarumt_attendance', JSON.stringify(attendanceData));
    renderAttendanceList();
}

function addCustomAttendanceSubject() {
    const name = document.getElementById('new-sub-name').value;
    const L = parseInt(document.getElementById('new-sub-L').value) || 0;
    const T = parseInt(document.getElementById('new-sub-T').value) || 0;
    const P = parseInt(document.getElementById('new-sub-P').value) || 0;
    const W = parseInt(document.getElementById('new-sub-W').value); // Get total weeks

    // Validation: Require Name, at least 1 hour, AND Total Weeks
    if (!name || (L === 0 && T === 0 && P === 0)) {
        alert("Please enter a subject name and at least 1 hour of class time.");
        return;
    }
    if (!W || W <= 0) {
        alert("Please enter the Total Weeks for this subject.");
        return;
    }

    attendanceData.push({ name: name, L: L, T: T, P: P, missed: 0, isCustom: true, weeks: W });
    localStorage.setItem('tarumt_attendance', JSON.stringify(attendanceData));
    
    // Clear inputs
    document.getElementById('new-sub-name').value = '';
    document.getElementById('new-sub-L').value = '';
    document.getElementById('new-sub-T').value = '';
    document.getElementById('new-sub-P').value = '';
    document.getElementById('new-sub-W').value = ''; // Clears the weeks input
    
    renderAttendanceList();
    openTab('custom-tab');
}

function deleteSubject(index) {
    // 1-Click Delete (No confirmation popup)
    attendanceData.splice(index, 1);
    localStorage.setItem('tarumt_attendance', JSON.stringify(attendanceData));
    renderAttendanceList();
}

function resetAttendance() {
    if(confirm("Restore default Y2S2 subjects and clear all missed hours?")) {
        localStorage.removeItem('tarumt_attendance');
        location.reload();
    }
}

/* ==============================================================
   3. GPA & CGPA CALCULATOR LOGIC
============================================================== */
// Exact RIS Syllabus Mapping
const syllabus = {
    "Y1S1": [{ name: "Systems Analysis and Design", credits: 3 }, { name: "English for Tertiary Studies", credits: 3 }, { name: "Penghayatan Etika dan Peradaban", credits: 3 }],
    "Y1S2": [{ name: "Problem Solving and Programming", credits: 3 }, { name: "Database Management", credits: 3 }, { name: "Computer Organisation and Architecture", credits: 3 }, { name: "IT Fundamentals", credits: 3 }],
    "Y1S3": [{ name: "Object-Oriented Programming", credits: 3 }, { name: "Operating Systems", credits: 3 }, { name: "Fundamentals of Computer Networks", credits: 4 }, { name: "Web Design and Development", credits: 3 }, { name: "Integrity and Anti-Corruption", credits: 2 }],
    "Y2S1": [{ name: "Discrete Structures", credits: 3 }, { name: "Introduction to Internet Security", credits: 3 }, { name: "Switching and Routing Technologies", credits: 4 }],
    "Y2S2": [{ name: "Object-Oriented Analysis and Design", credits: 3 }, { name: "Human Computer Interaction", credits: 3 }, { name: "Enterprise Networking", credits: 4 }, { name: "Software Security", credits: 3 }, { name: "Digital Forensics", credits: 3 }, { name: "Elective Course EGU2", credits: 2 }],
    "Y2S3": [{ name: "Co-Curricular", credits: 2 }, { name: "Artificial Intelligence", credits: 3 }, { name: "Integrative Programming", credits: 3 }, { name: "Web and Mobile Systems", credits: 3 }, { name: "Information Assurance and Security", credits: 3 }, { name: "Falsafah dan Isu Semasa", credits: 3 }, { name: "Academic English", credits: 3 }],
    "Y3S1": [{ name: "Project I", credits: 4 }, { name: "Cloud Computing", credits: 3 }, { name: "Information Technology Infrastructure", credits: 3 }],
    "Y3S2": [{ name: "Project II", credits: 4 }, { name: "Advanced Database Management", credits: 3 }, { name: "Vulnerability Assessment and Penetration Testing", credits: 3 }, { name: "Systems Administration", credits: 3 }, { name: "Software Project Management", credits: 3 }, { name: "English for Career Preparation", credits: 3 }],
    "Y3S3": [{ name: "Industrial Training", credits: 10 }]
};

let currentSemesterGPA = 0;
let currentSemesterCredits = 0;

function initGPACalculator() {
    const savedYear = localStorage.getItem('tarumt_year');
    const savedSem = localStorage.getItem('tarumt_sem');
    if(savedYear) document.getElementById('year-select').value = savedYear;
    if(savedSem) document.getElementById('sem-select').value = savedSem;
    
    loadTermSubjects();
    loadCGPAData();
}

function loadTermSubjects() {
    const year = document.getElementById('year-select').value;
    const sem = document.getElementById('sem-select').value;
    const termKey = year + sem;
    
    localStorage.setItem('tarumt_year', year);
    localStorage.setItem('tarumt_sem', sem);
    
    const courseListDiv = document.getElementById('course-list');
    if(!courseListDiv) return;
    courseListDiv.innerHTML = ''; 
    
    const subjects = syllabus[termKey] || [];
    
    if (subjects.length === 0) {
        courseListDiv.innerHTML = '<p style="text-align:center; color:var(--text-muted);">No syllabus data available.</p>';
        return;
    }

    subjects.forEach((sub) => {
        const div = document.createElement('div');
        div.className = 'input-group';
        div.innerHTML = `
            <div class="subject-name">${sub.name}</div>
            <input type="number" class="credits" value="${sub.credits}" readonly style="background: transparent; border: none; font-weight: bold; text-align: center;">
            <select class="grade">
                <option value="4.00">A+ / A (4.00)</option>
                <option value="3.67">A- (3.67)</option>
                <option value="3.33">B+ (3.33)</option>
                <option value="3.00">B (3.00)</option>
                <option value="2.67">B- (2.67)</option>
                <option value="2.33">C+ (2.33)</option>
                <option value="2.00">C (2.00)</option>
                <option value="0.00">F (0.00)</option>
            </select>
        `;
        courseListDiv.appendChild(div);
    });
}

function calculateGPA() {
    const credits = document.querySelectorAll('.credits');
    const grades = document.querySelectorAll('.grade');
    if(credits.length === 0) return;

    let totalPoints = 0, totalCredits = 0;
    for (let i = 0; i < credits.length; i++) {
        const creditVal = parseFloat(credits[i].value);
        const gradeVal = parseFloat(grades[i].value);
        totalPoints += (creditVal * gradeVal);
        totalCredits += creditVal;
    }

    if (totalCredits > 0) {
        currentSemesterGPA = totalPoints / totalCredits;
        currentSemesterCredits = totalCredits;
        document.getElementById('gpa-score').innerText = currentSemesterGPA.toFixed(4);
    }
}

function calculateCGPA() {
    const prevCGPA = parseFloat(document.getElementById('prev-cgpa').value);
    const prevCredits = parseFloat(document.getElementById('prev-credits').value);

    if (currentSemesterCredits === 0) {
        alert("Calculate your Semester GPA first!");
        return;
    }
    if (isNaN(prevCGPA) || isNaN(prevCredits) || prevCredits < 0 || prevCGPA < 0) {
        alert("Enter valid previous CGPA and credits.");
        return;
    }

    const totalPoints = (prevCGPA * prevCredits) + (currentSemesterGPA * currentSemesterCredits);
    const totalCredits = prevCredits + currentSemesterCredits;
    document.getElementById('cgpa-score').innerText = (totalPoints / totalCredits).toFixed(4);
}

function saveCGPAData() {
    localStorage.setItem('tarumt_prev_cgpa', document.getElementById('prev-cgpa').value);
    localStorage.setItem('tarumt_prev_credits', document.getElementById('prev-credits').value);
}

function loadCGPAData() {
    document.getElementById('prev-cgpa').value = localStorage.getItem('tarumt_prev_cgpa') || '';
    document.getElementById('prev-credits').value = localStorage.getItem('tarumt_prev_credits') || '';
}

function resetAll() {
    if(confirm("Clear all GPA selections?")) {
        localStorage.removeItem('tarumt_year');
        localStorage.removeItem('tarumt_sem');
        localStorage.removeItem('tarumt_prev_cgpa');
        localStorage.removeItem('tarumt_prev_credits');
        location.reload();
    }
}