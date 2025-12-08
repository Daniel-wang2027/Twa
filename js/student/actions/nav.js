/* ==========================================================================
   STUDENT: NAVIGATION & DETAIL VIEWS
   ==========================================================================
   PURPOSE: 
   1. Handles opening specific sub-views (Class Details, Day Details).
   2. Manages the "Day Detail" Modal (The daily agenda popup).
   3. Toggles Dashboard modes (List vs Matrix).
   ========================================================================== */

// --- GLOBAL STATE FOR NAVIGATION ---
// Tracks which class is currently open in the detail view.
var viewClassTarget = null; 

/* =========================================
   1. CLASS DETAIL VIEW (From Profile)
   ========================================= */

function openClassDetail(className) {
    viewClassTarget = className;

    // Update Header Elements
    const titleEl = document.getElementById('detail-class-name');
    const dotEl = document.getElementById('detail-class-dot');

    if (titleEl) titleEl.innerText = className;

    if (dotEl) {
        // Apply the user's chosen color for this class
        const color = classPreferences[className] || '#888';
        dotEl.style.backgroundColor = color;
        dotEl.style.boxShadow = `0 0 10px ${color}`;
    }

    // Switch View
    if (typeof switchStudentView === 'function') {
        switchStudentView('class-detail');
    } else {
        console.error("Error: switchStudentView() is missing.");
    }

    // Render Data
    if (typeof renderClassDetailList === 'function') {
        renderClassDetailList(className);
    }
}

function closeClassDetail() {
    viewClassTarget = null;
    if (typeof switchStudentView === 'function') {
        switchStudentView('profile');
    }
}

/* =========================================
   2. DAY DETAIL MODAL (Daily Agenda)
   ========================================= */

/**
 * Opens a popup showing everything happening on a specific date.
 * Includes: Teacher's Lesson Plan (Topic) + Student's Assignments.
 * @param {string} dateKey - Format "YYYY-MM-DD"
 */
function openDayDetail(dateKey) {
    const modal = document.getElementById('dayDetailModal');
    if (!modal) {
        console.error("Critical: Day Detail Modal HTML not found.");
        return;
    }

    // Save state for the "Add Task" button later
    selectedDayViewDate = dateKey;

    // 1. Format Date Header
    // IMPORTANT: We append "T00:00:00" to force Local Time.
    // If we just used "YYYY-MM-DD", JavaScript treats it as UTC, 
    // often resulting in the date shifting to the previous day.
    const dateObj = new Date(dateKey + "T00:00:00");
    const dateStr = dateObj.toLocaleDateString(undefined, { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    });

    document.getElementById('dd-date-title').innerText = dateStr;

    // 2. Setup Container & Counts
    const container = document.getElementById('dd-task-list');
    container.innerHTML = '';

    const totalDue = globalTasks.filter(t => t.due.startsWith(dateKey)).length;
    document.getElementById('dd-task-count').innerText = `${totalDue} assignments due`;

    if (classes.length === 0) {
        container.innerHTML = `<div class="text-center text-muted italic p-4">No classes enrolled.</div>`;
    }

    // 3. Loop through Enrolled Classes
    classes.forEach(className => {
        if (className === 'Personal') return; // Render Personal separately at the bottom

        const color = classPreferences[className] || '#888';

        // A. Get Teacher's Lesson Plan (Topic)
        let topic = "No lesson plan posted.";
        if (typeof classTopics !== 'undefined' && 
            classTopics[className] && 
            classTopics[className][dateKey]) {
            topic = classTopics[className][dateKey];
        }

        // B. Get Student's Assignments due TODAY
        const classTasks = globalTasks.filter(t => t.course === className && t.due.startsWith(dateKey));

        // Generate Task HTML List
        let tasksHtml = '';
        if (classTasks.length > 0) {
            classTasks.forEach(t => {
                tasksHtml += `
                <div onclick="openTaskDetails(${t.id})" class="flex items-center gap-2 mt-2 p-2 rounded bg-surface border border-border cursor-pointer hover:border-primary/50 group">
                    <div class="text-${t.completed ? 'green-500' : 'muted'}">
                        <i class="fa-${t.completed ? 'solid fa-circle-check' : 'regular fa-square'}"></i>
                    </div>
                    <span class="text-xs font-bold ${t.completed ? 'line-through opacity-50' : 'text-text'} truncate flex-1">
                        ${t.title}
                    </span>
                    <span class="text-[9px] uppercase font-bold text-primary bg-primary/10 px-1 rounded">
                        ${t.type}
                    </span>
                </div>`;
            });
        } else {
            tasksHtml = `
            <div class="mt-2 text-[10px] text-muted italic flex items-center gap-1">
                <i class="fa-solid fa-check-double"></i> No assignments due
            </div>`;
        }

        // C. Combine into Class Card
        container.innerHTML += `
        <div class="bg-base border border-border rounded-xl p-4 mb-3 relative overflow-hidden">
            <!-- Colored Sidebar Strip -->
            <div class="absolute left-0 top-0 bottom-0 w-1.5" style="background:${color}"></div>

            <div class="pl-2">
                <!-- Class Name -->
                <div class="flex justify-between items-start mb-1">
                    <h3 class="font-bold text-lg leading-none">${className}</h3>
                </div>

                <!-- Teacher Topic -->
                <div class="text-sm text-text mb-3">
                    <span class="text-[10px] font-bold text-muted uppercase tracking-wider block mb-0.5">Today's Topic</span>
                    <span class="font-medium">${topic}</span>
                </div>

                <!-- Assignments List -->
                <div class="border-t border-border pt-2">
                    ${tasksHtml}
                </div>
            </div>
        </div>`;
    });

    // 4. Render Personal Tasks (Separate Section)
    const personalTasks = globalTasks.filter(t => t.course === 'Personal' && t.due.startsWith(dateKey));

    if (personalTasks.length > 0) {
        let pTaskHtml = '';
        personalTasks.forEach(t => {
            pTaskHtml += `
            <div onclick="openTaskDetails(${t.id})" class="flex items-center gap-2 mt-1 p-2 rounded bg-surface border border-border cursor-pointer">
                <div class="text-${t.completed ? 'green-500' : 'muted'}">
                    <i class="fa-${t.completed ? 'solid fa-circle-check' : 'regular fa-square'}"></i>
                </div>
                <span class="text-xs font-bold ${t.completed ? 'line-through' : ''}">${t.title}</span>
            </div>`;
        });

        container.innerHTML += `
        <div class="mt-4">
            <h4 class="text-xs font-bold text-muted uppercase tracking-wider mb-2">Personal / Other</h4>
            ${pTaskHtml}
        </div>`;
    }

    modal.classList.remove('hidden');
}

/**
 * Helper to transition from Day Detail -> Add Task Modal.
 * Pre-fills the date field with the day you were just looking at.
 */
function openStudentModalFromDay() {
    document.getElementById('dayDetailModal').classList.add('hidden');
    openStudentModal();

    if (selectedDayViewDate) {
        document.getElementById('m-due').value = `${selectedDayViewDate}T08:00`;
    }
}

/* =========================================
   3. DASHBOARD VIEW CONTROLLER
   ========================================= */

function setDashboardView(mode) {
    dashboardViewMode = mode; // 'list' or 'matrix'
    saveData(); // Persist preference

    // Refresh the main UI
    if (typeof switchStudentView === 'function') {
        switchStudentView('dashboard');
    }
}