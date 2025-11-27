/* =========================================
   TEACHER DASHBOARD LOGIC (Fixed Bulletin/Sticky Note)
   ========================================= */

function initTeacherUI() {
    // 1. Show Layout
    const layout = document.getElementById('teacher-layout');
    const studentLayout = document.getElementById('student-layout');

    if (layout) layout.classList.remove('hidden');
    if (studentLayout) studentLayout.classList.add('hidden');

    // 2. Set Profile Info
    if (currentUser) {
        const nameEl = document.getElementById('t-profileName');
        const initEl = document.getElementById('t-profileInitials');
        if (nameEl) nameEl.innerText = currentUser.name;
        if (initEl) initEl.innerText = currentUser.name.slice(0,2).toUpperCase();
    }

    // 3. Render Initial State
    renderTeacherNav(); 

    // Pick first academic class
    const firstClass = classes.find(c => c !== 'Personal') || classes[0];
    teacherSwitchClass(firstClass); 

    // Render Admin Tasks (Personal To-Do)
    renderTeacherTasks();

    // Theme buttons
    if(typeof renderThemeButtons === 'function') renderThemeButtons('t-theme-selector');
}

/* --- NAVIGATION & VIEWS --- */

function renderTeacherNav() {
    const list = document.getElementById('teacher-class-list');
    if (!list) return;
    list.innerHTML = '';

    // Filter out "Personal" so teachers only see academic courses
    classes.filter(c => c !== 'Personal').forEach(c => { 
        const color = classPreferences[c] || '#888';
        const isActive = c === currentTeacherClass;
        const activeClass = isActive ? "bg-base text-primary border-border shadow-sm font-bold" : "text-muted hover:bg-surface hover:text-text";

        list.innerHTML += `
        <button onclick="teacherSwitchClass('${c}')" id="nav-t-${c.replace(/\s/g,'')}" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent transition-colors text-left ${activeClass}">
            <span class="w-2 h-2 rounded-full" style="background:${color}"></span> ${c}
        </button>`; 
    });
}

function teacherSwitchClass(cls) {
    currentTeacherClass = cls;

    // 1. Update UI View
    document.getElementById('t-view-class').classList.remove('hidden');
    document.getElementById('t-view-settings').classList.add('hidden');

    // 2. Update Header Title
    const titleEl = document.getElementById('t-active-class-title');
    if (titleEl) titleEl.innerText = cls;

    // 3. Refresh Nav Highlight
    renderTeacherNav();

    // --- 4. CHECK FOR ACTIVE BULLETIN (STICKY NOTE) ---
    const bulletinContainer = document.getElementById('t-bulletin-container');
    const bulletinText = document.getElementById('t-bulletin-text');

    if (bulletinContainer && bulletinText) {
        // Check if global bulletin object has entry for this class
        if (typeof classBulletins !== 'undefined' && classBulletins[cls] && classBulletins[cls].active) {
            bulletinContainer.classList.remove('hidden');
            bulletinText.innerText = classBulletins[cls].msg;
        } else {
            bulletinContainer.classList.add('hidden');
            bulletinText.innerText = "";
        }
    }

    // 5. Load Feed & Roster
    renderTeacherFeed();
    renderRoster(); 
}

function switchTeacherView(view) {
    if (view === 'settings') {
        document.getElementById('t-view-class').classList.add('hidden');
        document.getElementById('t-view-settings').classList.remove('hidden');
    }
}

/* --- CLASSROOM MANAGEMENT --- */

function teacherPostAssignment() {
    const titleInput = document.getElementById('t-title');
    const dueInput = document.getElementById('t-due-date');
    const typeInput = document.getElementById('t-type');
    const estInput = document.getElementById('t-est-time');
    const tagInput = document.getElementById('t-tag');

    if (!titleInput.value || !dueInput.value) return alert("Missing Title or Due Date");

    globalTasks.push({ 
        id: Date.now(), 
        title: titleInput.value, 
        course: currentTeacherClass, 
        due: new Date(dueInput.value).toISOString(), 
        type: typeInput.value, 
        est: parseInt(estInput.value) || 30, 
        completed: false, 
        checklist: [], 
        tag: tagInput.value,
        pinned: false
    });

    saveData();
    titleInput.value = ''; 
    renderTeacherFeed(); 
    showToast("Assignment Posted!", "success");
}

function renderTeacherFeed() {
    const feed = document.getElementById('teacher-feed');
    if (!feed) return;
    feed.innerHTML = '';

    const tasks = globalTasks.filter(t => t.course === currentTeacherClass && !t.completed);

    if (tasks.length === 0) {
        feed.innerHTML = '<div class="p-4 text-center text-muted text-sm border border-dashed border-border rounded-xl">No active assignments.</div>';
        return;
    }

    tasks.forEach(t => {
        feed.innerHTML += `
        <div class="bg-surface p-3 rounded-xl border border-border flex justify-between items-center mb-2">
            <div>
                <div class="text-[10px] font-bold text-primary uppercase">${t.type}</div>
                <div class="font-bold text-sm">${t.title}</div>
                <div class="text-xs text-muted">${new Date(t.due).toLocaleDateString()}</div>
            </div>
            <button onclick="deleteTaskFromFeed(${t.id})" class="text-red-500 hover:bg-base p-2 rounded transition-colors"><i class="fa-solid fa-trash"></i></button>
        </div>`;
    });
}

function deleteTaskFromFeed(id) {
    if (confirm("Delete this assignment for all students?")) {
        const idx = globalTasks.findIndex(t => t.id === id);
        if (idx > -1) {
            globalTasks.splice(idx, 1);
            saveData();
            renderTeacherFeed();
            showToast("Assignment Deleted", "info");
        }
    }
}

/* --- BULLETIN / STICKY NOTE LOGIC --- */

function setBulletin() {
    const msg = prompt("Enter bulletin message for " + currentTeacherClass + ":");
    if(msg) {
        if(typeof classBulletins === 'undefined') classBulletins = {};

        classBulletins[currentTeacherClass] = { msg: msg, active: true };
        saveData();

        // Refresh UI to show the banner
        teacherSwitchClass(currentTeacherClass);
        showToast("Bulletin Posted", "success");
    }
}

function clearBulletin() {
    if(typeof classBulletins !== 'undefined' && classBulletins[currentTeacherClass]) {
        // Deactivate it
        classBulletins[currentTeacherClass].active = false;
        saveData();

        // Refresh UI to hide the banner
        teacherSwitchClass(currentTeacherClass);
        showToast("Bulletin Cleared", "info");
    }
}

function bulkShiftDates() {
    const daysStr = prompt("SNOW DAY PROTOCOL:\nShift all active due dates by how many days?", "1");
    if(!daysStr) return;

    const days = parseInt(daysStr);
    if(isNaN(days)) return alert("Invalid number");

    let count = 0;
    globalTasks.forEach(t => {
        if(!t.completed && t.course === currentTeacherClass) {
            const currentDue = new Date(t.due);
            currentDue.setDate(currentDue.getDate() + days);
            t.due = currentDue.toISOString();
            count++;
        }
    });

    saveData();
    renderTeacherFeed();
    showToast(`Shifted ${count} assignments by ${days} day(s).`, "success");
}

/* --- ROSTER & OBSERVER MODE --- */

function renderRoster() {
    const list = document.getElementById('student-roster-list');
    if (!list) return;
    list.innerHTML = '';

    studentRoster.forEach(s => {
        const lastActive = new Date(s.lastActive);
        const now = new Date();
        const diffHours = (now - lastActive) / 36e5;

        let statusColor = 'bg-green-500';
        if (diffHours > 24) statusColor = 'bg-yellow-500';
        if (diffHours > 72) statusColor = 'bg-red-500';

        list.innerHTML += `
        <div class="flex items-center justify-between bg-base p-3 rounded-xl border border-border">
            <div class="flex items-center gap-3">
                <div class="relative">
                    <div class="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-bold">
                        ${s.name.substring(0,2).toUpperCase()}
                    </div>
                    <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${statusColor} border border-base"></span>
                </div>
                <div>
                    <div class="font-bold text-sm">${s.name}</div>
                    <div class="text-[10px] text-muted">Grade: ${s.grade}%</div>
                </div>
            </div>
            <button onclick="enterObserverMode('${s.name}')" class="text-[10px] font-bold border border-border px-2 py-1 rounded hover:bg-surface hover:text-primary transition-colors">VIEW AS</button>
        </div>`;
    });
}

async function enterObserverMode(studentName) {
    const banner = document.getElementById('observer-banner');
    let studentLayout = document.getElementById('student-layout');

    // 1. If Student HTML is missing, fetch it now
    if (!studentLayout) {
        try {
            if(typeof showToast === 'function') showToast("Loading Student Simulation...", "info");
            const response = await fetch('layouts/student.html');
            if (!response.ok) throw new Error("Layout missing");
            const html = await response.text();
            document.getElementById('app-container').insertAdjacentHTML('beforeend', html);
            studentLayout = document.getElementById('student-layout');
        } catch (e) {
            console.error(e);
            return alert("Error: Could not load student simulation interface.");
        }
    }

    if (banner && studentLayout) {
        banner.classList.remove('hidden');
        document.getElementById('observer-name').innerText = studentName;
        document.getElementById('teacher-layout').classList.add('hidden');
        studentLayout.classList.remove('hidden');

        const profileName = document.getElementById('s-profileName');
        const profileInit = document.getElementById('s-profileInitials');
        if(profileName) profileName.innerText = studentName;
        if(profileInit) profileInit.innerText = studentName.slice(0,2).toUpperCase();

        if(typeof initStudentUI === 'function') {
            initStudentUI();
            if(typeof renderStudentBulletins === 'function') renderStudentBulletins();
            if(typeof showToast === 'function') showToast(`Viewing as ${studentName}`, "success");
        }
    }
}

function exitObserverMode() {
    const banner = document.getElementById('observer-banner');
    if (banner) banner.classList.add('hidden');
    document.getElementById('student-layout').classList.add('hidden');
    document.getElementById('teacher-layout').classList.remove('hidden');

    // Restore Name
    const nameEl = document.getElementById('t-profileName');
    if (nameEl) nameEl.innerText = currentUser.name;

    showToast("Returned to Faculty Hub", "success");
}

/* --- ADMIN TASKS --- */

function renderTeacherTasks() {
    const list = document.getElementById('teacher-personal-list');
    if (!list) return;
    list.innerHTML = '';

    if (!teacherTasks || teacherTasks.length === 0) {
        list.innerHTML = '<div class="text-xs text-muted italic">No active tasks.</div>';
        return;
    }

    teacherTasks.forEach((t, index) => {
        list.innerHTML += `
        <div class="flex items-center gap-2 text-sm mb-1 group">
            <button onclick="toggleTeacherTask(${index})" class="text-${t.done ? 'green-500' : 'muted'} hover:text-green-500">
                <i class="fa-${t.done ? 'solid fa-circle-check' : 'regular fa-circle'}"></i>
            </button>
            <span class="${t.done ? 'line-through text-muted' : 'text-text'} flex-1 truncate">${t.text}</span>
            <button onclick="deleteTeacherTask(${index})" class="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>`;
    });
}

function addTeacherTask() {
    const text = prompt("New Task:");
    if (text) {
        teacherTasks.push({ id: Date.now(), text: text, done: false });
        saveData();
        renderTeacherTasks();
    }
}

function toggleTeacherTask(index) {
    if(teacherTasks[index]) {
        teacherTasks[index].done = !teacherTasks[index].done;
        saveData();
        renderTeacherTasks();
    }
}

function deleteTeacherTask(index) {
    teacherTasks.splice(index, 1);
    saveData();
    renderTeacherTasks();
}