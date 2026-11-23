
let students = [];
let editingId = null;

function generateID() {
    let id;
    do {
        id = String(1390000 + Math.floor(Math.random() * 10000));
    } while (students.some(s => s.id === id));

    return id;
}

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

// CREATE SCORE INPUTS

function createInputs() {
    ["first", "second"].forEach(sem => {
        for (let i = 1; i <= 5; i++) {
            document.getElementById(sem + "Quizzes").innerHTML += `
                <label>Quiz ${i} (20 points)</label>
                <input type="number" id="${sem}Q${i}"
                min="0" max="20" step="1" required>
            `;

            document.getElementById(sem + "Activities").innerHTML += `
                <label>Activity ${i} (30 points)</label>
                <input type="number" id="${sem}A${i}"
                min="0" max="30" step="1" required>
            `;
        }
    });
}

createInputs();

// GET SCORES

function getScores(sem) {
    let quizzes = [];
    let activities = [];

    for (let i = 1; i <= 5; i++) {
        quizzes.push(Number(document.getElementById(sem + "Q" + i).value));
        activities.push(Number(document.getElementById(sem + "A" + i).value));
    }

    return {
        quizzes,
        activities,
        exam: Number(document.getElementById(sem + "Exam").value)
    };
}

// COMPUTATION

function calculateSemester(data) {
    const quizTotal = data.quizzes.reduce((a, b) => a + b, 0);
    const activityTotal = data.activities.reduce((a, b) => a + b, 0);

    const quizGrade = (quizTotal / 100) * 25;
    const activityGrade = (activityTotal / 150) * 25;
    const examGrade = (data.exam / 100) * 50;

    return Number((quizGrade + activityGrade + examGrade).toFixed(2));
}

// SAVE STUDENT

document.getElementById("studentForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("studentName").value.trim();

    if (!name) return;

    const firstSem = getScores("first");
    const secondSem = getScores("second");

    const scores = [
        ...firstSem.quizzes, ...firstSem.activities, firstSem.exam,
        ...secondSem.quizzes, ...secondSem.activities, secondSem.exam
    ];

    if (scores.some(n => !Number.isFinite(n) || n < 0) ||
        firstSem.quizzes.some(n => n > 20) ||
        secondSem.quizzes.some(n => n > 20) ||
        firstSem.activities.some(n => n > 30) ||
        secondSem.activities.some(n => n > 30) ||
        firstSem.exam > 100 || secondSem.exam > 100) {
        alert("Please enter valid scores within the specified maximum points.");
        return;
    }

    const firstAverage = calculateSemester(firstSem);
    const secondAverage = calculateSemester(secondSem);
    const generalAverage = Number(((firstAverage + secondAverage) / 2).toFixed(2));

    const student = {
        id: editingId || generateID(),
        name,
        firstSem,
        secondSem,
        firstAverage,
        secondAverage,
        generalAverage,
        remarks: generalAverage >= 75 ? "PASSED" : "FAILED"
    };

    if (editingId) {
        const index = students.findIndex(s => s.id === editingId);
        students[index] = student;
        editingId = null;
    } else {
        students.push(student);
    }

    this.reset();

    document.getElementById("formTitle").textContent = "Add Student Record";
    document.getElementById("saveButton").textContent = "Save Student";

    alert("Student record successfully saved!\nStudent ID: " + student.id);

    updateDashboard();
    renderRecords();
    showPage("records");
});

// DASHBOARD

function updateDashboard() {
    const total = students.length;

    const average = total
        ? students.reduce((sum, s) => sum + s.generalAverage, 0) / total
        : 0;

    document.getElementById("totalStudents").textContent = total;
    document.getElementById("classAverage").textContent = average.toFixed(2);

    document.getElementById("passedStudents").textContent =
        students.filter(s => s.remarks === "PASSED").length;

    document.getElementById("failedStudents").textContent =
        students.filter(s => s.remarks === "FAILED").length;

    document.getElementById("recentRecords").innerHTML =
        students.slice(-5).reverse().map(s => `
            <tr>
                <td>${s.id}</td>
                <td>${escapeHTML(s.name)}</td>
                <td>${s.firstAverage.toFixed(2)}</td>
                <td>${s.secondAverage.toFixed(2)}</td>
                <td><b>${s.generalAverage.toFixed(2)}</b></td>
                <td><span class="${s.remarks.toLowerCase()}">${s.remarks}</span></td>
            </tr>
        `).join("") || `<tr><td colspan="6">No records available.</td></tr>`;
}

// STUDENT RECORDS

function renderRecords() {
    const search = document.getElementById("search").value.toLowerCase();

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search) ||
        s.id.includes(search)
    );

    document.getElementById("studentRecords").innerHTML =
        filtered.map(s => `
            <tr>
                <td>${s.id}</td>
                <td>${escapeHTML(s.name)}</td>
                <td>${s.firstAverage.toFixed(2)}</td>
                <td>${s.secondAverage.toFixed(2)}</td>
                <td><b>${s.generalAverage.toFixed(2)}</b></td>
                <td><span class="${s.remarks.toLowerCase()}">${s.remarks}</span></td>
                <td>
                    <button class="action" onclick="viewStudent('${s.id}')">View</button>
                    <button class="action" onclick="editStudent('${s.id}')">Edit</button>
                    <button class="action delete" onclick="deleteStudent('${s.id}')">Delete</button>
                </td>
            </tr>
        `).join("") || `<tr><td colspan="7">No student records found.</td></tr>`;
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
                ${sem.quizzes.map((v,i) => `<p>Quiz ${i+1}: ${v}/20</p>`).join("")}
                <h4>Activities</h4>
                ${sem.activities.map((v,i) => `<p>Activity ${i+1}: ${v}/30</p>`).join("")}
                <p>Midterm Examination: ${sem.exam}/100</p>
                <p><b>Semester Average: ${average.toFixed(2)}</b></p>
            </div>
        `;
    }

    document.getElementById("studentDetails").innerHTML = `
        <h2>${escapeHTML(s.name)}</h2>
        <p>Student ID: ${s.id}</p>
        ${semesterHTML("First Semester", s.firstSem, s.firstAverage)}
        ${semesterHTML("Second Semester", s.secondSem, s.secondAverage)}
        <h3>General Average: ${s.generalAverage.toFixed(2)}</h3>
        <p>Remarks: <b>${s.remarks}</b></p>
        <button onclick="showPage('records')">Back</button>
    `;

    showPage("details");
}

// EDIT STUDENT

function editStudent(id) {
    const s = students.find(student => student.id === id);
    if (!s) return;

    editingId = id;

    document.getElementById("studentName").value = s.name;

    ["first", "second"].forEach((sem, index) => {
        const data = index === 0 ? s.firstSem : s.secondSem;

        data.quizzes.forEach((v,i) => {
            document.getElementById(sem + "Q" + (i+1)).value = v;
        });

        data.activities.forEach((v,i) => {
            document.getElementById(sem + "A" + (i+1)).value = v;
        });

        document.getElementById(sem + "Exam").value = data.exam;
    });

    document.getElementById("formTitle").textContent = "Edit Student Record";
    document.getElementById("saveButton").textContent = "Update Student";

    showPage("add");
}

// DELETE STUDENT

function deleteStudent(id) {
    if (confirm("Are you sure you want to delete this student record?")) {
        students = students.filter(s => s.id !== id);
        updateDashboard();
        renderRecords();
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
