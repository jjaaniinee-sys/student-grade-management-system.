const MAX_STUDENTS = 20;
const PASSING_GRADE = 75;

let students = JSON.parse(localStorage.getItem("acadexStudents") || "[]");
let editingId = null;

function saveData() {
    localStorage.setItem("acadexStudents", JSON.stringify(students));
}

function showPage(page) {
    document.querySelectorAll(".page").forEach(p =>
        p.classList.add("hidden")
    );

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

// CREATE SCORE INPUTS

function createInputs() {
    ["first", "second"].forEach(sem => {
        for (let i = 1; i <= 5; i++) {
            document.getElementById(sem + "Quizzes")
                .insertAdjacentHTML("beforeend", `
                    <label for="${sem}Q${i}">
                        Quiz ${i} (20 points)
                    </label>
                    <input type="number"
                        id="${sem}Q${i}"
                        min="0" max="20"
                        step="0.01" required>
                `);

            document.getElementById(sem + "Activities")
                .insertAdjacentHTML("beforeend", `
                    <label for="${sem}A${i}">
                        Activity ${i} (30 points)
                    </label>
                    <input type="number"
                        id="${sem}A${i}"
                        min="0" max="30"
                        step="0.01" required>
                `);
        }
    });
}

createInputs();

// READ SEMESTER SCORES

function readSemester(sem) {
    const quizzes = [];
    const activities = [];

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

// CALCULATE SEMESTER GRADE

function calculateSemester(data) {
    const q = data.quizzes.reduce((a, b) => a + b, 0);
    const a = data.activities.reduce((x, y) => x + y, 0);

    return Number((
        (q / 100) * 25 +
        (a / 150) * 25 +
        (data.exam / 100) * 50
    ).toFixed(2));
}

// VALIDATE SCORES

function validScores(one, two) {
    return [one, two].every(s =>
        s.quizzes.every(x =>
            Number.isFinite(x) && x >= 0 && x <= 20
        ) &&
        s.activities.every(x =>
            Number.isFinite(x) && x >= 0 && x <= 30
        ) &&
        Number.isFinite(s.exam) &&
        s.exam >= 0 && s.exam <= 100
    );
}

// RESET FORM

function resetForm() {
    document.getElementById("studentForm").reset();

    editingId = null;

    document.getElementById("studentId").readOnly = false;

    document.getElementById("formTitle").textContent =
        "Add Student Record";

    document.getElementById("saveButton").textContent =
        "Save Student";
}

function prepareAddForm() {
    if (!editingId) resetForm();
}

// SAVE STUDENT

document.getElementById("studentForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    const name = document.getElementById("studentName")
        .value.trim();

    const id = document.getElementById("studentId")
        .value.trim();

    if (!name) {
        alert("Please enter the student's full name.");
        return;
    }

    if (!/^139\d{4}$/.test(id)) {
        alert("Student ID must contain exactly 7 digits and begin with 139.");
        return;
    }

    if (!editingId && students.some(s => s.id === id)) {
        alert("This Student ID already exists.");
        return;
    }

    const firstSem = readSemester("first");
    const secondSem = readSemester("second");

    if (!validScores(firstSem, secondSem)) {
        alert("Please enter scores within the allowed maximum points.");
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
        remarks: generalAverage >= PASSING_GRADE
            ? "PASSED"
            : "FAILED"
    };

    if (editingId) {
        const i = students.findIndex(s => s.id === editingId);

        if (i >= 0) {
            students[i] = student;
        }
    } else {
        if (students.length >= MAX_STUDENTS) {
            alert("The system can store only 20 student records.");
            return;
        }

        students.push(student);
    }

    saveData();

    alert("Student record saved successfully!\nStudent ID: " + id);

    resetForm();
    showPage("records");
});

// DASHBOARD

function updateDashboard() {
    const total = students.length;

    const avg = total
        ? students.reduce((sum, s) =>
            sum + s.generalAverage, 0) / total
        : 0;

    document.getElementById("totalStudents").textContent = total;

    document.getElementById("classAverage").textContent =
        avg.toFixed(2);

    document.getElementById("passedStudents").textContent =
        students.filter(s => s.remarks === "PASSED").length;

    document.getElementById("failedStudents").textContent =
        students.filter(s => s.remarks === "FAILED").length;

    document.getElementById("recentRecords").innerHTML =
        [...students].slice(-5).reverse().map(s => `
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
        '<tr><td colspan="6">No records available.</td></tr>';
}

// DISPLAY AND SEARCH RECORDS

function renderRecords() {
    const box = document.getElementById("search");

    const term = box
        ? box.value.toLowerCase().trim()
        : "";

    const result = students.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.id.includes(term)
    );

    document.getElementById("studentRecords").innerHTML =
        result.map(s => `
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
                        onclick="viewStudent('${s.id}')">
                        View
                    </button>

                    <button class="action"
                        onclick="editStudent('${s.id}')">
                        Edit
                    </button>

                    <button class="action delete"
                        onclick="deleteStudent('${s.id}')">
                        Delete
                    </button>
                </td>
            </tr>
        `).join("") ||
        '<tr><td colspan="7">No student records found.</td></tr>';
}

// BUBBLE SORT

function sortStudents() {
    for (let i = 0; i < students.length - 1; i++) {
        for (let j = 0; j < students.length - i - 1; j++) {

            if (students[j].generalAverage <
                students[j + 1].generalAverage) {

                [students[j], students[j + 1]] =
                [students[j + 1], students[j]];
            }
        }
    }

    saveData();
    renderRecords();
    updateDashboard();
}

// STUDENT DETAILS

function semesterDetails(title, sem, avg) {
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

            <p><b>Semester Average: ${avg.toFixed(2)}</b></p>
        </div>
    `;
}

function viewStudent(id) {
    const s = students.find(x => x.id === id);

    if (!s) return;

    document.getElementById("studentDetails").innerHTML = `
        <h2>${escapeHTML(s.name)}</h2>

        <p>Student ID: ${escapeHTML(s.id)}</p>

        ${semesterDetails(
            "First Semester",
            s.firstSem,
            s.firstAverage
        )}

        ${semesterDetails(
            "Second Semester",
            s.secondSem,
            s.secondAverage
        )}

        <h3>General Average: ${s.generalAverage.toFixed(2)}</h3>

        <p>Remarks: <b>${s.remarks}</b></p>

        <button onclick="showPage('records')">
            Back to Records
        </button>
    `;

    showPage("details");
}

// EDIT STUDENT

function editStudent(id) {
    const s = students.find(x => x.id === id);

    if (!s) return;

    editingId = id;

    document.getElementById("studentName").value = s.name;

    document.getElementById("studentId").value = s.id;

    document.getElementById("studentId").readOnly = true;

    ["first", "second"].forEach((sem, index) => {

        const d = index === 0
            ? s.firstSem
            : s.secondSem;

        d.quizzes.forEach((v, i) => {
            document.getElementById(
                sem + "Q" + (i + 1)
            ).value = v;
        });

        d.activities.forEach((v, i) => {
            document.getElementById(
                sem + "A" + (i + 1)
            ).value = v;
        });

        document.getElementById(sem + "Exam").value = d.exam;
    });

    document.getElementById("formTitle").textContent =
        "Edit Student Record";

    document.getElementById("saveButton").textContent =
        "Update Student";

    showPage("add");
}

// DELETE STUDENT

function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student record?")) {
        return;
    }

    students = students.filter(s => s.id !== id);

    saveData();
    updateDashboard();
    renderRecords();
}

// HTML SAFETY

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[c]));
}

updateDashboard();
