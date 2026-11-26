
/* =========================================
   ACADEX - STUDENT GRADE MANAGEMENT SYSTEM
   JAVASCRIPT
========================================= */

let students = [];
let editingId = null;

const MAX_STUDENTS = 20;
const PASSING_GRADE = 75;

/* =========================================
   PAGE NAVIGATION
========================================= */

function showPage(page) {

    document.querySelectorAll('.page').forEach(section => {
        section.classList.add('hidden');
    });

    document.getElementById(page).classList.remove('hidden');

    const titles = {
        dashboard: 'Dashboard',
        records: 'Student Records',
        add: editingId ? 'Edit Student' : 'Add Student',
        details: 'Student Details'
    };

    document.getElementById('pageTitle').textContent =
        titles[page] || 'Dashboard';

    if (page === 'dashboard') {
        updateDashboard();
    }

    if (page === 'records') {
        renderRecords();
    }
}

/* =========================================
   OPEN ADD STUDENT FORM
========================================= */

function openAddForm() {

    if (students.length >= MAX_STUDENTS) {
        alert('Maximum of 20 student records reached.');
        return;
    }

    resetForm();
    showPage('add');
}

/* =========================================
   CREATE QUIZ AND ACTIVITY INPUTS
========================================= */

function createInputs() {

    const periods = ['midterm', 'finals'];

    periods.forEach(period => {

        const quizContainer =
            document.getElementById(period + 'Quizzes');

        const activityContainer =
            document.getElementById(period + 'Activities');

        for (let i = 1; i <= 5; i++) {

            quizContainer.innerHTML += `
                <label for="${period}Q${i}">
                    Quiz ${i} (20 points)
                </label>

                <input
                    type="number"
                    id="${period}Q${i}"
                    min="0"
                    max="20"
                    step="0.01"
                    placeholder="Enter score"
                    required
                >
            `;

            activityContainer.innerHTML += `
                <label for="${period}A${i}">
                    Activity ${i} (30 points)
                </label>

                <input
                    type="number"
                    id="${period}A${i}"
                    min="0"
                    max="30"
                    step="0.01"
                    placeholder="Enter score"
                    required
                >
            `;
        }

    });
}

createInputs();

/* =========================================
   GET PERIOD SCORES
========================================= */

function getScores(period) {

    const quizzes = [];
    const activities = [];

    for (let i = 1; i <= 5; i++) {

        quizzes.push(
            Number(document.getElementById(
                period + 'Q' + i
            ).value)
        );

        activities.push(
            Number(document.getElementById(
                period + 'A' + i
            ).value)
        );

    }

    return {
        quizzes: quizzes,
        activities: activities,

        exam: Number(
            document.getElementById(period + 'Exam').value
        )
    };
}

/* =========================================
   CALCULATE PERIOD AVERAGE
========================================= */

function calculatePeriod(data) {

    const quizTotal =
        data.quizzes.reduce((total, score) => total + score, 0);

    const activityTotal =
        data.activities.reduce((total, score) => total + score, 0);

    const quizGrade =
        (quizTotal / 100) * 25;

    const activityGrade =
        (activityTotal / 150) * 25;

    const examinationGrade =
        (data.exam / 100) * 50;

    return Number(
        (quizGrade + activityGrade + examinationGrade).toFixed(2)
    );
}

/* =========================================
   VALIDATE SCORES
========================================= */

function validateScores(data) {

    const allScores = [
        ...data.midterm.quizzes,
        ...data.midterm.activities,
        data.midterm.exam,

        ...data.finals.quizzes,
        ...data.finals.activities,
        data.finals.exam
    ];

    if (allScores.some(score => !Number.isFinite(score))) {
        return false;
    }

    if (allScores.some(score => score < 0)) {
        return false;
    }

    if (
        data.midterm.quizzes.some(score => score > 20) ||
        data.finals.quizzes.some(score => score > 20)
    ) {
        return false;
    }

    if (
        data.midterm.activities.some(score => score > 30) ||
        data.finals.activities.some(score => score > 30)
    ) {
        return false;
    }

    if (
        data.midterm.exam > 100 ||
        data.finals.exam > 100
    ) {
        return false;
    }

    return true;
}

/* =========================================
   SAFE HTML TEXT
========================================= */

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => {

        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return entities[character];
    });
}

/* =========================================
   RESET FORM
========================================= */

function resetForm() {

    document.getElementById('studentForm').reset();

    document.getElementById('studentId').readOnly = false;

    document.getElementById('formTitle').textContent =
        'Add Student Record';

    document.getElementById('saveButton').textContent =
        'Save Student';

    editingId = null;
}

/* =========================================
   CANCEL FORM
========================================= */

function cancelForm() {

    resetForm();
    showPage('records');
}

/* =========================================
   ADD OR UPDATE STUDENT
========================================= */

document.getElementById('studentForm').addEventListener(
    'submit',
    function(event) {

        event.preventDefault();

        const id = document.getElementById('studentId')
            .value.trim();

        const name = document.getElementById('studentName')
            .value.trim();

        /* VALIDATE STUDENT ID */

        if (!/^139\d{4}$/.test(id)) {

            alert(
                'Student ID must contain exactly 7 digits and start with 139.'
            );

            return;
        }

        /* CHECK DUPLICATE ID */

        const duplicate = students.some(student =>
            student.id === id && student.id !== editingId
        );

        if (duplicate) {

            alert('This Student ID is already registered.');

            return;
        }

        /* VALIDATE NAME */

        if (!name) {

            alert('Please enter the student name.');

            return;
        }

        /* CHECK STUDENT LIMIT */

        if (!editingId && students.length >= MAX_STUDENTS) {

            alert('Maximum of 20 student records reached.');

            return;
        }

        /* GET SCORES */

        const midterm = getScores('midterm');
        const finals = getScores('finals');

        const scoreData = {
            midterm: midterm,
            finals: finals
        };

        /* VALIDATE SCORES */

        if (!validateScores(scoreData)) {

            alert(
                'Please enter valid scores within the specified maximum points.'
            );

            return;
        }

        /* COMPUTE MIDTERM AND FINALS */

        const midtermAverage = calculatePeriod(midterm);
        const finalsAverage = calculatePeriod(finals);

        /* COMPUTE FIRST SEMESTER AVERAGE */

        const firstSemesterAverage = Number(
            ((midtermAverage + finalsAverage) / 2).toFixed(2)
        );

        /* DETERMINE REMARKS */

        const remarks =
            firstSemesterAverage >= PASSING_GRADE
                ? 'PASSED'
                : 'FAILED';

        /* CREATE STUDENT OBJECT */

        const student = {

            id: id,
            name: name,

            midterm: midterm,
            finals: finals,

            midtermAverage: midtermAverage,
            finalsAverage: finalsAverage,

            firstSemesterAverage: firstSemesterAverage,

            remarks: remarks

        };

        /* UPDATE EXISTING STUDENT */

        if (editingId !== null) {

            const index = students.findIndex(
                s => s.id === editingId
            );

            if (index !== -1) {
                students[index] = student;
            }

        }

        /* ADD NEW STUDENT */

        else {

            students.push(student);

        }

        alert('Student record successfully saved!');

        resetForm();

        updateDashboard();
        renderRecords();

        showPage('records');

    }
);

/* =========================================
   UPDATE DASHBOARD
========================================= */

function updateDashboard() {

    const total = students.length;

    const average = total > 0
        ? students.reduce(
            (sum, student) =>
                sum + student.firstSemesterAverage,
            0
        ) / total
        : 0;

    const passed = students.filter(
        student => student.remarks === 'PASSED'
    ).length;

    const failed = students.filter(
        student => student.remarks === 'FAILED'
    ).length;

    document.getElementById('totalStudents').textContent =
        total;

    document.getElementById('classAverage').textContent =
        average.toFixed(2);

    document.getElementById('passedStudents').textContent =
        passed;

    document.getElementById('failedStudents').textContent =
        failed;

    /* RECENT RECORDS */

    const recent = students.slice(-5).reverse();

    document.getElementById('recentRecords').innerHTML =

        recent.map(student => `

            <tr>

                <td>${student.id}</td>

                <td>${escapeHTML(student.name)}</td>

                <td>${student.midtermAverage.toFixed(2)}</td>

                <td>${student.finalsAverage.toFixed(2)}</td>

                <td>
                    <strong>
                        ${student.firstSemesterAverage.toFixed(2)}
                    </strong>
                </td>

                <td>
                    <span class="${student.remarks.toLowerCase()}">
                        ${student.remarks}
                    </span>
                </td>

            </tr>

        `).join('') ||

        '<tr><td colspan="6">No records available.</td></tr>';

}

/* =========================================
   DISPLAY STUDENT RECORDS
========================================= */

function renderRecords() {

    const searchInput =
        document.getElementById('search');

    const search = searchInput
        ? searchInput.value.toLowerCase()
        : '';

    const filtered = students.filter(student =>

        student.name.toLowerCase().includes(search) ||
        student.id.includes(search)

    );

    document.getElementById('studentRecords').innerHTML =

        filtered.map(student => `

            <tr>

                <td>${student.id}</td>

                <td>${escapeHTML(student.name)}</td>

                <td>${student.midtermAverage.toFixed(2)}</td>

                <td>${student.finalsAverage.toFixed(2)}</td>

                <td>
                    <strong>
                        ${student.firstSemesterAverage.toFixed(2)}
                    </strong>
                </td>

                <td>
                    <span class="${student.remarks.toLowerCase()}">
                        ${student.remarks}
                    </span>
                </td>

                <td>

                    <button
                        class="action"
                        onclick="viewStudent('${student.id}')"
                    >
                        View
                    </button>

                    <button
                        class="action"
                        onclick="editStudent('${student.id}')"
                    >
                        Edit
                    </button>

                    <button
                        class="action delete"
                        onclick="deleteStudent('${student.id}')"
                    >
                        Delete
                    </button>

                </td>

            </tr>

        `).join('') ||

        '<tr><td colspan="7">No student records found.</td></tr>';

}

/* =========================================
   VIEW STUDENT DETAILS
========================================= */

function viewStudent(id) {

    const student = students.find(
        s => s.id === id
    );

    if (!student) return;

    function periodHTML(title, data, average, examLabel) {

        return `

            <div class="detail-section">

                <h3>${title}</h3>

                <h4>Quizzes</h4>

                ${data.quizzes.map((score, index) => `
                    <p>Quiz ${index + 1}: ${score}/20</p>
                `).join('')}

                <h4>Activities</h4>

                ${data.activities.map((score, index) => `
                    <p>Activity ${index + 1}: ${score}/30</p>
                `).join('')}

                <h4>${examLabel}</h4>

                <p>${data.exam}/100</p>

                <p>
                    <strong>
                        ${title} Average: ${average.toFixed(2)}
                    </strong>
                </p>

            </div>

        `;
    }

    document.getElementById('studentDetails').innerHTML = `

        <h2>${escapeHTML(student.name)}</h2>

        <p>Student ID: ${student.id}</p>

        ${periodHTML(
            'MIDTERM PERIOD',
            student.midterm,
            student.midtermAverage,
            'Midterm Examination'
        )}

        ${periodHTML(
            'FINALS PERIOD',
            student.finals,
            student.finalsAverage,
            'Final Examination'
        )}

        <div class="first-semester-summary">

            <h3>FIRST SEMESTER SUMMARY</h3>

            <p>
                Midterm Period Average:
                ${student.midtermAverage.toFixed(2)}
            </p>

            <p>
                Finals Period Average:
                ${student.finalsAverage.toFixed(2)}
            </p>

            <p>
                <strong>
                    First Semester Average:
                    ${student.firstSemesterAverage.toFixed(2)}
                </strong>
            </p>

            <p>
                Remarks:
                <strong>${student.remarks}</strong>
            </p>

        </div>

        <button onclick="showPage('records')">
            Back to Student Records
        </button>

    `;

    showPage('details');

}

/* =========================================
   EDIT STUDENT
========================================= */

function editStudent(id) {

    const student = students.find(
        s => s.id === id
    );

    if (!student) return;

    editingId = id;

    document.getElementById('studentId').value =
        student.id;

    document.getElementById('studentId').readOnly = true;

    document.getElementById('studentName').value =
        student.name;

    /* LOAD MIDTERM AND FINALS SCORES */

    ['midterm', 'finals'].forEach(period => {

        const data = student[period];

        data.quizzes.forEach((score, index) => {

            document.getElementById(
                period + 'Q' + (index + 1)
            ).value = score;

        });

        data.activities.forEach((score, index) => {

            document.getElementById(
                period + 'A' + (index + 1)
            ).value = score;

        });

        document.getElementById(period + 'Exam').value =
            data.exam;

    });

    document.getElementById('formTitle').textContent =
        'Edit Student Record';

    document.getElementById('saveButton').textContent =
        'Update Student';

    showPage('add');

}

/* =========================================
   DELETE STUDENT
========================================= */

function deleteStudent(id) {

    const confirmed = confirm(
        'Are you sure you want to delete this student record?'
    );

    if (!confirmed) return;

    students = students.filter(
        student => student.id !== id
    );

    updateDashboard();
    renderRecords();

    alert('Student record deleted successfully.');

}

/* =========================================
   INITIALIZE SYSTEM
========================================= */

updateDashboard();
renderRecords();
showPage('dashboard');
