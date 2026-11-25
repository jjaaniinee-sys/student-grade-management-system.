
// ==========================================
// ACADEX - STUDENT GRADE MANAGEMENT SYSTEM
// ==========================================

const MAX_STUDENTS = 20;
const PASSING_GRADE = 75;

let students = JSON.parse(localStorage.getItem("acadexStudents")) || [];
let editingId = null;
let sortDescending = true;

// ==========================================
// SAVE DATA
// ==========================================

function saveData() {
    localStorage.setItem("acadexStudents", JSON.stringify(students));
}

// ==========================================
// PAGE NAVIGATION
// ==========================================

function showPage(page) {
    document.querySelectorAll(".page").forEach(section => {
        section.classList.add("hidden");
    });

    const selectedPage = document.getElementById(page);

    if (!selectedPage) return;

    selectedPage.classList.remove("hidden");

    const titles = {
        dashboard: "Dashboard",
        records: "Student Records",
        add: editingId ? "Edit Student" : "Add Student",
        details: "Student Details"
    };

    document.getElementById("pageTitle").textContent = titles[page];

    if (page === "dashboard") {
        updateDashboard();
    }

    if (page === "records") {
        renderRecords();
    }
}

// ==========================================
// PREPARE ADD STUDENT FORM
// ==========================================

function prepareAddForm() {
    editingId = null;

    document.getElementById("studentForm").reset();

    document.getElementById("formTitle").textContent =
        "Add Student Record";

    document.getElementById("saveButton").textContent =
        "Save Student";
}

// ==========================================
// RESET FORM
// ==========================================

function resetForm() {
    document.getElementById("studentForm").reset();

    editingId = null;

    document.getElementById("formTitle").textContent =
        "Add Student Record";

    document.getElementById("saveButton").textContent =
        "Save Student";
}

// ==========================================
// CREATE QUIZ AND ACTIVITY INPUTS
// ==========================================

function createInputs() {
    ["first", "second"].forEach(sem => {

        const quizContainer =
            document.getElementById(sem + "Quizzes");

        const activityContainer =
            document.getElementById(sem + "Activities");

        quizContainer.innerHTML = "";
        activityContainer.innerHTML = "";

        for (let i = 1; i <= 5; i++) {

            quizContainer.innerHTML += `
                <label for="${sem}Q${i}">
                    Quiz ${i} (20 points)
                </label>

                <input
                    type="number"
                    id="${sem}Q${i}"
                    min="0"
                    max="20"
                    step="0.01"
                    required
                >
            `;

            activityContainer.innerHTML += `
                <label for="${sem}A${i}">
                    Activity ${i} (30 points)
                </label>

                <input
                    type="number"
                    id="${sem}A${i}"
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

// ==========================================
// GET STUDENT SCORES
// ==========================================

function getScores(sem) {

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
        exam: Number(
            document.getElementById(sem + "Exam").value
        )
    };
}

// ==========================================
// VALIDATE SCORES
// ==========================================

function validateScores(data) {

    if (
        data.quizzes.length !== 5 ||
        data.activities.length !== 5
    ) {
        return false;
    }

    if (data.quizzes.some(score =>
        !Number.isFinite(score) || score < 0 || score > 20
    )) {
        return false;
    }

    if (data.activities.some(score =>
        !Number.isFinite(score) || score < 0 || score > 30
    )) {
        return false;
    }

    if (
        !Number.isFinite(data.exam) ||
        data.exam < 0 ||
        data.exam > 100
    ) {
        return false;
    }

    return true;
}

// ==========================================
// CALCULATE SEMESTER AVERAGE
// ==========================================

function calculateSemester(data) {

    const quizTotal =
        data.quizzes.reduce((a, b) => a + b, 0);

    const activityTotal =
        data.activities.reduce((a, b) => a + b, 0);

    const quizGrade = (quizTotal / 100) * 25;

    const activityGrade = (activityTotal / 150) * 25;

    const examGrade = (data.exam / 100) * 50;

    return Number(
        (quizGrade + activityGrade + examGrade).toFixed(2)
    );
}

// ==========================================
// SAVE OR UPDATE STUDENT
// ==========================================

document.getElementById("studentForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const name =
            document.getElementById("studentName").value.trim();

        const id =
            document.getElementById("studentId").value.trim();

        // Validate name

        if (!name) {
            alert("Please enter the student's full name.");
            return;
        }

        // Validate student ID

        if (!/^139\d{4}$/.test(id)) {
            alert("Student ID must contain exactly 7 digits and begin with 139.");
            return;
        }

        // Check duplicate ID

        const duplicate = students.some(student =>
            student.id === id && student.id !== editingId
        );

        if (duplicate) {
            alert("This Student ID already exists.");
            return;
        }

        // Check maximum records

        if (!editingId && students.length >= MAX_STUDENTS) {
            alert("Maximum of 20 student records reached.");
            return;
        }

        // Get assessment scores

        const firstSem = getScores("first");
        const secondSem = getScores("second");

        if (
            !validateScores(firstSem) ||
            !validateScores(secondSem)
        ) {
            alert("Please enter valid scores within the allowed points.");
            return;
        }

        // Calculate grades

        const firstAverage = calculateSemester(firstSem);

        const secondAverage = calculateSemester(secondSem);

        const generalAverage = Number(
            ((firstAverage + secondAverage) / 2).toFixed(2)
        );

        // Create student object

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

        // Add or update record

        if (editingId) {

            const index = students.findIndex(
                s => s.id === editingId
            );

            if (index !== -1) {
                students[index] = student;
            }

            alert("Student record successfully updated!");

        } else {

            students.push(student);

            alert(
                "Student record successfully saved!\nStudent ID: " + id
            );
        }

        saveData();

        resetForm();

        updateDashboard();

        renderRecords();

        showPage("records");
    }
);

// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard() {

    const total = students.length;

    const average = total > 0
        ? students.reduce(
            (sum, s) => sum + s.generalAverage, 0
        ) / total
        : 0;

    document.getElementById("totalStudents").textContent =
        total;

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

// ==========================================
// SEARCH STUDENT RECORDS
// ==========================================

function renderRecords() {

    const searchInput = document.getElementById("search");

    const search = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

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
        `<tr><td colspan="7">No student records found.</td></tr>`;
}

// ==========================================
// SORT STUDENTS USING BUBBLE SORT
// ==========================================

function sortStudents() {

    for (let i = 0; i < students.length - 1; i++) {

        for (let j = 0; j < students.length - i - 1; j++) {

            const shouldSwap = sortDescending
                ? students[j].generalAverage <
                  students[j + 1].generalAverage
                : students[j].generalAverage >
                  students[j + 1].generalAverage;

            if (shouldSwap) {

                const temp = students[j];

                students[j] = students[j + 1];

                students[j + 1] = temp;
            }
        }
    }

    sortDescending = !sortDescending;

    const button = document.querySelector(".secondary");

    if (button) {
        button.textContent = sortDescending
            ? "Sort by General Average ↓"
            : "Sort by General Average ↑";
    }

    saveData();

    renderRecords();
}

// ==========================================
// VIEW STUDENT DETAILS
// ==========================================

function viewStudent(id) {

    const s = students.find(student => student.id === id);

    if (!s) {
        alert("Student record not found.");
        return;
    }

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

        ${semesterHTML(
            "First Semester",
            s.firstSem,
            s.firstAverage
        )}

        ${semesterHTML(
            "Second Semester",
            s.secondSem,
            s.secondAverage
        )}

        <h3>General Average: ${s.generalAverage.toFixed(2)}</h3>

        <p>Remarks: <b>${s.remarks}</b></p>

        <div class="form-buttons">

            <button class="cancel"
                onclick="showPage('records')">
                Back
            </button>

            <button type="button"
                onclick="editStudent('${s.id}')">
                Edit Student
            </button>

        </div>
    `;

    showPage("details");
}

// ==========================================
// EDIT STUDENT
// ==========================================

function editStudent(id) {

    const s = students.find(student => student.id === id);

    if (!s) {
        alert("Student record not found.");
        return;
    }

    editingId = id;

    document.getElementById("studentName").value = s.name;

    document.getElementById("studentId").value = s.id;

    ["first", "second"].forEach((sem, index) => {

        const data = index === 0
            ? s.firstSem
            : s.secondSem;

        data.quizzes.forEach((value, i) => {

            document.getElementById(
                sem + "Q" + (i + 1)
            ).value = value;
        });

        data.activities.forEach((value, i) => {

            document.getElementById(
                sem + "A" + (i + 1)
            ).value = value;
        });

        document.getElementById(sem + "Exam").value =
            data.exam;
    });

    document.getElementById("formTitle").textContent =
        "Edit Student Record";

    document.getElementById("saveButton").textContent =
        "Update Student";

    showPage("add");
}

// ==========================================
// DELETE STUDENT
// ==========================================

function deleteStudent(id) {

    const s = students.find(student => student.id === id);

    if (!s) {
        alert("Student record not found.");
        return;
    }

    const confirmation = confirm(
        "Are you sure you want to delete the record of " +
        s.name + "?"
    );

    if (confirmation) {

        students = students.filter(student =>
            student.id !== id
        );

        saveData();

        updateDashboard();

        renderRecords();

        alert("Student record successfully deleted!");
    }
}

// ==========================================
// ESCAPE HTML INPUT
// ==========================================

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// ==========================================
// INITIALIZE SYSTEM
// ==========================================

updateDashboard();
renderRecords();
showPage("dashboard");
