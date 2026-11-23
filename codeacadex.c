
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <ctype.h>

#define MAX_STUDENTS 20
#define QUIZ_COUNT 5
#define ACTIVITY_COUNT 5

#define QUIZ_MAX 20
#define ACTIVITY_MAX 30
#define EXAM_MAX 100

#define PASSING_GRADE 75.0

/* =========================================
   STRUCTURE FOR STUDENT ASSESSMENT RECORDS
   ========================================= */

struct Semester {
    float quizzes[QUIZ_COUNT];
    float activities[ACTIVITY_COUNT];
    float exam;
    float average;
};

struct Student {
    int id;
    char name[50];

    struct Semester firstSem;
    struct Semester secondSem;

    float generalAverage;
    char remarks[15];
};

struct Student students[MAX_STUDENTS];
int studentCount = 0;

/* =========================================
   FUNCTION PROTOTYPES
   ========================================= */

void displayMenu(void);
void addStudent(void);
void displayStudents(void);
void searchStudent(void);
void updateStudent(void);
void deleteStudent(void);
void sortStudents(void);
void generateSummary(void);

void inputSemester(struct Semester *sem, int semester);
void displaySemester(struct Semester sem, int semester);
void calculateGrades(struct Student *s);
void displayStudentDetails(struct Student s);

int generateStudentID(void);
int findStudent(int id);
int readNumber(const char prompt[], int min, int max);
void readName(const char prompt[], char name[], int size);
void clearInput(void);

/* =========================================
   MAIN PROGRAM
   ========================================= */

int main(void) {

    int choice;

    srand((unsigned int)time(NULL));

    do {
        displayMenu();

        choice = readNumber("Enter your choice: ", 1, 8);

        switch (choice) {

            case 1:
                addStudent();
                break;

            case 2:
                displayStudents();
                break;

            case 3:
                searchStudent();
                break;

            case 4:
                updateStudent();
                break;

            case 5:
                deleteStudent();
                break;

            case 6:
                sortStudents();
                break;

            case 7:
                generateSummary();
                break;

            case 8:
                printf("\nThank you for using ACADEX!\n");
                printf("Exiting program...\n");
                break;

            default:
                printf("Invalid choice.\n");
        }

        if (choice != 8) {
            printf("\nPress ENTER to continue...");
            getchar();
        }

    } while (choice != 8);

    return 0;
}

/* =========================================
   DISPLAY MAIN MENU
   ========================================= */

void displayMenu(void) {

    printf("\n");
    printf("========================================\n");
    printf("                 ACADEX                 \n");
    printf("          STUDENT GRADE MANAGEMENT      \n");
    printf("========================================\n");

    printf("[1] Add Student Record\n");
    printf("[2] Display All Students\n");
    printf("[3] Search Student\n");
    printf("[4] Update Student Record\n");
    printf("[5] Delete Student Record\n");
    printf("[6] Sort Student Records\n");
    printf("[7] Generate Grade Summary\n");
    printf("[8] Exit\n");

    printf("========================================\n");
}

/* =========================================
   INPUT VALIDATION FUNCTIONS
   ========================================= */

/* Clears remaining characters in input buffer. */

void clearInput(void) {

    int ch;

    while ((ch = getchar()) != '\n' && ch != EOF) {
        /* Discard extra input */
    }
}

/* Accepts only valid integer input within range. */

int readNumber(const char prompt[], int min, int max) {

    int number;
    char extra;

    while (1) {

        printf("%s", prompt);

        if (scanf("%d%c", &number, &extra) == 2 &&
            extra == '\n' &&
            number >= min &&
            number <= max) {

            return number;
        }

        printf("Invalid input. Please enter a number ");
        printf("from %d to %d.\n", min, max);

        clearInput();
    }
}

/* Reads a student's full name. */

void readName(const char prompt[], char name[], int size) {

    int i;
    int valid;

    do {

        printf("%s", prompt);

        if (fgets(name, size, stdin) == NULL) {
            name[0] = '\0';
            return;
        }

        name[strcspn(name, "\n")] = '\0';

        valid = 0;

        for (i = 0; name[i] != '\0'; i++) {

            if (isalpha((unsigned char)name[i])) {
                valid = 1;
                break;
            }
        }

        if (!valid) {
            printf("Invalid name. Please enter a valid name.\n");
        }

    } while (!valid);
}

/* =========================================
   GENERATE UNIQUE STUDENT ID
   ========================================= */

int generateStudentID(void) {

    int id;
    int found;

    do {

        id = 1390000 + rand() % 10000;

        found = 0;

        for (int i = 0; i < studentCount; i++) {

            if (students[i].id == id) {
                found = 1;
                break;
            }
        }

    } while (found);

    return id;
}

/* =========================================
   FIND STUDENT USING STUDENT ID
   ========================================= */

int findStudent(int id) {

    int i;

    for (i = 0; i < studentCount; i++) {

        if (students[i].id == id) {
            return i;
        }
    }

    return -1;
}

/* =========================================
   INPUT SEMESTER ASSESSMENT SCORES
   ========================================= */

void inputSemester(struct Semester *sem, int semester) {

    int i;
    char prompt[100];

    printf("\n========================================\n");

    if (semester == 1) {
        printf("          FIRST SEMESTER GRADES         \n");
    } else {
        printf("          SECOND SEMESTER GRADES        \n");
    }

    printf("========================================\n");

    /* Enter five individual quiz scores. */

    printf("\n--- QUIZ SCORES ---\n");

    for (i = 0; i < QUIZ_COUNT; i++) {

        sprintf(prompt, "Quiz %d (0-%d): ", i + 1, QUIZ_MAX);

        sem->quizzes[i] =
            (float)readNumber(prompt, 0, QUIZ_MAX);
    }

    /* Enter five individual activity scores. */

    printf("\n--- ACTIVITY SCORES ---\n");

    for (i = 0; i < ACTIVITY_COUNT; i++) {

        sprintf(prompt, "Activity %d (0-%d): ",
                i + 1, ACTIVITY_MAX);

        sem->activities[i] =
            (float)readNumber(prompt, 0, ACTIVITY_MAX);
    }

    /* Enter examination score. */

    printf("\n--- EXAMINATION SCORE ---\n");

    if (semester == 1) {

        sem->exam = (float)readNumber(
            "Midterm Examination (0-100): ",
            0, EXAM_MAX
        );

    } else {

        sem->exam = (float)readNumber(
            "Midterm Examination (0-100): ",
            0, EXAM_MAX
        );
    }
}

/* =========================================
   CALCULATE GENERAL AVERAGES
   ========================================= */

void calculateGrades(struct Student *s) {

    int i;

    float quizTotal1 = 0;
    float activityTotal1 = 0;

    float quizTotal2 = 0;
    float activityTotal2 = 0;

    /* Calculate first semester totals. */

    for (i = 0; i < QUIZ_COUNT; i++) {
        quizTotal1 += s->firstSem.quizzes[i];
    }

    for (i = 0; i < ACTIVITY_COUNT; i++) {
        activityTotal1 += s->firstSem.activities[i];
    }

    /* Calculate second semester totals. */

    for (i = 0; i < QUIZ_COUNT; i++) {
        quizTotal2 += s->secondSem.quizzes[i];
    }

    for (i = 0; i < ACTIVITY_COUNT; i++) {
        activityTotal2 += s->secondSem.activities[i];
    }

    /* FIRST SEMESTER WEIGHTED AVERAGE
       Quizzes    = 25%
       Activities = 25%
       Exam       = 50%
    */

    s->firstSem.average =
        (quizTotal1 / 100.0 * 25.0) +
        (activityTotal1 / 150.0 * 25.0) +
        (s->firstSem.exam / 100.0 * 50.0);

    /* SECOND SEMESTER WEIGHTED AVERAGE */

    s->secondSem.average =
        (quizTotal2 / 100.0 * 25.0) +
        (activityTotal2 / 150.0 * 25.0) +
        (s->secondSem.exam / 100.0 * 50.0);

    /* OVERALL GENERAL AVERAGE */

    s->generalAverage =
        (s->firstSem.average + s->secondSem.average) / 2.0;

    /* Assign remarks based on general average. */

    if (s->generalAverage >= PASSING_GRADE) {
        strcpy(s->remarks, "PASSED");
    } else {
        strcpy(s->remarks, "FAILED");
    }
}

/* =========================================
   DISPLAY INDIVIDUAL SEMESTER SCORES
   ========================================= */

void displaySemester(struct Semester sem, int semester) {

    int i;

    printf("\n========================================\n");

    if (semester == 1) {
        printf("              FIRST SEMESTER            \n");
    } else {
        printf("             SECOND SEMESTER            \n");
    }

    printf("========================================\n");

    printf("\nQUIZ SCORES:\n");

    for (i = 0; i < QUIZ_COUNT; i++) {

        printf("Quiz %d: %.0f / %d\n",
               i + 1, sem.quizzes[i], QUIZ_MAX);
    }

    printf("\nACTIVITY SCORES:\n");

    for (i = 0; i < ACTIVITY_COUNT; i++) {

        printf("Activity %d: %.0f / %d\n",
               i + 1, sem.activities[i], ACTIVITY_MAX);
    }

    printf("\n--- EXAMINATION SCORE ---\n");

    printf("Midterm Examination: %.2f / %d\n",
           sem.exam, EXAM_MAX);

    printf("\nSemester General Average: %.2f\n",
           sem.average);

    if (sem.average >= PASSING_GRADE) {
        printf("Semester Remarks: PASSED\n");
    } else {
        printf("Semester Remarks: FAILED\n");
    }
}

/* =========================================
   DISPLAY COMPLETE STUDENT INFORMATION
   ========================================= */

void displayStudentDetails(struct Student s) {

    printf("\n========================================\n");
    printf("             STUDENT DETAILS            \n");
    printf("========================================\n");

    printf("Student ID: %d\n", s.id);
    printf("Student Name: %s\n", s.name);

    displaySemester(s.firstSem, 1);

    displaySemester(s.secondSem, 2);

    printf("\n========================================\n");
    printf("          OVERALL GRADE SUMMARY         \n");
    printf("========================================\n");

    printf("First Semester Average: %.2f\n",
           s.firstSem.average);

    printf("Second Semester Average: %.2f\n",
           s.secondSem.average);

    printf("----------------------------------------\n");

    printf("General Average: %.2f\n",
           s.generalAverage);

    printf("Final Remarks: %s\n", s.remarks);

    printf("========================================\n");
}

/* =========================================
   1. ADD STUDENT RECORD
   ========================================= */

void addStudent(void) {

    struct Student *s;

    if (studentCount >= MAX_STUDENTS) {

        printf("\nMaximum student capacity reached!\n");
        return;
    }

    s = &students[studentCount];

    printf("\n========================================\n");
    printf("             ADD STUDENT                \n");
    printf("========================================\n");

    s->id = generateStudentID();

    readName("Enter Full Name: ",
             s->name, sizeof(s->name));

    inputSemester(&s->firstSem, 1);

    inputSemester(&s->secondSem, 2);

    calculateGrades(s);

    studentCount++;

    printf("\n========================================\n");
    printf("      STUDENT RECORD SUCCESSFULLY ADDED!\n");
    printf("========================================\n");

    printf("Student ID: %d\n", s->id);
    printf("Student Name: %s\n", s->name);

    displaySemester(s->firstSem, 1);
    displaySemester(s->secondSem, 2);

    printf("\n========================================\n");
    printf("OVERALL GENERAL AVERAGE: %.2f\n",
           s->generalAverage);

    printf("FINAL REMARKS: %s\n", s->remarks);

    printf("========================================\n");
}

/* =========================================
   2. DISPLAY ALL STUDENT RECORDS
   ========================================= */

void displayStudents(void) {

    int i;

    if (studentCount == 0) {

        printf("\nNo student records available.\n");
        return;
    }

    printf("\n========================================\n");
    printf("             STUDENT RECORDS            \n");
    printf("========================================\n");

    for (i = 0; i < studentCount; i++) {

        printf("\nStudent Number: %d\n", i + 1);
        printf("Student ID: %d\n", students[i].id);
        printf("Name: %s\n", students[i].name);

        printf("First Semester: %.2f\n",
               students[i].firstSem.average);

        printf("Second Semester: %.2f\n",
               students[i].secondSem.average);

        printf("General Average: %.2f\n",
               students[i].generalAverage);

        printf("Remarks: %s\n", students[i].remarks);

        printf("----------------------------------------\n");
    }

    printf("Total Students: %d\n", studentCount);
}

/* =========================================
   3. SEARCH STUDENT RECORD
   ========================================= */

void searchStudent(void) {

    int id;
    int index;

    if (studentCount == 0) {

        printf("\nNo records available to search.\n");
        return;
    }

    printf("\n========================================\n");
    printf("             SEARCH STUDENT             \n");
    printf("========================================\n");

    id = readNumber("Enter Student ID: ", 1390000, 1399999);

    index = findStudent(id);

    if (index == -1) {

        printf("\nStudent record not found.\n");

    } else {

        printf("\nStudent record found!\n");

        displayStudentDetails(students[index]);
    }
}

/* =========================================
   4. UPDATE STUDENT RECORD
   ========================================= */

void updateStudent(void) {

    int id;
    int index;
    char choice;

    if (studentCount == 0) {

        printf("\nNo records available to update.\n");
        return;
    }

    printf("\n========================================\n");
    printf("             UPDATE STUDENT             \n");
    printf("========================================\n");

    id = readNumber("Enter Student ID: ", 1390000, 1399999);

    index = findStudent(id);

    if (index == -1) {

        printf("\nStudent record not found.\n");
        return;
    }

    printf("\nCurrent student: %s\n",
           students[index].name);

    printf("\nUpdate student name? (Y/N): ");
    scanf(" %c", &choice);
    clearInput();

    if (toupper((unsigned char)choice) == 'Y') {

        readName("Enter New Name: ",
                 students[index].name,
                 sizeof(students[index].name));
    }

    printf("\nUpdate assessment scores? (Y/N): ");
    scanf(" %c", &choice);
    clearInput();

    if (toupper((unsigned char)choice) == 'Y') {

        inputSemester(&students[index].firstSem, 1);

        inputSemester(&students[index].secondSem, 2);
    }

    calculateGrades(&students[index]);

    printf("\nStudent record successfully updated!\n");

    displayStudentDetails(students[index]);
}

/* =========================================
   5. DELETE STUDENT RECORD
   ========================================= */

void deleteStudent(void) {

    int id;
    int index;
    int i;
    char confirm;

    if (studentCount == 0) {

        printf("\nNo records available to delete.\n");
        return;
    }

    printf("\n========================================\n");
    printf("             DELETE STUDENT             \n");
    printf("========================================\n");

    id = readNumber("Enter Student ID: ", 1390000, 1399999);

    index = findStudent(id);

    if (index == -1) {

        printf("\nStudent record not found.\n");
        return;
    }

    printf("\nStudent Name: %s\n",
           students[index].name);

    printf("Are you sure you want to delete this record? (Y/N): ");

    scanf(" %c", &confirm);
    clearInput();

    if (toupper((unsigned char)confirm) == 'Y') {

        /* Shift remaining records to the left. */

        for (i = index; i < studentCount - 1; i++) {

            students[i] = students[i + 1];
        }

        studentCount--;

        printf("\nStudent record successfully deleted!\n");

    } else {

        printf("\nDeletion cancelled.\n");
    }
}

/* =========================================
   6. SORT STUDENTS USING BUBBLE SORT
   ========================================= */

void sortStudents(void) {

    int i, j;

    struct Student temp;

    if (studentCount < 2) {

        printf("\nNot enough records to sort.\n");
        return;
    }

    /* Arrange records from highest to lowest average. */

    for (i = 0; i < studentCount - 1; i++) {

        for (j = 0; j < studentCount - i - 1; j++) {

            if (students[j].generalAverage <
                students[j + 1].generalAverage) {

                temp = students[j];

                students[j] = students[j + 1];

                students[j + 1] = temp;
            }
        }
    }

    printf("\nStudent records successfully sorted!\n");
    printf("Highest to Lowest General Average.\n");

    displayStudents();
}

/* =========================================
   7. GENERATE CLASS GRADE SUMMARY
   ========================================= */

void generateSummary(void) {

    int i;

    int passed = 0;
    int failed = 0;

    int highestIndex = 0;
    int lowestIndex = 0;

    float total = 0;
    float classAverage;

    if (studentCount == 0) {

        printf("\nNo records available to generate summary.\n");
        return;
    }

    /* Determine class performance. */

    for (i = 0; i < studentCount; i++) {

        total += students[i].generalAverage;

        if (students[i].generalAverage >= PASSING_GRADE) {
            passed++;
        } else {
            failed++;
        }

        if (students[i].generalAverage >
            students[highestIndex].generalAverage) {

            highestIndex = i;
        }

        if (students[i].generalAverage <
            students[lowestIndex].generalAverage) {

            lowestIndex = i;
        }
    }

    classAverage = total / studentCount;

    printf("\n========================================\n");
    printf("          ACADEX GRADE SUMMARY           \n");
    printf("========================================\n");

    printf("Total Students: %d\n", studentCount);

    printf("Class General Average: %.2f\n",
           classAverage);

    printf("\nHIGHEST GENERAL AVERAGE:\n");

    printf("Name: %s\n",
           students[highestIndex].name);

    printf("Grade: %.2f\n",
           students[highestIndex].generalAverage);

    printf("\nLOWEST GENERAL AVERAGE:\n");

    printf("Name: %s\n",
           students[lowestIndex].name);

    printf("Grade: %.2f\n",
           students[lowestIndex].generalAverage);

    printf("\nPASSING STUDENTS: %d\n", passed);

    printf("FAILING STUDENTS: %d\n", failed);

    printf("\n========================================\n");
    printf("             STUDENT RANKINGS           \n");
    printf("========================================\n");

    /* Sort records before displaying rankings. */

    sortStudents();

    for (i = 0; i < studentCount; i++) {

        printf("Rank %d: %-25s %.2f\n",
               i + 1,
               students[i].name,
               students[i].generalAverage);
    }

    printf("========================================\n");
}
