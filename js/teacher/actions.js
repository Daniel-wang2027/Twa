/* =========================================
   TEACHER ACTIONS (Fixed UI & Modals)
   ========================================= */

let selectedDateForModal = null; 
function changePlannerWeek(amount) {
    // 0 = Reset to today, -1 = Back, 1 = Forward
    if (amount === 0) currentPlannerOffset = 0;
    else currentPlannerOffset += amount;

    renderTeacherPlanner();
}

/* --- CYCLE DAY CALCULATOR --- */
// Calculates the 7-day rotating cycle (Mon-Fri only)
function getCycleDay(targetDate) {
    // 1. If it's a weekend, it has no cycle day
    const dayOfWeek = targetDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return null;

    // 2. Calculate weekdays between Start Date and Target Date
    // (This ignores holidays for now, strictly counts Mon-Fri)
    const start = new Date(CYCLE_START_DATE);
    const end = new Date(targetDate);

    // Normalize to midnight to avoid time bugs
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);

    let count = 0;
    const cur = new Date(start);

    // If target is before start, return null
    if (end < start) return null;

    while (cur <= end) {
        const d = cur.getDay();
        if (d !== 0 && d !== 6) { // If not Sun (0) or Sat (6)
            count++;
        }
        cur.setDate(cur.getDate() + 1);
    }

    // 3. Math: (Count - 1) % 7 + 1
    // Example: 1st day -> (0 % 7) + 1 = Day 1
    // Example: 6th day -> (5 % 7) + 1 = Day 6
    // Example: 8th day -> (7 % 7) + 1 = Day 1 (Loop)

    const cycle = ((count - 1) % 7) + 1;
    return cycle;
}
/* --- NAVIGATION --- */
function teacherSwitchClass(cls) {
    currentTeacherClass = cls;

    // Update Header
    const titleEl = document.getElementById('t-active-class-title');
    if(titleEl) titleEl.innerText = cls;

    // Reset View to Planner
    switchTeacherView('planner');

    // Handle Bulletin Visibility
    const bContainer = document.getElementById('t-bulletin-container');
    const bText = document.getElementById('t-bulletin-text');

    if(bContainer && bText) {
        if(typeof classBulletins !== 'undefined' && classBulletins[cls] && classBulletins[cls].active) {
            bContainer.classList.remove('hidden');
            bText.innerText = classBulletins[cls].msg;
        } else {
            bContainer.classList.add('hidden');
        }
    }

    // Trigger Renders
    if(typeof renderTeacherNav === 'function') renderTeacherNav();
    if(typeof renderTeacherPlanner === 'function') renderTeacherPlanner();
    if(typeof renderRosterSidebar === 'function') renderRosterSidebar();
}

function switchTeacherView(view) {
    const plannerEl = document.getElementById('t-view-planner');
    const settingsEl = document.getElementById('t-view-settings');

    if(view === 'settings') {
        if(plannerEl) plannerEl.classList.add('hidden');
        if(settingsEl) settingsEl.classList.remove('hidden');
        if(typeof renderThemeButtons === 'function') renderThemeButtons('t-theme-selector');
    } else {
        if(settingsEl) settingsEl.classList.add('hidden');
        if(plannerEl) plannerEl.classList.remove('hidden');
    }
}

/* --- BULLETIN (STICKY NOTE) ACTIONS --- */

function setBulletin() {
    const modal = document.getElementById('bulletinModal');
    const input = document.getElementById('bm-text');

    // Pre-fill existing message
    if(classBulletins && classBulletins[currentTeacherClass]) {
        input.value = classBulletins[currentTeacherClass].msg || "";
    } else {
        input.value = "";
    }

    modal.classList.remove('hidden');
}

function saveBulletinAction() {
    const msg = document.getElementById('bm-text').value;
    if(!msg.trim()) return;

    if(typeof classBulletins === 'undefined') classBulletins = {};
    classBulletins[currentTeacherClass] = { msg: msg, active: true };

    saveData();
    teacherSwitchClass(currentTeacherClass); // Refresh UI
    document.getElementById('bulletinModal').classList.add('hidden');
    showToast("Bulletin Posted", "success");
}

function clearBulletin() {
    // Direct clear from the banner button
    clearBulletinAction();
}

function clearBulletinAction() {
    if(typeof classBulletins !== 'undefined' && classBulletins[currentTeacherClass]) {
        classBulletins[currentTeacherClass].active = false;
        saveData();
    }
    teacherSwitchClass(currentTeacherClass);
    document.getElementById('bulletinModal').classList.add('hidden');
    showToast("Bulletin Cleared", "info");
}

/* --- SNOW DAY ACTIONS --- */

function bulkShiftDates() {
    document.getElementById('snowDayModal').classList.remove('hidden');
    document.getElementById('sd-days').value = "1";
}

function adjustSnowDay(amount) {
    const input = document.getElementById('sd-days');
    let val = parseInt(input.value) || 0;
    val += amount;
    if(val < 1) val = 1;
    input.value = val;
}

function confirmSnowDayAction() {
    const days = parseInt(document.getElementById('sd-days').value);
    if(isNaN(days) || days < 1) return;

    let count = 0;
    globalTasks.forEach(t => {
        if(!t.completed && t.course === currentTeacherClass) {
            const d = new Date(t.due);
            d.setDate(d.getDate() + days);
            t.due = d.toISOString();
            count++;
        }
    });

    saveData();
    renderTeacherPlanner(); // Refresh Grid
    document.getElementById('snowDayModal').classList.add('hidden');
    showToast(`Shifted ${count} assignments by ${days} day(s).`, "success");
}

/* --- PLANNER & TOPICS --- */

function saveTopic(dateKey, text) {
    if(typeof classTopics === 'undefined') classTopics = {};
    if(!classTopics[currentTeacherClass]) classTopics[currentTeacherClass] = {};

    classTopics[currentTeacherClass][dateKey] = text;
    saveData();
}

function openTeacherModal(dateKey) {
    selectedDateForModal = dateKey;
    const modal = document.getElementById('teacherAddModal');
    const dateInput = document.getElementById('tm-due');

    if(dateKey) dateInput.value = `${dateKey}T08:00`;
    else dateInput.value = '';

    modal.classList.remove('hidden');
}

function submitTeacherTask() {
    const title = document.getElementById('tm-title').value;
    const type = document.getElementById('tm-type').value;
    const due = document.getElementById('tm-due').value;
    const est = document.getElementById('tm-est').value;

    if(!title || !due) return alert("Title and Date required");

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
    document.getElementById('tm-title').value = '';
    renderTeacherPlanner();
    showToast("Assignment Created", "success");
}

function deleteTaskFromFeed(id) {
    if(confirm("Delete this assignment?")) {
        const idx = globalTasks.findIndex(t => t.id === id);
        if(idx > -1) {
            globalTasks.splice(idx, 1);
            saveData();
            renderTeacherPlanner();
        }
    }
}

/* --- OBSERVER MODE --- */

async function enterObserverMode(studentName) {
    const banner = document.getElementById('observer-banner');
    let studentLayout = document.getElementById('student-layout');

    if (!studentLayout) {
        try {
            const response = await fetch('layouts/student.html');
            if (!response.ok) throw new Error("Layout missing");
            const html = await response.text();
            document.getElementById('app-container').insertAdjacentHTML('beforeend', html);
            studentLayout = document.getElementById('student-layout');
        } catch (e) {
            return alert("Error loading student view");
        }
    }

    if (banner && studentLayout) {
        banner.classList.remove('hidden');
        document.getElementById('observer-name').innerText = studentName;
        document.getElementById('teacher-layout').classList.add('hidden');
        studentLayout.classList.remove('hidden');

        if(document.getElementById('s-profileName')) 
            document.getElementById('s-profileName').innerText = studentName;

        if(typeof initStudentUI === 'function') initStudentUI();
        if(typeof renderStudentBulletins === 'function') renderStudentBulletins();
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
/* --- SECURITY --- */

function teacherChangePassword() {
    const oldP = document.getElementById('t-sec-old').value;
    const newP = document.getElementById('t-sec-new').value;

    if(!oldP || !newP) return alert("Please fill in both fields.");

    if(oldP !== currentUser.password) return alert("Incorrect current password.");

    // Update Session
    currentUser.password = newP;
    localStorage.setItem("twa_current_user", JSON.stringify(currentUser));

    // Update DB
    const usersRaw = localStorage.getItem("operation_twa_users");
    if(usersRaw) {
        const users = JSON.parse(usersRaw);
        const idx = users.findIndex(u => u.email === currentUser.email);
        if(idx > -1) {
            users[idx].password = newP;
            localStorage.setItem("operation_twa_users", JSON.stringify(users));
        }
    }

    document.getElementById('t-sec-old').value = '';
    document.getElementById('t-sec-new').value = '';

    if(typeof showToast === 'function') showToast("Password Updated", "success");
    else alert("Password Updated");
}

/* --- CALENDAR DRAG & DROP LOGIC --- */

function allowDrop(ev) {
    ev.preventDefault(); // Necessary to allow dropping
    // Visual cue logic could go here
}

function handleDragStart(ev, taskId, duration) {
    ev.dataTransfer.setData("text/plain", JSON.stringify({ id: taskId, est: duration }));
    ev.dataTransfer.effectAllowed = "move";
}

function handleCalendarDrop(ev, dateStr) {
    ev.preventDefault();

    // 1. Get Drop Data
    const data = JSON.parse(ev.dataTransfer.getData("text/plain"));
    const task = globalTasks.find(t => t.id === data.id);
    if (!task) return;

    // 2. Calculate Drop Time
    // We need to find the Y coordinate relative to the drop target (the column)
    // ev.target might be the column OR a grid line inside it. We need the offset relative to the column top.
    const rect = ev.currentTarget.getBoundingClientRect();
    const offsetY = ev.clientY - rect.top;

    // Convert Pixels to Hours (Using constant from render.js: 100px = 1 hour)
    // 6 = Start Hour (6:00 AM)
    const PIXELS_PER_HOUR = 100;
    const START_HOUR = 6;

    const hoursFromStart = offsetY / PIXELS_PER_HOUR;
    const dropHour = START_HOUR + hoursFromStart;

    // Round to nearest 15 minutes (0.25 hours)
    const snappedHour = Math.round(dropHour * 4) / 4;

    // 3. Create Proposed Date Object
    const proposedDate = new Date(dateStr);
    const h = Math.floor(snappedHour);
    const m = (snappedHour - h) * 60;
    proposedDate.setHours(h, m, 0, 0);

    // 4. VALIDATE CONSTRAINT: Due Date - Buffer
    const bufferMins = (settings.buffer || 0);
    const effectiveDue = new Date(new Date(task.due).getTime() - (bufferMins * 60000));

    // Calculate when the task would END
    const durationMins = task.est || 30;
    const proposedEnd = new Date(proposedDate.getTime() + (durationMins * 60000));

    if (proposedEnd > effectiveDue) {
        alert(`Cannot schedule this! \n\nIt ends at ${proposedEnd.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}.\nYour deadline (minus buffer) is ${effectiveDue.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}.`);
        return;
    }

    // 5. Save & Render
    task.plannedDate = proposedDate.toISOString();
    saveData();
    renderCalendar(); // Refresh grid
    playSound('click');
}

function handleUnscheduleDrop(ev) {
    ev.preventDefault();
    const data = JSON.parse(ev.dataTransfer.getData("text/plain"));
    const task = globalTasks.find(t => t.id === data.id);

    if (task) {
        task.plannedDate = null; // Remove from grid
        saveData();
        renderCalendar();
    }
}

// UPDATE: Modify saveGeneralSettings to save the 24h preference
function saveGeneralSettings() {
    const dysEl = document.getElementById('setting-dyslexia');
    const time24El = document.getElementById('setting-time24');

    if(dysEl) {
        settings.dyslexia = dysEl.checked;
        document.body.classList.toggle('dyslexia-mode', settings.dyslexia);
    }

    if(time24El) {
        settings.timeFormat24 = time24El.checked;
    }

    saveData();
    // Refresh views to apply time format
    if(typeof renderCalendar === 'function') renderCalendar();
    if(typeof renderMatrix === 'function') renderMatrix(); 
}