/* =========================================
   1. DATA & CONFIG
   ========================================= */
const STORAGE_KEY = "operation_twa_v15_data";
let userRole = 'student';
let currentUser = { name: "Guest" };
let settings = { buffer: 0, workTime: 25, breakTime: 5, theme: 'dark' };
let streak = 14;
let activeTaskId = null; // For editing

let classes = ["AP Calculus", "AP Chemistry", "History", "Literature", "Physics 101", "Personal"];
let classPreferences = { 
    "AP Chemistry": "#10b981", 
    "AP Calculus": "#f43f5e", 
    "History": "#f59e0b", 
    "Literature": "#8b5cf6", 
    "Physics 101": "#3b82f6", 
    "Personal": "#94a3b8" 
};
let currentTeacherClass = "AP Calculus";

// Audio Sounds
const sounds = {
    complete: new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'),
    click: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
    success: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3')
};

// Default Data
const now = new Date();
const addH = h => new Date(now.getTime() + h*3600000).toISOString();
const addD = d => new Date(now.getTime() + d*86400000).toISOString();

let globalTasks = [
    { 
        id: 1, title: "Calculus Midterm", course: "AP Calculus", due: addH(4), type: "TEST", est: 120, pinned: false, completed: false,
        desc: "Chapters 1-4 cover derivatives and limits.",
        checklist: [{text: "Review limits", done: true}, {text: "Practice derivatives", done: false}]
    },
    { id: 2, title: "Ionic Bonds Wksht", course: "AP Chemistry", due: addD(1), type: "HOMEWORK", est: 45, pinned: false, completed: false, desc: "", checklist: [] }
];

/* =========================================
   2. UTILITIES (Save/Load/Sound/Timer)
   ========================================= */
function playSound(type) {
    if(sounds[type]) {
        sounds[type].currentTime = 0;
        sounds[type].volume = 0.5;
        sounds[type].play().catch(e => console.log("Interact first to play audio"));
    }
}

function saveData() {
    const data = {
        tasks: globalTasks,
        settings: settings,
        streak: streak,
        classes: classes,
        preferences: classPreferences
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) {
        const data = JSON.parse(raw);
        globalTasks = data.tasks || globalTasks;
        settings = data.settings || settings;
        streak = data.streak || 14;
        classes = data.classes || classes;
        classPreferences = data.preferences || classPreferences;
        if(settings.theme) document.documentElement.setAttribute('data-theme', settings.theme);
    }
}

// Timer
let timer = { interval: null, timeLeft: 25*60, isRunning: false };

function toggleTimer() {
    playSound('click');
    if(timer.isRunning) { 
        clearInterval(timer.interval); 
        timer.isRunning = false; 
        document.getElementById('timerIcon').className = "fa-solid fa-play"; 
    } else { 
        timer.isRunning = true; 
        document.getElementById('timerIcon').className = "fa-solid fa-pause"; 
        timer.interval = setInterval(() => { 
            if(timer.timeLeft > 0) { 
                timer.timeLeft--; 
                updateTimerUI(); 
            } else { 
                playSound('success');
                alert("Timer Done"); 
                resetTimer(); 
            } 
        }, 1000); 
    }
}

function resetTimer() { 
    clearInterval(timer.interval); 
    timer.isRunning = false; 
    timer.timeLeft = settings.workTime * 60; 
    document.getElementById('timerIcon').className = "fa-solid fa-play"; 
    updateTimerUI(); 
}

function updateTimerUI() { 
    const m = Math.floor(timer.timeLeft / 60).toString().padStart(2,'0'); 
    const s = (timer.timeLeft % 60).toString().padStart(2,'0'); 
    document.getElementById('timerDisplay').innerText = `${m}:${s}`; 
}

/* =========================================
   3. THEMES
   ========================================= */
const themesList = [
    { id: 'dark', name: 'Standard Dark', bg: '#111827', accent: '#3b82f6' },
    { id: 'light', name: 'Light Mode', bg: '#f3f4f6', accent: '#2563eb' },
    { id: 'cyberpunk', name: 'Cyberpunk', bg: '#050505', accent: '#00ff9f' },
    { id: 'midnight', name: 'Midnight Galaxy', bg: '#1e1b4b', accent: '#c084fc' },
    { id: 'evergreen', name: 'Evergreen', bg: '#064e3b', accent: '#10b981' },
    { id: 'ocean', name: 'Ocean Depth', bg: '#0f172a', accent: '#06b6d4' },
    { id: 'vista', name: 'Vista (Glass)', bg: '#38bdf8', accent: '#f472b6' },
    { id: 'sunset', name: 'Sunset', bg: 'linear-gradient(to bottom, #991b1b, #facc15)', accent: '#fbbf24' },
    { id: 'space', name: 'Deep Space', bg: '#050511', accent: '#38bdf8' },
    { id: 'academia', name: 'Dark Academia', bg: '#1c1917', accent: '#d4af37' },
    { id: 'lofi', name: 'Lo-Fi Chill', bg: '#e0e7ff', accent: '#a78bfa' },
    { id: 'oled', name: 'Midnight OLED', bg: '#000000', accent: '#00ff00' },
    { id: 'graph', name: 'Graph Paper', bg: '#ffffff', accent: '#db2777' },
    { id: 'frutiger', name: 'Frutiger Aero', bg: '#87CEEB', accent: '#0284c7' },
    { id: 'terminal', name: 'Terminal', bg: '#0c0c0c', accent: '#22c55e' },
    { id: 'blueprint', name: 'Blueprint', bg: '#1e3a8a', accent: '#ffffff' },
    { id: 'latte', name: 'Latte Shop', bg: '#fff7ed', accent: '#d97706' },
    { id: 'vaporwave', name: 'Vaporwave', bg: '#2a2139', accent: '#ec4899' },
    { id: 'paperback', name: 'Paperback', bg: '#fdf6e3', accent: '#cb4b16' },
    { id: 'light-academia', name: 'Light Academia', bg: '#f5f5dc', accent: '#a0522d' }
];

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    settings.theme = theme;
    saveData();
}

function renderThemeButtons(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    themesList.forEach(t => {
        container.innerHTML += `
        <button type="button" onclick="setTheme('${t.id}')" class="group relative overflow-hidden rounded-xl border border-border hover:border-primary transition-all text-left h-24 shadow-sm hover:scale-105">
            <div class="absolute inset-0" style="background:${t.bg}"></div>
            <div class="absolute inset-x-4 top-4 h-8 rounded bg-white/20 backdrop-blur-sm border border-white/10"></div>
            <div class="absolute inset-x-4 top-4 h-8 flex items-center px-2"><div class="w-2 h-2 rounded-full" style="background:${t.accent}"></div></div>
            <div class="absolute inset-x-0 bottom-0 p-2 bg-black/40 backdrop-blur-md"><span class="text-[10px] font-bold text-white uppercase tracking-wider">${t.name}</span></div>
        </button>`;
    });
}

/* =========================================
   4. STUDENT DASHBOARD
   ========================================= */
function initStudent() {
    loadData();
    document.getElementById('student-layout').classList.remove('hidden');
    document.getElementById('s-profileInitials').innerText = currentUser.name.slice(0,2).toUpperCase();
    document.getElementById('s-profileName').innerText = currentUser.name;
    document.getElementById('streak-count').innerText = streak + " Day Streak";
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString();
    renderThemeButtons('theme-selector');
    renderMatrix(); 
    renderStats();
}

function switchStudentView(view) {
    playSound('click');
    ['dashboard', 'completed', 'profile', 'settings'].forEach(v => {
        document.getElementById(`s-view-${v}`).classList.add('hidden');
        document.getElementById(`nav-s-${v}`).className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-muted hover:text-text hover:bg-base";
    });
    document.getElementById(`s-view-${view}`).classList.remove('hidden');
    document.getElementById(`nav-s-${view}`).className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-primary bg-base border border-border";
    if(view === 'dashboard') renderMatrix();
    if(view === 'completed') renderCompleted();
    if(view === 'profile') renderProfile();
}

function renderMatrix() {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const headerRow = document.getElementById('matrix-header-row');
    const body = document.getElementById('matrix-body');
    headerRow.innerHTML = `<th class="p-4 text-left text-muted font-bold w-32 bg-surface border-b border-border sticky left-0 z-10 shadow-lg">Day</th>`;
    classes.forEach(c => { const color = classPreferences[c] || '#888'; headerRow.innerHTML += `<th class="p-4 text-left font-bold border-b border-border min-w-[180px]" style="color:${color}">${c}</th>`; });
    body.innerHTML = '';
    days.forEach((day, dayIndex) => {
        let rowHTML = `<tr class="border-b border-border hover:bg-surface/30 transition-colors"><td class="p-4 bg-surface border-r border-border font-bold sticky left-0 z-10">${day}</td>`;
        classes.forEach(cls => {
            const cellTasks = globalTasks.filter(t => !t.completed && t.course === cls && (new Date(t.due).getDay() === dayIndex + 1)); 
            rowHTML += `<td class="p-2 align-top matrix-cell">`;
            cellTasks.forEach(t => rowHTML += createMatrixCard(t));
            rowHTML += `</td>`;
        });
        rowHTML += `</tr>`;
        body.innerHTML += rowHTML;
    });
}

function createMatrixCard(t) {
    const color = classPreferences[t.course] || '#888';
    const displayDate = new Date(new Date(t.due).getTime() - (settings.buffer * 60000));
    const timeStr = displayDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    const icon = t.type === 'TEST' ? 'fa-triangle-exclamation' : 'fa-book';

    let progressHtml = '';
    if(t.checklist && t.checklist.length > 0) {
        const done = t.checklist.filter(i=>i.done).length;
        const total = t.checklist.length;
        progressHtml = `<div class="mt-2 h-1 w-full bg-base rounded-full overflow-hidden"><div class="h-full bg-primary" style="width:${(done/total)*100}%"></div></div>`;
    }

    return `
    <div onclick="openTaskDetails(${t.id})" class="bg-surface border border-border rounded-lg mb-2 shadow-sm overflow-hidden hover:shadow-md hover:scale-[1.02] transition-all group cursor-pointer relative">
        <div class="h-1 w-full" style="background:${color}"></div>
        <div class="p-3">
            <div class="flex justify-between items-start mb-1">
                <i class="fa-solid ${icon} text-muted text-xs"></i>
                <button onclick="event.stopPropagation(); toggleComplete(${t.id})" class="text-muted hover:text-accent w-6 h-6 flex items-center justify-center rounded hover:bg-base transition-colors">
                    <i class="fa-regular fa-square"></i>
                </button>
            </div>
            <div class="font-bold text-sm leading-tight mb-1">${t.title}</div>
            <div class="flex justify-between items-center text-xs text-muted">
                <span><i class="fa-regular fa-clock"></i> ${timeStr}</span>
                <span class="group-hover:text-primary"><i class="fa-solid fa-stopwatch"></i> ${t.est}m</span>
            </div>
            ${progressHtml}
        </div>
    </div>`;
}

// --- MODALS & EDITING ---

function openTaskDetails(id) {
    playSound('click');
    activeTaskId = id;
    const t = globalTasks.find(x => x.id === id);
    if(!t) return;
    document.getElementById('d-title').value = t.title;
    document.getElementById('d-course-badge').innerText = t.course;
    document.getElementById('d-course-badge').style.borderColor = classPreferences[t.course];
    document.getElementById('d-course-badge').style.color = classPreferences[t.course];
    const localDate = new Date(t.due);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    document.getElementById('d-due').value = localDate.toISOString().slice(0,16);
    document.getElementById('d-desc').value = t.desc || "";
    renderChecklist(t);
    document.getElementById('detailModal').classList.remove('hidden');
}

function renderChecklist(task) {
    const container = document.getElementById('d-checklist-container');
    const progress = document.getElementById('d-checklist-progress');
    container.innerHTML = '';
    if(!task.checklist) task.checklist = [];
    task.checklist.forEach((item, index) => {
        container.innerHTML += `
        <div class="flex items-center gap-3 bg-base p-2 rounded-lg border border-border group">
            <button onclick="toggleSubtask(${index})" class="text-${item.done ? 'primary' : 'muted'} hover:text-primary">
                <i class="fa-${item.done ? 'solid fa-square-check' : 'regular fa-square'}"></i>
            </button>
            <span class="${item.done ? 'line-through text-muted' : 'text-text'} text-sm flex-1">${item.text}</span>
            <button onclick="deleteSubtask(${index})" class="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-surface w-6 h-6 rounded flex items-center justify-center transition-all"><i class="fa-solid fa-xmark"></i></button>
        </div>`;
    });
    const done = task.checklist.filter(i => i.done).length;
    progress.innerText = `${done}/${task.checklist.length}`;
}

function handleSubtaskEnter(e) { if(e.key === 'Enter') addSubtask(); }

function addSubtask() {
    const input = document.getElementById('d-new-subtask');
    const text = input.value.trim();
    if(!text || !activeTaskId) return;
    const t = globalTasks.find(x => x.id === activeTaskId);
    t.checklist.push({ text: text, done: false });
    input.value = '';
    playSound('click');
    renderChecklist(t);
}

function toggleSubtask(index) {
    const t = globalTasks.find(x => x.id === activeTaskId);
    t.checklist[index].done = !t.checklist[index].done;
    if(t.checklist[index].done) playSound('click');
    renderChecklist(t);
}

function deleteSubtask(index) {
    const t = globalTasks.find(x => x.id === activeTaskId);
    t.checklist.splice(index, 1);
    renderChecklist(t);
}

function saveTaskDetails() {
    const t = globalTasks.find(x => x.id === activeTaskId);
    if(t) {
        t.title = document.getElementById('d-title').value;
        t.desc = document.getElementById('d-desc').value;
        t.due = new Date(document.getElementById('d-due').value).toISOString();
        saveData();
        playSound('success');
        closeDetailModal();
        renderMatrix();
    }
}

function deleteTask() {
    if(confirm("Delete this task?")) {
        globalTasks = globalTasks.filter(t => t.id !== activeTaskId);
        saveData();
        closeDetailModal();
        renderMatrix();
    }
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.add('hidden');
    activeTaskId = null;
}

function toggleComplete(id) { 
    const t = globalTasks.find(x => x.id === id); 
    if(t) { 
        t.completed = !t.completed; 
        if(t.completed) { 
            streak++; 
            document.getElementById('streak-count').innerText = streak + " Day Streak"; 
            playSound('complete');
        }
        saveData();
        renderMatrix(); 
        renderStats(); 
    } 
}

function openStudentModal() { document.getElementById('addModal').classList.remove('hidden'); }

function addTask() {
    const title = document.getElementById('m-title').value; const due = document.getElementById('m-due').value;
    if(!title || !due) return alert("Info required");
    globalTasks.push({id:Date.now(), title, course:"Personal", due: new Date(due).toISOString(), type:"TASK", est:15, completed:false, checklist: []});
    saveData();
    document.getElementById('addModal').classList.add('hidden'); 
    renderMatrix();
    playSound('success');
}

function renderStats() {
    const bar = document.getElementById('stats-bar');
    bar.innerHTML = '';
    let counts = {};
    classes.forEach(c => counts[c] = 0);
    globalTasks.filter(t=>t.completed).forEach(t => counts[t.course] = (counts[t.course]||0)+1);
    classes.slice(0,4).forEach(c => { bar.innerHTML += `<div class="bg-surface p-3 rounded-xl border border-border"><div class="text-xs text-muted truncate">${c}</div><div class="text-xl font-bold" style="color:${classPreferences[c]}">${counts[c]} Done</div></div>`; });
}

function renderCompleted() {
    const list = document.getElementById('list-completed');
    list.innerHTML = '';
    globalTasks.filter(t => t.completed).sort((a,b) => new Date(b.due) - new Date(a.due)).forEach(t => { list.innerHTML += `<div class="flex items-center gap-4 bg-surface p-4 rounded-xl border border-border opacity-60"><i class="fa-solid fa-check-circle text-accent text-xl"></i><div><div class="font-bold line-through">${t.title}</div><div class="text-xs text-muted">${t.course}</div></div></div>`; });
}

function renderProfile() {
    const list = document.getElementById('profile-list');
    list.innerHTML = '';
    classes.forEach(c => { list.innerHTML += `<div class="bg-surface p-6 rounded-xl border border-border flex justify-between items-center shadow-md"><div class="flex items-center gap-4"><div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg" style="background:${classPreferences[c]}">${c.substring(0,1)}</div><div><span class="font-bold text-lg block">${c}</span><span class="text-xs text-muted">Student Enrolled</span></div></div><button onclick="openStudentClassSettings('${c}')" class="bg-base hover:bg-border text-text px-4 py-2 rounded-lg text-sm font-medium transition-colors">Customize</button></div>`; });
}

function openStudentClassSettings(className) {
    document.getElementById('classSettingsModal').classList.remove('hidden');
    document.getElementById('modal-class-name').innerText = className;
    document.getElementById('class-color-picker').value = classPreferences[className] || '#000000';
    document.getElementById('rename-container').classList.add('hidden');
    currentTeacherClass = className; 
}

function saveSettings() {
    playSound('click');
    settings.buffer = parseInt(document.getElementById('setting-buffer').value);
    settings.workTime = parseInt(document.getElementById('setting-work').value);
    settings.breakTime = parseInt(document.getElementById('setting-break').value);
    saveData();
    resetTimer(); 
    renderMatrix(); 
}

/* =========================================
   5. TEACHER DASHBOARD
   ========================================= */
function initTeacher() {
    document.getElementById('teacher-layout').classList.remove('hidden');
    document.getElementById('t-profileInitials').innerText = currentUser.name.slice(0,2).toUpperCase();
    document.getElementById('t-profileName').innerText = currentUser.name;
    renderTeacherNav(); teacherSwitchClass("AP Calculus"); renderThemeButtons('t-theme-selector');
}

function renderTeacherNav() {
    const list = document.getElementById('teacher-class-list');
    list.innerHTML = '';
    classes.filter(c => c !== 'Personal').forEach(c => { list.innerHTML += `<button onclick="teacherSwitchClass('${c}')" id="nav-t-${c.replace(/\s/g,'')}" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-muted hover:bg-surface hover:text-text transition-colors text-left"><span class="w-2 h-2 rounded-full" style="background:${classPreferences[c]}"></span> ${c}</button>`; });
}

function teacherSwitchClass(cls) {
    currentTeacherClass = cls;
    document.getElementById('t-view-class').classList.remove('hidden');
    document.getElementById('t-view-settings').classList.add('hidden');
    document.getElementById('t-active-class-title').innerText = cls;
    document.getElementById('t-form-class-name').innerText = cls;
    classes.filter(c => c !== 'Personal').forEach(c => { document.getElementById(`nav-t-${c.replace(/\s/g,'')}`).className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-muted hover:bg-surface hover:text-text transition-colors text-left"; });
    document.getElementById(`nav-t-${cls.replace(/\s/g,'')}`).className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold bg-base text-primary border border-border text-left shadow-sm";
    document.getElementById('nav-t-settings').className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-muted hover:text-text hover:bg-base transition-colors mb-4";
    renderTeacherFeed();
}

function switchTeacherView(view) {
    if(view === 'settings') {
        document.getElementById('t-view-class').classList.add('hidden');
        document.getElementById('t-view-settings').classList.remove('hidden');
        document.getElementById('nav-t-settings').className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold bg-base text-primary border border-border transition-colors mb-4";
        classes.filter(c => c !== 'Personal').forEach(c => { document.getElementById(`nav-t-${c.replace(/\s/g,'')}`).className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-muted hover:bg-surface hover:text-text transition-colors text-left"; });
    }
}

function teacherPostAssignment() {
    const title = document.getElementById('t-title').value; const due = document.getElementById('t-due-date').value;
    if(!title || !due) return alert("Missing Info");
    globalTasks.push({ id: Date.now(), title, course: currentTeacherClass, due: new Date(due).toISOString(), type: document.getElementById('t-type').value, est: document.getElementById('t-est-time').value || 30, completed: false, pinned: false, checklist: [] });
    document.getElementById('t-title').value = ''; renderTeacherFeed(); alert("Assignment Posted!");
}

function renderTeacherFeed() {
    const feed = document.getElementById('teacher-feed'); feed.innerHTML = '';
    const tasks = globalTasks.filter(t => t.course === currentTeacherClass && !t.completed);
    if(tasks.length === 0) feed.innerHTML = '<p class="text-muted italic">No active assignments.</p>';
    tasks.forEach(t => { feed.innerHTML += `<div class="bg-surface p-4 rounded-xl border border-border flex justify-between items-center"><div><div class="text-[10px] font-bold text-primary uppercase">${t.type}</div><div class="font-bold">${t.title}</div><div class="text-xs text-muted">${new Date(t.due).toLocaleDateString()}</div></div></div>`; });
}

function openClassSettings() {
    document.getElementById('classSettingsModal').classList.remove('hidden');
    document.getElementById('modal-class-name').innerText = currentTeacherClass;
    document.getElementById('class-rename').value = currentTeacherClass;
    document.getElementById('class-color-picker').value = classPreferences[currentTeacherClass] || '#000000';
    document.getElementById('rename-container').classList.remove('hidden');
}

function saveClassSettings() {
    const newName = document.getElementById('class-rename').value;
    const newColor = document.getElementById('class-color-picker').value;
    classPreferences[currentTeacherClass] = newColor;
    if (userRole === 'teacher' && newName !== currentTeacherClass) {
        globalTasks.forEach(t => { if(t.course === currentTeacherClass) t.course = newName; });
        const idx = classes.indexOf(currentTeacherClass);
        if(idx !== -1) classes[idx] = newName;
        classPreferences[newName] = newColor;
        currentTeacherClass = newName;
    }
    document.getElementById('classSettingsModal').classList.add('hidden');
    if(userRole === 'student') { renderMatrix(); renderProfile(); } else { renderTeacherNav(); teacherSwitchClass(currentTeacherClass); }
}

/* =========================================
   6. MAIN ENTRY
   ========================================= */
function setRole(r) { 
    userRole = r;
    const active = "bg-primary text-white shadow-lg border-primary";
    const inactive = "text-muted hover:text-text hover:bg-surface border-transparent";
    document.getElementById('btn-role-student').className = `flex-1 py-3 text-sm font-bold rounded-lg transition-all border ${r==='student'?active:inactive}`;
    document.getElementById('btn-role-teacher').className = `flex-1 py-3 text-sm font-bold rounded-lg transition-all border ${r==='teacher'?active:inactive}`;
}

function handleLogin(e) {
    if(e) e.preventDefault();
    currentUser.name = document.getElementById('loginName').value || "User";
    document.getElementById('view-login').style.display = "none";
    if(userRole === 'student') initStudent(); else initTeacher();
}

function doLogout() { location.reload(); }

// INIT
loadData();
setTheme(settings.theme || 'space');
updateTimerUI();