/* =========================================
   STUDENT: NAVIGATION ACTIONS
   ========================================= */

// GLOBAL STATE FOR NAVIGATION
// We declare this here. If it was declared elsewhere, remove it there.
var viewClassTarget = null; 

/* --- OPEN CLASS DETAIL (From Profile) --- */
function openClassDetail(className) {
    viewClassTarget = className;

    const titleEl = document.getElementById('detail-class-name');
    const dotEl = document.getElementById('detail-class-dot');

    if(titleEl) titleEl.innerText = className;
    if(dotEl) {
        const color = classPreferences[className] || '#888';
        dotEl.style.backgroundColor = color;
        dotEl.style.boxShadow = `0 0 10px ${color}`;
    }

    // Switch to the detail view
    if(typeof switchStudentView === 'function') switchStudentView('class-detail');
    else console.error("switchStudentView missing");

    // Render list
    if(typeof renderClassDetailList === 'function') renderClassDetailList(className);
}

function closeClassDetail() {
    viewClassTarget = null;
    if(typeof switchStudentView === 'function') switchStudentView('profile');
}

/* --- OPEN DAY DETAIL (Daily Agenda View) --- */
function openDayDetail(dateKey) {
    const modal = document.getElementById('dayDetailModal');
    if(!modal) {
        console.error("Critical: Day Detail Modal HTML not found.");
        return;
    }

    selectedDayViewDate = dateKey;

    // 1. Format Date Header
    // Append T00:00 to prevent timezone shifts
    const dateObj = new Date(dateKey + "T00:00:00");
    const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

    document.getElementById('dd-date-title').innerText = dateStr;

    // 2. Render Agenda (Classes + Topics + Tasks)
    const container = document.getElementById('dd-task-list');
    container.innerHTML = '';

    // Calculate total assignments for the badge
    const totalDue = globalTasks.filter(t => t.due.startsWith(dateKey)).length;
    document.getElementById('dd-task-count').innerText = `${totalDue} assignments due`;

    if (classes.length === 0) {
        container.innerHTML = `<div class="text-center text-muted italic p-4">No classes enrolled.</div>`;
    }

    // 3. Loop through Enrolled Classes
    classes.forEach(className => {
        if(className === 'Personal') return; // Skip Personal for the schedule view (optional)

        const color = classPreferences[className] || '#888';

        // A. Get Teacher's Topic
        let topic = "No lesson plan posted.";
        if (typeof classTopics !== 'undefined' && classTopics[className] && classTopics[className][dateKey]) {
            topic = classTopics[className][dateKey];
        }

        // B. Get Assignments due TODAY for this class
        const classTasks = globalTasks.filter(t => t.course === className && t.due.startsWith(dateKey));

        // Generate Task HTML
        let tasksHtml = '';
        if (classTasks.length > 0) {
            classTasks.forEach(t => {
                tasksHtml += `
                <div onclick="openTaskDetails(${t.id})" class="flex items-center gap-2 mt-2 p-2 rounded bg-surface border border-border cursor-pointer hover:border-primary/50 group">
                    <div class="text-${t.completed ? 'green-500' : 'muted'}">
                        <i class="fa-${t.completed ? 'solid fa-circle-check' : 'regular fa-square'}"></i>
                    </div>
                    <span class="text-xs font-bold ${t.completed ? 'line-through opacity-50' : 'text-text'} truncate flex-1">${t.title}</span>
                    <span class="text-[9px] uppercase font-bold text-primary bg-primary/10 px-1 rounded">${t.type}</span>
                </div>`;
            });
        } else {
            tasksHtml = `<div class="mt-2 text-[10px] text-muted italic flex items-center gap-1"><i class="fa-solid fa-check-double"></i> No assignments due</div>`;
        }

        // C. Render the Class Card
        container.innerHTML += `
        <div class="bg-base border border-border rounded-xl p-4 mb-3 relative overflow-hidden">
            <!-- Color Strip -->
            <div class="absolute left-0 top-0 bottom-0 w-1.5" style="background:${color}"></div>

            <div class="pl-2">
                <!-- Header -->
                <div class="flex justify-between items-start mb-1">
                    <h3 class="font-bold text-lg leading-none">${className}</h3>
                </div>

                <!-- Teacher Topic -->
                <div class="text-sm text-text mb-3">
                    <span class="text-[10px] font-bold text-muted uppercase tracking-wider block mb-0.5">Today's Topic</span>
                    <span class="font-medium">${topic}</span>
                </div>

                <!-- Assignments Section -->
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
                <div class="text-${t.completed ? 'green-500' : 'muted'}"><i class="fa-${t.completed ? 'solid fa-circle-check' : 'regular fa-square'}"></i></div>
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

function openStudentModalFromDay() {
    document.getElementById('dayDetailModal').classList.add('hidden');
    openStudentModal();
    if(selectedDayViewDate) {
        document.getElementById('m-due').value = `${selectedDayViewDate}T08:00`;
    }
}

/* --- DASHBOARD SUB-VIEW TOGGLE --- */
function setDashboardView(mode) {
    dashboardViewMode = mode;
    saveData();
    // Re-run the main switcher to update the UI
    if(typeof switchStudentView === 'function') switchStudentView('dashboard');
}