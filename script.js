let students = [];
let editingId = null;

// SHOW PAGES
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => {
        p.classList.add('hidden');
    });

    document.getElementById(page).classList.remove('hidden');

    const titles = {
        dashboard: 'Dashboard',
        records: 'Student Records',
        add: editingId ? 'Edit Student' : 'Add Student',
        details: 'Student Details'
    };

    document.getElementById('pageTitle').textContent = titles[page];

    if (page === 'dashboard' || page === 'records') {
        updateDashboard();
        renderRecords();
    }
}

// CREATE QUIZ AND ACTIVITY INPUTS
function createInputs() {
    ['midterm', 'finals'].forEach(period => {

        for (let i = 1; i <= 5; i++) {
            document.getElementById(period + 'Quizzes').innerHTML += `
                <label>Quiz ${i} (20 points)</label>
                <input
                    type="number"
                    id="${period}Q${i}"
                    min="0"
                    max="20"
                    step="0.01"
                    required
                >
            `;

            document.getElementById(period + 'Activities').innerHTML += `
                <label>Activity ${i} (30 points)</label>
                <input
                    type="number"
                    id="${period}A${i}"
                    min="0"
                    max="30"
                    step="0.01"
                    required
                >
            `;
        }
    });
}

createInputs();

// GET STUDENT SCORES
function getScores(period) {
    const quizzes = [];
    const activities = [];

    for (let i = 1; i <= 5; i++) {
        quizzes.push(
            Number(document.getElementById(period + 'Q' + i).value)
        );

        activities.push(
            Number(document.getElementById(period + 'A' + i).value)
        );
    }

    return {
        quizzes,
        activities,
        exam: Number(document.getElementById(period + 'Exam').value)
    };
}

// CALCULATE MIDTERM OR FINALS AVERAGE
function calculatePeriod(data) {
    const quizTotal = data.quizzes.reduce((a, b) => a + b, 0);
    const activityTotal = data.activities.reduce((a, b) => a + b, 0);

    return Number((
        (quizTotal / 100) * 25 +
        (activityTotal / 150) * 25 +
        (data.exam / 100) * 50
    ).toFixed(2));
}

// PREVENT HTML INJECTION IN STUDENT NAMES
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));
}

// RESET FORM
function resetForm() {
    document.getElementById('studentForm').reset();

    document.getElementById('formTitle').textContent =
        'Add Student Record';

    document.getElementById('saveButton').textContent =
        'Save Student';

    editingId = null;
}

// CANCEL FORM
function cancelForm() {
    resetForm();
    showPage('records');
}

// ADD OR UPDATE STUDENT
document.getElementById('studentForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const id = document.getElementById('studentId').value.trim();
    const name = document.getElementById('studentName').value.trim();

    // VALIDATE STUDENT ID
    if (!/^139\d{4}$/.test(id)) {
        alert('Student ID must contain exactly 7 digits and start with 139.');
        return;
    }

    // CHECK DUPLICATE ID
    if (students.some(s => s.id === id && s.id !== editingId)) {
        alert('This Student ID is already registered.');
        return;
    }

    if (!name) {
        alert('Please enter the student name.');
        return;
    }

    // GET MIDTERM AND FINALS SCORES
    const midterm = getScores('midterm');
    const finals = getScores('finals');

    const allScores = [
        ...midterm.quizzes,
        ...midterm.activities,
        midterm.exam,
        ...finals.quizzes,
        ...finals.activities,
        finals.exam
    ];

    // VALIDATE SCORES
    if (
        allScores.some(n => !Number.isFinite(n) || n < 0) ||
        midterm.quizzes.some(n => n > 20) ||
        finals.quizzes.some(n => n > 20) ||
        midterm.activities.some(n => n > 30) ||
        finals.activities.some(n => n > 30) ||
        midterm.exam > 100 ||
        finals.exam > 100
    ) {
        alert('Please enter valid scores within the specified maximum points.');
        return;
    }

    // COMPUTE PERIOD AVERAGES
    const midtermAverage = calculatePeriod(midterm);
    const finalsAverage = calculatePeriod(finals);

    // COMPUTE FIRST SEMESTER AVERAGE
    const firstSemesterAverage = Number(
        ((midtermAverage + finalsAverage) / 2).toFixed(2)
    );

    // DETERMINE REMARKS
    const student = {
        id,
        name,
        midterm,
        finals,
        midtermAverage,
        finalsAverage,
        firstSemesterAverage,
        remarks: firstSemesterAverage >= 75 ? 'PASSED' : 'FAILED'
    };

    // UPDATE EXISTING STUDENT
    if (editingId) {
        const index = students.findIndex(s => s.id === editingId);

        if (index !== -1) {
            students[index] = student;
        }
    }

    // ADD NEW STUDENT
    else {
        students.push(student);
    }

    resetForm();

    alert(
        'Student record successfully saved!\nStudent ID: ' + student.id
    );

    updateDashboard();
    renderRecords();
    showPage('records');
});

// UPDATE DASHBOARD
function updateDashboard() {
    const total = students.length;

    const average = total
        ? students.reduce((sum, s) => sum + s.firstSemesterAverage, 0) / total
        : 0;

    document.getElementById('totalStudents').textContent = total;

    document.getElementById('classAverage').textContent =
        average.toFixed(2);

    document.getElementById('passedStudents').textContent =
        students.filter(s => s.remarks === 'PASSED').length;

    document.getElementById('failedStudents').textContent =
        students.filter(s => s.remarks === 'FAILED').length;

    document.getElementById('recentRecords').innerHTML =
        students.slice(-5).reverse().map(s => `
            <tr>
                <td>${s.id}</td>
                <td>${escapeHTML(s.name)}</td>
                <td>${s.midtermAverage.toFixed(2)}</td>
                <td>${s.finalsAverage.toFixed(2)}</td>
                <td><b>${s.firstSemesterAverage.toFixed(2)}</b></td>
                <td>
                    <span class="${s.remarks.toLowerCase()}">
                        ${s.remarks}
                    </span>
                </td>
            </tr>
        `).join('') ||
        '<tr><td colspan="6">No records available.</td></tr>';
}

// DISPLAY STUDENT RECORDS
function renderRecords() {
    const search = document.getElementById('search').value.toLowerCase();

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search) ||
        s.id.includes(search)
    );

    document.getElementById('studentRecords').innerHTML =
        filtered.map(s => `
            <tr>
                <td>${s.id}</td>
                <td>${escapeHTML(s.name)}</td>
                <td>${s.midtermAverage.toFixed(2)}</td>
                <td>${s.finalsAverage.toFixed(2)}</td>
                <td><b>${s.firstSemesterAverage.toFixed(2)}</b></td>
                <td>
                    <span class="${s.remarks.toLowerCase()}">
                        ${s.remarks}
                    </span>
                </td>
                <td>
                    <button class="action" onclick="viewStudent('${s.id}')">
                        View
                    </button>

                    <button class="action" onclick="editStudent('${s.id}')">
                        Edit
                    </button>

                    <button class="action delete" onclick="deleteStudent('${s.id}')">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('') ||
        '<tr><td colspan="7">No student records found.</td></tr>';
}

// VIEW STUDENT DETAILS
function viewStudent(id) {
    const s = students.find(x => x.id === id);

    if (!s) return;

    function periodHTML(title, data, average, label) {
        return `
            <div class="detail-section">
                <h3>${title}</h3>

                <h4>Quizzes</h4>

                ${data.quizzes.map((v, i) => `
                    <p>Quiz ${i + 1}: ${v}/20</p>
                `).join('')}

                <h4>Activities</h4>

                ${data.activities.map((v, i) => `
                    <p>Activity ${i + 1}: ${v}/30</p>
                `).join('')}

                <p>${label}: ${data.exam}/100</p>

                <p>
                    <b>${title} Average: ${average.toFixed(2)}</b>
                </p>
            </div>
        `;
    }

    document.getElementById('studentDetails').innerHTML = `
        <h2>${escapeHTML(s.name)}</h2>

        <p>Student ID: ${s.id}</p>

        ${periodHTML(
            'First Semester — Midterm',
            s.midterm,
            s.midtermAverage,
            'Midterm Examination'
        )}

        ${periodHTML(
            'First Semester — Finals',
            s.finals,
            s.finalsAverage,
            'Final Examination'
        )}

        <h3>
            First Semester Average:
            ${s.firstSemesterAverage.toFixed(2)}
        </h3>

        <p>Remarks: <b>${s.remarks}</b></p>

        <button onclick="showPage('records')">Back</button>
    `;

    showPage('details');
}

// EDIT STUDENT
function editStudent(id) {
    const s = students.find(x => x.id === id);

    if (!s) return;

    editingId = id;

    document.getElementById('studentId').value = s.id;
    document.getElementById('studentName').value = s.name;

    ['midterm', 'finals'].forEach(period => {
        const data = s[period];

        data.quizzes.forEach((v, i) => {
            document.getElementById(
                period + 'Q' + (i + 1)
            ).value = v;
        });

        data.activities.forEach((v, i) => {
            document.getElementById(
                period + 'A' + (i + 1)
            ).value = v;
        });

        document.getElementById(period + 'Exam').value = data.exam;
    });

    document.getElementById('formTitle').textContent =
        'Edit Student Record';

    document.getElementById('saveButton').textContent =
        'Update Student';

    showPage('add');
}

// DELETE STUDENT
function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student record?')) {
        students = students.filter(s => s.id !== id);

        updateDashboard();
        renderRecords();
    }
}

// INITIALIZE DASHBOARD
showPage('dashboard');
