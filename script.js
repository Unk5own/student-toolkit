let currentSemesterGPA = 0;
let currentSemesterCredits = 0;

// Tab Switching Logic
function openTab(tabName) {
    const contents = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-link');

    contents.forEach(content => content.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    // Find the button that was clicked and make it active
    event.currentTarget.classList.add('active');
}

// Add New Subject Row
function addRow() {
    const div = document.createElement('div');
    div.className = 'input-group';
    div.innerHTML = `
        <input type="text" placeholder="Course Name">
        <input type="number" class="credits" placeholder="Credits" min="1">
        <select class="grade">
            <option value="4.00">A</option>
            <option value="3.67">A-</option>
            <option value="3.33">B+</option>
            <option value="3.00">B</option>
            <option value="2.67">B-</option>
            <option value="2.33">C+</option>
            <option value="2.00">C</option>
            <option value="1.67">C-</option>
            <option value="1.00">D</option>
            <option value="0.00">F</option>
        </select>
    `;
    document.getElementById('course-list').appendChild(div);
}

// Calculate GPA
function calculateGPA() {
    const credits = document.querySelectorAll('.credits');
    const grades = document.querySelectorAll('.grade');

    let totalPoints = 0;
    let totalCredits = 0;

    for (let i = 0; i < credits.length; i++) {
        const creditVal = parseFloat(credits[i].value);
        const gradeVal = parseFloat(grades[i].value);

        if (!isNaN(creditVal)) {
            totalPoints += (creditVal * gradeVal);
            totalCredits += creditVal;
        }
    }

    if (totalCredits > 0) {
        const gpa = totalPoints / totalCredits;

        // Save these globally so the CGPA calculator can use them
        currentSemesterGPA = gpa;
        currentSemesterCredits = totalCredits;

        document.getElementById('gpa-score').innerText = gpa.toFixed(2);
    } else {
        alert("Please enter credits for at least one subject.");
    }
}

// Calculate CGPA
function calculateCGPA() {
    const prevCGPA = parseFloat(document.getElementById('prev-cgpa').value);
    const prevCredits = parseFloat(document.getElementById('prev-credits').value);

    // Check if the user ran the semester calculation first
    if (currentSemesterCredits === 0) {
        alert("Please calculate your Semester GPA first (in the first tab).");
        return;
    }

    if (isNaN(prevCGPA) || isNaN(prevCredits)) {
        alert("Please enter your previous CGPA and previous total credits.");
        return;
    }

    // Formula: (Old Points + New Points) / (Old Credits + New Credits)
    const oldTotalPoints = prevCGPA * prevCredits;
    const newTotalPoints = currentSemesterGPA * currentSemesterCredits;

    const totalPoints = oldTotalPoints + newTotalPoints;
    const totalCredits = prevCredits + currentSemesterCredits;

    const finalCGPA = totalPoints / totalCredits;

    document.getElementById('cgpa-score').innerText = finalCGPA.toFixed(2);
}