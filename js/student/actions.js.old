/* =========================================
   STUDENT ACTIONS (Consolidated)
   ========================================= */

let activeTaskId = null;
let viewClassTarget = null; 

/* --- NAVIGATION & DETAILS --- */

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

    switchStudentView('class-detail');
    if(typeof renderClassDetailList === 'function') renderClassDetailList(className);
}

function closeClassDetail() {
    viewClassTarget = null;
    switchStudentView('profile');
}

function openCurrentClassSettings() {
    if(viewClassTarget) openStudentClassSettings(viewClassTarget);
}

/* --- SETTINGS: TIMER & BUFFER --- */

function saveTimerSettings() {
    const workEl = document.getElementById('setting-work');
    const breakEl = document.getElementById('setting-break');

    if(workEl) settings.workTime = parseInt(workEl.value) || 25;
    if(breakEl) settings.breakTime = parseInt(breakEl.value) || 5;

    saveData(); 
    if(typeof resetTimer === 'function') resetTimer();

    playSound('success');
    if(typeof showToast === 'function') showToast("Timer Updated", "success");
}

function saveBufferSettings() {
    const bufferEl = document.getElementById('setting-buffer');
    if(bufferEl) settings.buffer = parseInt(bufferEl.value) || 0;

    saveData();
    if(typeof renderMatrix === 'function') renderMatrix();

    playSound('click');
    if(typeof showToast === 'function') showToast("Matrix Buffer Updated", "success");
}

function saveGeneralSettings() {
    const dysEl = document.getElementById('setting-dyslexia');
    if(dysEl) {
        settings.dyslexia = dysEl.checked;
        document.body.classList.toggle('dyslexia-mode', settings.dyslexia);
        saveData();
    }
}

/* --- BACKPACK PROTOCOL (Multi-Select Logic) --- */

let bpSelectedCycles = [];   // Tracks selected Cycle days
let bpSelectedWeekdays = []; // Tracks selected Weekdays (0=Sun, 6=Sat)

// 1. Toggle UI Visibility & Reset Selections
function toggleBpInputs() {
    const type = document.getElementById('bp-new-type').value;
    document.getElementById('bp-select-weekday').classList.add('hidden');
    document.getElementById('bp-select-cycle').classList.add('hidden');

    if (type === 'weekday') document.getElementById('bp-select-weekday').classList.remove('hidden');
    if (type === 'cycle') document.getElementById('bp-select-cycle').classList.remove('hidden');

    // Reset selections arrays
    bpSelectedCycles = [];
    bpSelectedWeekdays = [];

    // Reset visual buttons
    const resetBtnClass = "h-8 flex-1 rounded bg-base border border-border text-xs font-bold text-muted hover:text-primary transition-colors";
    document.querySelectorAll('#bp-select-cycle button').forEach(b => b.className = resetBtnClass);
    document.querySelectorAll('#bp-select-weekday button').forEach(b => b.className = resetBtnClass);
}

// 2. Handle Cycle Button Clicks
function toggleBpCycleDay(day, btn) {
    if (bpSelectedCycles.includes(day)) {
        bpSelectedCycles = bpSelectedCycles.filter(d => d !== day);
        btn.className = "h-8 flex-1 rounded bg-base border border-border text-xs font-bold text-muted hover:text-primary transition-colors";
    } else {
        bpSelectedCycles.push(day);
        btn.className = "h-8 flex-1 rounded bg-primary text-white text-xs font-bold shadow-sm transition-colors";
    }
}

// 3. Handle Weekday Button Clicks (NEW)
function toggleBpWeekday(dayIndex, btn) {
    if (bpSelectedWeekdays.includes(dayIndex)) {
        bpSelectedWeekdays = bpSelectedWeekdays.filter(d => d !== dayIndex);
        btn.className = "h-8 flex-1 rounded bg-base border border-border text-xs font-bold text-muted hover:text-primary transition-colors";
    } else {
        bpSelectedWeekdays.push(dayIndex);
        btn.className = "h-8 flex-1 rounded bg-primary text-white text-xs font-bold shadow-sm transition-colors";
    }
}

// 4. Add Item
function addBackpackItem() {
    const nameInput = document.getElementById('bp-new-name');
    const typeInput = document.getElementById('bp-new-type');
    const text = nameInput.value.trim();

    if (!text) return;

    let newItem = { text: text, type: typeInput.value, value: null };

    if (typeInput.value === 'weekday') {
        if (bpSelectedWeekdays.length === 0) return alert("Select at least one day of the week.");
        newItem.value = bpSelectedWeekdays.sort((a,b) => a - b);
    } 
    else if (typeInput.value === 'cycle') {
        if (bpSelectedCycles.length === 0) return alert("Select at least one Cycle Day.");
        newItem.value = bpSelectedCycles.sort((a,b) => a - b);
    }

    if (!settings.backpack) settings.backpack = [];
    settings.backpack.push(newItem);

    nameInput.value = '';
    typeInput.value = 'always';
    toggleBpInputs();

    saveData();
    if(typeof renderBackpackList === 'function') renderBackpackList();
}

// 5. Delete Item
function deleteBackpackItem(index) {
    if(settings.backpack && settings.backpack[index]) {
        settings.backpack.splice(index, 1);
        saveData();
        if(typeof renderBackpackList === 'function') renderBackpackList();
    }
}

// 6. Generate Logic
function pushBackpackTasks() {
    if (!settings.backpack || settings.backpack.length === 0) return alert("Checklist empty!");

    const today = new Date();
    const currentWeekday = today.getDay(); // 0-6

    let currentCycle = null;
    if(typeof getCycleDay === 'function') currentCycle = getCycleDay(today);

    const itemsNeeded = settings.backpack.filter(item => {
        if (typeof item === 'string' || item.type === 'always') return true;

        // Check Weekdays (Array logic)
        if (item.type === 'weekday') {
            const vals = Array.isArray(item.value) ? item.value : [item.value];
            return vals.includes(currentWeekday);
        }

        // Check Cycles (Array logic)
        if (item.type === 'cycle' && currentCycle !== null) {
            const vals = Array.isArray(item.value) ? item.value : [item.value];
            return vals.includes(currentCycle);
        }

        return false;
    });

    if (itemsNeeded.length === 0) return alert("Nothing scheduled for today!");

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 0, 0);

    const checkItems = itemsNeeded.map(item => ({ text: item.text, done: false }));

    globalTasks.push({
        id: Date.now(), 
        title: "🎒 Backpack Check", 
        course: "Personal", 
        due: todayEnd.toISOString(),
        type: "TASK", 
        est: 5, 
        completed: false, 
        checklist: checkItems
    });

    saveData();
    if(typeof renderMatrix === 'function') renderMatrix();
    if(typeof showToast === 'function') showToast(`Added ${checkItems.length} items`, "success");
    switchStudentView('dashboard');
}

/* --- MODAL: CLASS SETTINGS --- */

function openStudentClassSettings(className) {
    const modal = document.getElementById('classSettingsModal');
    if(!modal) return;
    document.getElementById('modal-class-name').innerText = className;
    const picker = document.getElementById('class-color-picker');
    if(picker) picker.value = classPreferences[className] || '#000000';
    modal.dataset.targetClass = className;
    modal.classList.remove('hidden');
}

function saveClassSettings() {
    const modal = document.getElementById('classSettingsModal');
    const className = modal.dataset.targetClass;
    const picker = document.getElementById('class-color-picker');

    if (className && picker) {
        classPreferences[className] = picker.value;
        saveData();
        modal.classList.add('hidden');
        if(typeof renderMatrix === 'function') renderMatrix();
        if(typeof renderStats === 'function') renderStats();
        if(typeof renderProfile === 'function') renderProfile();
        if(viewClassTarget === className) openClassDetail(className);
        playSound('success');
    }
}

/* --- MODAL: ADD TASK --- */

function openStudentModal() {
    const modal = document.getElementById('addModal');
    const select = document.getElementById('m-course');
    if(select) {
        select.innerHTML = '';
        classes.forEach(c => select.innerHTML += `<option value="${c}">${c}</option>`);
    }
    document.getElementById('m-title').value = '';
    document.getElementById('m-due').value = '';
    modal.classList.remove('hidden');
}

function addTask() {
    const title = document.getElementById('m-title').value;
    const due = document.getElementById('m-due').value;
    const course = document.getElementById('m-course').value;
    const est = document.getElementById('m-est').value || 15;

    if(!title || !due) return alert("Title and Date required");

    globalTasks.push({
        id: Date.now(), title, course, 
        due: new Date(due).toISOString(),
        type: "TASK", est: parseInt(est),
        completed: false, checklist: []
    });

    saveData();
    document.getElementById('addModal').classList.add('hidden');
    if(typeof renderMatrix === 'function') renderMatrix();
    if(typeof renderWelcomeBanner === 'function') renderWelcomeBanner();
    playSound('success');
}

/* --- MODAL: EDIT TASK / CHECKLISTS --- */

function openTaskDetails(id) {
    activeTaskId = id;
    const t = globalTasks.find(x => x.id === id);
    if(!t) return;

    document.getElementById('d-title').value = t.title;
    document.getElementById('d-desc').value = t.desc || "";

    // Fix Date Format for Input
    const localDate = new Date(t.due);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    document.getElementById('d-due').value = localDate.toISOString().slice(0,16);

    // Initial Checklist Render
    renderChecklist(t);

    document.getElementById('detailModal').classList.remove('hidden');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.add('hidden');
    activeTaskId = null;
}

function saveTaskDetails() {
    const t = globalTasks.find(x => x.id === activeTaskId);
    if(t) {
        t.title = document.getElementById('d-title').value;
        t.desc = document.getElementById('d-desc').value;
        t.due = new Date(document.getElementById('d-due').value).toISOString();

        saveData();

        if(typeof renderMatrix === 'function') renderMatrix();
        if(typeof renderWelcomeBanner === 'function') renderWelcomeBanner();
        if(viewClassTarget && typeof renderClassDetailList === 'function') renderClassDetailList(viewClassTarget);

        closeDetailModal();
        playSound('success');
    }
}

function deleteTask() {
    if(confirm("Delete task?")) {
        globalTasks = globalTasks.filter(t => t.id !== activeTaskId);
        saveData();
        if(typeof renderMatrix === 'function') renderMatrix();
        if(typeof renderWelcomeBanner === 'function') renderWelcomeBanner();
        if(viewClassTarget && typeof renderClassDetailList === 'function') renderClassDetailList(viewClassTarget);
        closeDetailModal();
    }
}

/* --- CHECKLIST SUB-FUNCTIONS --- */

function renderChecklist(task) {
    const container = document.getElementById('d-checklist-container');
    const progress = document.getElementById('d-checklist-progress');

    if(!container) return;

    container.innerHTML = '';

    if(!task.checklist) task.checklist = [];

    // Update Progress Text
    const done = task.checklist.filter(i => i.done).length;
    if(progress) progress.innerText = `${done}/${task.checklist.length}`;

    // Render Items
    task.checklist.forEach((item, index) => {
        // Safe onclick handlers using global functions
        container.innerHTML += `
        <div class="flex items-center gap-3 bg-base p-3 rounded-lg border border-border group transition-colors hover:border-primary/50">
            <button onclick="toggleSubtask(${index})" class="text-xl ${item.done ? 'text-primary' : 'text-muted'} hover:text-primary transition-colors">
                <i class="fa-${item.done ? 'solid fa-square-check' : 'regular fa-square'}"></i>
            </button>
            <span class="${item.done ? 'line-through text-muted' : 'text-text'} text-sm flex-1 break-words">${item.text}</span>
            <button onclick="deleteSubtask(${index})" class="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-surface w-8 h-8 rounded flex items-center justify-center transition-all">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>`;
    });
}

function addSubtask() {
    const input = document.getElementById('d-new-subtask');
    if(!input || !activeTaskId) return;

    const text = input.value.trim();
    if(!text) return;

    const t = globalTasks.find(x => x.id === activeTaskId);
    if(t) {
        if(!t.checklist) t.checklist = [];
        t.checklist.push({ text: text, done: false });
        input.value = '';
        saveData();
        renderChecklist(t);
    }
}

function toggleSubtask(index) {
    const t = globalTasks.find(x => x.id === activeTaskId);
    if(t && t.checklist[index]) {
        t.checklist[index].done = !t.checklist[index].done;
        saveData();
        renderChecklist(t);
    }
}

function deleteSubtask(index) {
    const t = globalTasks.find(x => x.id === activeTaskId);
    if(t && t.checklist[index]) {
        t.checklist.splice(index, 1);
        saveData();
        renderChecklist(t);
    }
}

/* --- MAIN TASK COMPLETION --- */

/* --- INTERACTIVE COMPLETION LOGIC --- */

let completingTaskId = null; // Track which task we are finishing

function toggleComplete(id) {
    const t = globalTasks.find(x => x.id === id);
    if(!t) return;

    // 1. If already done, just UNDO it immediately (no modal needed)
    if(t.completed) {
        t.completed = false;
        t.difficulty = null;
        t.actualTime = null;
        saveData();
        refreshAllViews();
        return;
    }

    // 2. If not done, OPEN THE MODAL
    completingTaskId = id;

    // Reset Modal UI
    document.getElementById('cm-difficulty').value = 0;
    document.getElementById('cm-time').value = t.est || ""; // Pre-fill with estimated time

    // Clear button styles
    document.querySelectorAll('.diff-btn').forEach(b => {
        b.classList.remove('bg-primary', 'text-white', 'border-primary', 'scale-110');
        b.style.backgroundColor = ''; 
        b.style.color = '';
    });

    document.getElementById('completionModal').classList.remove('hidden');
}

function setDifficulty(val) {
    document.getElementById('cm-difficulty').value = val;

    // Visual Highlight logic
    document.querySelectorAll('.diff-btn').forEach(b => {
        // Reset to base
        b.className = "diff-btn w-10 h-10 rounded-lg border border-border transition-all font-bold text-muted";

        // Re-apply hover classes (needed because we wiped them above)
        const v = parseInt(b.getAttribute('data-val'));
        if(v === 1) b.classList.add('hover:bg-green-500', 'hover:text-white');
        if(v === 2) b.classList.add('hover:bg-yellow-500', 'hover:text-white');
        if(v === 3) b.classList.add('hover:bg-orange-500', 'hover:text-white');
        if(v === 4) b.classList.add('hover:bg-red-500', 'hover:text-white');
        if(v === 5) b.classList.add('hover:bg-purple-600', 'hover:text-white');
    });

    // Highlight the selected one
    const selectedBtn = document.querySelector(`.diff-btn[data-val="${val}"]`);
    if(selectedBtn) {
        selectedBtn.classList.remove('text-muted', 'border-border');
        // Apply specific color based on value
        if(val === 1) selectedBtn.classList.add('bg-green-500', 'text-white', 'border-green-500', 'scale-110', 'shadow-lg');
        if(val === 2) selectedBtn.classList.add('bg-yellow-500', 'text-white', 'border-yellow-500', 'scale-110', 'shadow-lg');
        if(val === 3) selectedBtn.classList.add('bg-orange-500', 'text-white', 'border-orange-500', 'scale-110', 'shadow-lg');
        if(val === 4) selectedBtn.classList.add('bg-red-500', 'text-white', 'border-red-500', 'scale-110', 'shadow-lg');
        if(val === 5) selectedBtn.classList.add('bg-purple-600', 'text-white', 'border-purple-600', 'scale-110', 'shadow-lg');
    }
}

function confirmCompletion() {
    const t = globalTasks.find(x => x.id === completingTaskId);
    if(t) {
        const diff = parseInt(document.getElementById('cm-difficulty').value);
        const time = parseInt(document.getElementById('cm-time').value);

        t.completed = true;
        t.difficulty = diff || 0; 
        t.actualTime = time || t.est; // Default to estimate if they left it blank

        streak++;
        playSound('complete');

        saveData();
        refreshAllViews();
        document.getElementById('completionModal').classList.add('hidden');

        if(typeof showToast === 'function') showToast("Mission Accomplished! 🚀", "success");
    }
}

function refreshAllViews() {
    if(typeof renderMatrix === 'function') renderMatrix();
    if(typeof renderStats === 'function') renderStats(); // If you use stats
    if(typeof renderWelcomeBanner === 'function') renderWelcomeBanner();
    if(typeof viewClassTarget !== 'undefined' && viewClassTarget && typeof renderClassDetailList === 'function') {
        renderClassDetailList(viewClassTarget);
    }
}

/* --- DAY DETAIL / TOPIC VIEW --- */

function openDayDetail(dateKey) {
    const modal = document.getElementById('dayDetailModal');
    const title = document.getElementById('dd-date-title');
    const container = document.getElementById('dd-content');

    if(!modal || !container) return;

    // Format Date for Title
    const dateObj = new Date(dateKey + "T00:00:00"); // Force local time
    title.innerText = dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

    container.innerHTML = '';

    // Loop through user's classes
    classes.forEach(cls => {
        if(cls === 'Personal') return; // Skip Personal

        const color = classPreferences[cls] || '#888';

        // 1. Get Topic (Safety check: classTopics might be undefined)
        let topic = "No topic posted.";
        if (typeof classTopics !== 'undefined' && classTopics[cls] && classTopics[cls][dateKey]) {
            topic = classTopics[cls][dateKey];
        }

        // 2. Get Tasks due that day
        const tasks = globalTasks.filter(t => {
            if(t.course !== cls) return false;
            const tDate = t.due.split('T')[0];
            return tDate === dateKey && !t.completed;
        });

        // 3. Build Card HTML
        let taskHtml = '';
        if(tasks.length > 0) {
            taskHtml = `<div class="mt-2 pt-2 border-t border-border/50 flex flex-wrap gap-2">
                ${tasks.map(t => `<span class="text-[10px] font-bold bg-base border border-border px-2 py-1 rounded text-text"><i class="fa-solid fa-circle-exclamation text-primary mr-1"></i> ${t.title}</span>`).join('')}
            </div>`;
        }

        const topicStyle = topic !== "No topic posted." ? "text-text font-medium" : "text-muted italic";

        container.innerHTML += `
        <div class="bg-surface border border-border p-4 rounded-xl flex gap-4 relative overflow-hidden">
            <div class="w-1 absolute left-0 top-0 bottom-0" style="background:${color}"></div>
            <div class="flex-1">
                <h3 class="text-sm font-bold uppercase tracking-wider mb-1" style="color:${color}">${cls}</h3>
                <div class="text-sm ${topicStyle}">
                    <i class="fa-solid fa-person-chalkboard mr-2 opacity-50"></i> ${topic}
                </div>
                ${taskHtml}
            </div>
        </div>`;
    });

    modal.classList.remove('hidden');
}
/* --- SECURITY --- */

function changePassword() {
    const oldP = document.getElementById('sec-old-pass').value;
    const newP = document.getElementById('sec-new-pass').value;

    if(!oldP || !newP) return alert("Please fill in both password fields.");

    // 1. Verify Old Password
    if(oldP !== currentUser.password) return alert("Incorrect current password.");

    // 2. Update Session
    currentUser.password = newP;
    localStorage.setItem("twa_current_user", JSON.stringify(currentUser));

    // 3. Update Database (So it works on next login)
    const usersRaw = localStorage.getItem("operation_twa_users");
    if(usersRaw) {
        const users = JSON.parse(usersRaw);
        const idx = users.findIndex(u => u.email === currentUser.email);
        if(idx > -1) {
            users[idx].password = newP;
            localStorage.setItem("operation_twa_users", JSON.stringify(users));
        }
    }

    // 4. Reset UI
    document.getElementById('sec-old-pass').value = '';
    document.getElementById('sec-new-pass').value = '';
    
    if(typeof showToast === 'function') showToast("Password Changed Successfully", "success");
    else alert("Password Changed");
} 

/* --- CALENDAR NAVIGATION --- */

function changeCalendarWeek(amount) {
    if (amount === 0) calendarOffset = 0;
    else calendarOffset += amount;

    if(typeof renderCalendar === 'function') renderCalendar();
}

/* --- DASHBOARD VIEW SWITCHER --- */

function setDashboardView(mode) {
    dashboardViewMode = mode;
    saveData();

    // Update Buttons & Views
    // Added 'planner' to the list
    ['matrix', 'planner', 'stream', 'kanban'].forEach(m => {
        const btn = document.getElementById(`btn-view-${m}`);
        const view = document.getElementById(`view-mode-${m}`);

        if (m === mode) {
            btn.className = "px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 bg-primary text-white shadow-sm";
            view.classList.remove('hidden');
        } else {
            btn.className = "px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 text-muted hover:text-text hover:bg-surface";
            view.classList.add('hidden');
        }
    });

    // Trigger Render
    if (mode === 'matrix' && typeof renderMatrix === 'function') renderMatrix();
    if (mode === 'planner' && typeof renderStudentPlanner === 'function') renderStudentPlanner(); // NEW
    if (mode === 'stream' && typeof renderStream === 'function') renderStream();
    if (mode === 'kanban' && typeof renderKanban === 'function') renderKanban();
}

/* --- PLANNER NAVIGATION --- */
function changeStudentPlannerWeek(amount) {
    if (amount === 0) studentPlannerOffset = 0;
    else studentPlannerOffset += amount;

    if(typeof renderStudentPlanner === 'function') renderStudentPlanner();
}