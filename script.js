
let students = [];
let editingId = null;
let sortDescending = true;

const MAX_STUDENTS = 20;

// CREATE SCORE INPUTS

function createInputs() {
    ["first", "second"].forEach(sem => {
        for (let i = 1; i <= 5; i++) {
            document.getElementById(sem + "Quizzes").innerHTML += `
                <label>Quiz ${i} (20 points)</label>
                <input type="number" id="${sem}Q${i}"
                       min="0" max="20" step="0.01" required>
            `;

            document.getElementById(sem + "Activities").innerHTML += `
                <label>Activity ${i} (30 points)</label>
                <input type="number" id="${sem}A${i}"
                       min="0" max="30" step="0.01" required>
            `;
        }
    });
}

createInputs();

// PAGE NAVIGATION

function showPage(page) {
    document.querySelectorAll(".page").forEach(p => {
        p.classList.add("hidden");
    });

    document.getElementById(page).classList.remove("hidden");

    const titles = {
        dashboard: "Dashboard",
        records: "Student Records",
        add: editingId ? "Edit Student" : "Add Student",
        details: "Student Details"
    };

    document.getElementById("pageTitle").textContent = titles[page];

    if (page === "dashboard" || page === "records") {
        updateDashboard();
        renderRecords();
    }
}

// PREPARE ADD FORM

function prepareAddForm() {
    if (editingId !== null) return;

    resetForm();

    document.getElementById("formTitle").textContent =
        "Add Student Record";

    document.getElementById("saveButton").textContent =
        "Save Student";
}

// RESET FORM

function resetForm() {
    document.getElementById("studentForm").reset();

    editingId = null;

    document.getElementById("formTitle").textContent =
        "Add Student Record";

    document.getElementById("saveButton").textContent =
        "Save Student";
}

// GET SCORES

function getScores(sem) {
    let quizzes = [];
    let activities = [];

    for (let i = 1; i <= 5; i++) {
        quizzes.push(
            Number(document.getElementById(sem + "Q" + i).value)
        );

        activities.push(
            Number(document.getElementById(sem + "A" + i).value)
        );
    }

    return {
        quizzes,
        activities,
        exam: Number(document.getElementById(sem + "Exam").value)
    };
}

// VALIDATE SCORES

function validScores(data) {
    return (
        data.quizzes.every(n => Number.isFinite(n) && n >= 0 && n <= 20) &&
        data.activities.every(n => Number.isFinite(n) && n >= 0 && n <= 30) &&
        Number.isFinite(data.exam) &&
        data.exam >= 0 &&
        data.exam <= 100
    );
}

// CALCULATE SEMESTER GRADE

function calculateSemester(data) {
    const quizTotal = data.quizzes.reduce((a, b) => a + b, 0);
    const activityTotal = data.activities.reduce((a, b) => a + b, 0);

    const quizGrade = (quizTotal / 100) * 25;
    const activityGrade = (activityTotal / 150) * 25;
    const examGrade = (data.exam / 100) * 50;

    return Number(
        (quizGrade + activityGrade + examGrade).toFixed(2)
    );
}

// SAVE STUDENT

document.getElementById("studentForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("studentName").value.trim();
    const id = document.getElementById("studentId").value.trim();

    if (!name) {
        alert("Please enter the student's full name.");
        return;
    }

    if (!/^139\d{4}$/.test(id)) {
        alert("Student ID must contain exactly 7 digits and start with 139.");
        return;
    }

    const duplicate = students.some(s =>
        s.id === id && s.id !== editingId
    );

    if (duplicate) {
        alert("This Student ID already exists.");
        return;
    }

    if (editingId === null && students.length >= MAX_STUDENTS) {
        alert("Maximum of 20 student records reached.");
        return;
    }

    const firstSem = getScores("first");
    const secondSem = getScores("second");

    if (!validScores(firstSem) || !validScores(secondSem)) {
        alert("Please enter valid scores within the specified maximum points.");
        return;
    }

    const firstAverage = calculateSemester(firstSem);
    const secondAverage = calculateSemester(secondSem);

    const generalAverage = Number(
        ((firstAverage + secondAverage) / 2).toFixed(2)
    );

    const student = {
        id,
        name,
        firstSem,
        secondSem,
        firstAverage,
        secondAverage,
        generalAverage,
        remarks: generalAverage >= 75 ? "PASSED" : "FAILED"
    };

    if (editingId !== null) {
        const index = students.findIndex(s => s.id === editingId);

        if (index !== -1) {
            students[index] = student;
        }

        alert("Student record successfully updated!");
    } else {
        students.push(student);

        alert("Student record successfully saved!");
    }

    resetForm();
    updateDashboard();
    renderRecords();
    showPage("records");
});

// UPDATE DASHBOARD

function updateDashboard() {
    const total = students.length;

    const average = total
        ? students.reduce((sum, s) => sum + s.generalAverage, 0) / total
        : 0;

    document.getElementById("totalStudents").textContent = total;

    document.getElementById("classAverage").textContent =
        average.toFixed(2);

    document.getElementById("passedStudents").textContent =
        students.filter(s => s.remarks === "PASSED").length;

    document.getElementById("failedStudents").textContent =
        students.filter(s => s.remarks === "FAILED").length;

    document.getElementById("recentRecords").innerHTML =
        students.slice(-5).reverse().map(s => `
            <tr>
                <td>${escapeHTML(s.id)}</td>
                <td>${escapeHTML(s.name)}</td>
                <td>${s.firstAverage.toFixed(2)}</td>
                <td>${s.secondAverage.toFixed(2)}</td>
                <td><b>${s.generalAverage.toFixed(2)}</b></td>
                <td>
                    <span class="${s.remarks.toLowerCase()}">
                        ${s.remarks}
                    </span>
                </td>
            </tr>
        `).join("") ||
        `<tr><td colspan="6">No records available.</td></tr>`;
}

// DISPLAY STUDENT RECORDS

function renderRecords() {
    const search = document.getElementById("search").value.toLowerCase();

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search) ||
        s.id.includes(search)
    );

    document.getElementById("studentRecords").innerHTML =
        filtered.map(s => `
            <tr>
                <td>${escapeHTML(s.id)}</td>
                <td>${escapeHTML(s.name)}</td>
                <td>${s.firstAverage.toFixed(2)}</td>
                <td>${s.secondAverage.toFixed(2)}</td>
                <td><b>${s.generalAverage.toFixed(2)}</b></td>
                <td>
                    <span class="${s.remarks.toLowerCase()}">
                        ${s.remarks}
                    </span>
                </td>
                <td>
                    <button class="action"
                        onclick="viewStudent('${s.id}')">View</button>

                    <button class="action"
                        onclick="editStudent('${s.id}')">Edit</button>

                    <button class="action delete"
                        onclick="deleteStudent('${s.id}')">Delete</button>
                </td>
            </tr>
        `).join("") ||
        `<tr><td colspan="7">No student records found.</td></tr>`;
}

// SEARCH AND SORT

function sortStudents() {
    sortDescending = !sortDescending;

    students.sort((a, b) =>
        sortDescending
            ? b.generalAverage - a.generalAverage
            : a.generalAverage - b.generalAverage
    );

    renderRecords();

    const button = document.querySelector(".secondary");

    button.textContent = sortDescending
        ? "Sort by General Average ↓"
        : "Sort by General Average ↑";
}

// VIEW STUDENT

function viewStudent(id) {
    const s = students.find(student => student.id === id);

    if (!s) return;

    function semesterHTML(title, sem, average) {
        return `
            <div class="detail-section">
                <h3>${title}</h3>

                <h4>Quizzes</h4>

                ${sem.quizzes.map((v, i) =>
                    `<p>Quiz ${i + 1}: ${v}/20</p>`
                ).join("")}

                <h4>Activities</h4>

                ${sem.activities.map((v, i) =>
                    `<p>Activity ${i + 1}: ${v}/30</p>`
                ).join("")}

                <p>Midterm Examination: ${sem.exam}/100</p>

                <p><b>Semester Average: ${average.toFixed(2)}</b></p>
            </div>
        `;
    }

    document.getElementById("studentDetails").innerHTML = `
        <h2>${escapeHTML(s.name)}</h2>

        <p>Student ID: ${escapeHTML(s.id)}</p>

        ${semesterHTML("First Semester", s.firstSem, s.firstAverage)}

        ${semesterHTML("Second Semester", s.secondSem, s.secondAverage)}

        <h3>General Average: ${s.generalAverage.toFixed(2)}</h3>

        <p>
            Remarks:
            <b class="${s.remarks.toLowerCase()}">${s.remarks}</b>
        </p>

        <button class="secondary" onclick="showPage('records')">
            Back to Student Records
        </button>
    `;

    showPage("details");
}

// EDIT STUDENT

function editStudent(id) {
    const s = students.find(student => student.id === id);

    if (!s) return;

    editingId = id;

    document.getElementById("studentName").value = s.name;
    document.getElementById("studentId").value = s.id;

    ["first", "second"].forEach((sem, index) => {
        const data = index === 0 ? s.firstSem : s.secondSem;

        data.quizzes.forEach((v, i) => {
            document.getElementById(sem + "Q" + (i + 1)).value = v;
        });

        data.activities.forEach((v, i) => {
            document.getElementById(sem + "A" + (i + 1)).value = v;
        });

        document.getElementById(sem + "Exam").value = data.exam;
    });

    document.getElementById("formTitle").textContent =
        "Edit Student Record";

    document.getElementById("saveButton").textContent =
        "Update Student";

    showPage("add");
}

// DELETE STUDENT

function deleteStudent(id) {
    const s = students.find(student => student.id === id);

    if (!s) return;

    if (confirm("Are you sure you want to delete " + s.name + "?")) {
        students = students.filter(student => student.id !== id);

        updateDashboard();
        renderRecords();

        alert("Student record successfully deleted.");
    }
}

// HTML SAFETY

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[c]);
}

// INITIAL DISPLAY

updateDashboard();
renderRecords();
