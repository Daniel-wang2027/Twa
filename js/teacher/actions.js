/* ==========================================================================
   TEACHER ACTIONS & LOGIC
   ==========================================================================
   PURPOSE: 
   1. Handles Teacher Navigation (Planner vs Settings).
   2. Manages "Teacher Actions" (Bulletins, Snow Days, Assigning Work).
   3. Handles "Observer Mode" (viewing as a student).
   ========================================================================== */

let selectedDateForModal = null; 

/* =========================================
   1. NAVIGATION
   ========================================= */

function changePlannerWeek(amount) {
    // 0 = Reset to today, -1 = Back 1 week, 1 = Forward 1 week
    if (amount === 0) currentPlannerOffset = 0;
    else currentPlannerOffset += amount;

    renderTeacherPlanner();
}

/**
 * Switches the active class context for the teacher.
 * Updates the header and loads the specific bulletin for that class.
 */
function teacherSwitchClass(cls) {
    currentTeacherClass = cls;

    // Update Header Title
    const titleEl = document.getElementById('t-active-class-title');
    if (titleEl) titleEl.innerText = cls;

    // Reset View
    switchTeacherView('planner');

    // Load Bulletin (Sticky Note)
    const bContainer = document.getElementById('t-bulletin-container');
    const bText = document.getElementById('t-bulletin-text');

    if (bContainer && bText) {
        if (typeof classBulletins !== 'undefined' && 
            classBulletins[cls] && 
            classBulletins[cls].active) {

            bContainer.classList.remove('hidden');
            bText.innerText = classBulletins[cls].msg;
        } else {
            bContainer.classList.add('hidden');
        }
    }

    // Trigger Re-renders
    if (typeof renderTeacherNav === 'function') renderTeacherNav();
    if (typeof renderTeacherPlanner === 'function') renderTeacherPlanner();
    if (typeof renderRosterSidebar === 'function') renderRosterSidebar();
}

function switchTeacherView(view) {
    const plannerEl = document.getElementById('t-view-planner');
    const settingsEl = document.getElementById('t-view-settings');

    if (view === 'settings') {
        if (plannerEl) plannerEl.classList.add('hidden');
        if (settingsEl) settingsEl.classList.remove('hidden');

        if (typeof renderThemeButtons === 'function') {
            renderThemeButtons('t-theme-selector');
        }
    } else {
        if (settingsEl) settingsEl.classList.add('hidden');
        if (plannerEl) plannerEl.classList.remove('hidden');
    }
}

/* =========================================
   2. BULLETIN BOARD (Sticky Notes)
   ========================================= */

function setBulletin() {
    const modal = document.getElementById('bulletinModal');
    const input = document.getElementById('bm-text');

    // Pre-fill existing message if available
    if (classBulletins && classBulletins[currentTeacherClass]) {
        input.value = classBulletins[currentTeacherClass].msg || "";
    } else {
        input.value = "";
    }

    modal.classList.remove('hidden');
}

function saveBulletinAction() {
    const msg = document.getElementById('bm-text').value;
    if (!msg.trim()) return;

    if (typeof classBulletins === 'undefined') classBulletins = {};

    // Save to Global State
    classBulletins[currentTeacherClass] = { msg: msg, active: true };

    saveData();
    teacherSwitchClass(currentTeacherClass); // Refresh UI
    document.getElementById('bulletinModal').classList.add('hidden');
    showToast("Bulletin Posted", "success");
}

function clearBulletin() {
    // Wrapper for the clear action
    clearBulletinAction();
}

function clearBulletinAction() {
    if (typeof classBulletins !== 'undefined' && classBulletins[currentTeacherClass]) {
        classBulletins[currentTeacherClass].active = false;
        saveData();
    }

    teacherSwitchClass(currentTeacherClass);
    document.getElementById('bulletinModal').classList.add('hidden');
    showToast("Bulletin Cleared", "info");
}

/* =========================================
   3. SNOW DAY (Bulk Reschedule)
   ========================================= */

function bulkShiftDates() {
    document.getElementById('snowDayModal').classList.remove('hidden');
    document.getElementById('sd-days').value = "1";
}

function adjustSnowDay(amount) {
    const input = document.getElementById('sd-days');
    let val = parseInt(input.value) || 0;
    val += amount;

    if (val < 1) val = 1; // Minimum 1 day shift
    input.value = val;
}

function confirmSnowDayAction() {
    const days = parseInt(document.getElementById('sd-days').value);
    if (isNaN(days) || days < 1) return;

    let count = 0;

    // Find all incomplete tasks for THIS class and shift them
    globalTasks.forEach(t => {
        if (!t.completed && t.course === currentTeacherClass) {
            const d = new Date(t.due);
            d.setDate(d.getDate() + days);
            t.due = d.toISOString();
            count++;
        }
    });

    saveData();
    renderTeacherPlanner();

    document.getElementById('snowDayModal').classList.add('hidden');
    showToast(`Shifted ${count} assignments by ${days} day(s).`, "success");
}

/* =========================================
   4. ASSIGNMENT MANAGEMENT
   ========================================= */

function saveTopic(dateKey, text) {
    if (typeof classTopics === 'undefined') classTopics = {};
    if (!classTopics[currentTeacherClass]) classTopics[currentTeacherClass] = {};

    classTopics[currentTeacherClass][dateKey] = text;
    saveData();
}

function openTeacherModal(dateKey) {
    selectedDateForModal = dateKey;
    const modal = document.getElementById('teacherAddModal');
    const dateInput = document.getElementById('tm-due');

    if (dateKey) dateInput.value = `${dateKey}T08:00`;
    else dateInput.value = '';

    modal.classList.remove('hidden');
}

function submitTeacherTask() {
    const title = document.getElementById('tm-title').value;
    const type = document.getElementById('tm-type').value;
    const due = document.getElementById('tm-due').value;
    const est = document.getElementById('tm-est').value;

    if (!title || !due) return alert("Title and Date required");

    // Create New Task
    globalTasks.push({
        id: Date.now(),
        title: title,
        course: currentTeacherClass,
        due: new Date(due).toISOString(),
        type: type,
        est: parseInt(est) || 30,
        completed: false,
        checklist: [],
        pinned: false
    });

    saveData();
    document.getElementById('teacherAddModal').classList.add('hidden');
    document.getElementById('tm-title').value = ''; // Reset Form

    renderTeacherPlanner();
    showToast("Assignment Created", "success");
}

function deleteTaskFromFeed(id) {
    if (confirm("Delete this assignment? This will remove it for all students.")) {
        const idx = globalTasks.findIndex(t => t.id === id);
        if (idx > -1) {
            globalTasks.splice(idx, 1);
            saveData();
            renderTeacherPlanner();
        }
    }
}

/* =========================================
   5. OBSERVER MODE (View as Student)
   ========================================= */

async function enterObserverMode(studentName) {
    const banner = document.getElementById('observer-banner');
    let studentLayout = document.getElementById('student-layout');

    // Lazy Load Student HTML if missing
    if (!studentLayout) {
        try {
            const response = await fetch('layouts/student.html');
            if (!response.ok) throw new Error("Layout missing");

            const html = await response.text();
            document.getElementById('app-container').insertAdjacentHTML('beforeend', html);
            studentLayout = document.getElementById('student-layout');
        } catch (e) {
            return alert("Error loading student view. Please refresh.");
        }
    }

    if (banner && studentLayout) {
        // Show Warning Banner
        banner.classList.remove('hidden');
        document.getElementById('observer-name').innerText = studentName;

        // Swap Layouts
        document.getElementById('teacher-layout').classList.add('hidden');
        studentLayout.classList.remove('hidden');

        // Update Name in Student View
        if (document.getElementById('s-profileName')) {
            document.getElementById('s-profileName').innerText = studentName;
        }

        // Initialize Student Logic
        if (typeof initStudentUI === 'function') initStudentUI();
        if (typeof renderStudentBulletins === 'function') renderStudentBulletins();
    }
}

function exitObserverMode() {
    const banner = document.getElementById('observer-banner');
    if (banner) banner.classList.add('hidden');

    document.getElementById('student-layout').classList.add('hidden');
    document.getElementById('teacher-layout').classList.remove('hidden');

    const nameEl = document.getElementById('t-profileName');
    if (nameEl && currentUser) nameEl.innerText = currentUser.name;

    showToast("Returned to Faculty Hub", "success");
}

/* =========================================
   6. SECURITY
   ========================================= */

function teacherChangePassword() {
    const oldP = document.getElementById('t-sec-old').value;
    const newP = document.getElementById('t-sec-new').value;

    if (!oldP || !newP) return alert("Please fill in both fields.");
    if (oldP !== currentUser.password) return alert("Incorrect current password.");

    // Update Session
    currentUser.password = newP;
    localStorage.setItem("twa_current_user", JSON.stringify(currentUser));

    // Update Database
    const usersRaw = localStorage.getItem("operation_twa_users");
    if (usersRaw) {
        const users = JSON.parse(usersRaw);
        const idx = users.findIndex(u => u.email === currentUser.email);
        if (idx > -1) {
            users[idx].password = newP;
            localStorage.setItem("operation_twa_users", JSON.stringify(users));
        }
    }

    document.getElementById('t-sec-old').value = '';
    document.getElementById('t-sec-new').value = '';

    if (typeof showToast === 'function') showToast("Password Updated", "success");
    else alert("Password Updated");
}