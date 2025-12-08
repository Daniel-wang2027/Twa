/* ==========================================================================
   TEACHER RENDERER (UI Generation)
   ==========================================================================
   PURPOSE: 
   1. Initializes the Teacher Interface.
   2. Renders the main Class Navigation sidebar.
   3. Renders the "Weekly Planner" grid (The main teacher view).
   4. Renders the Student Roster sidebar.
   ========================================================================== */

/* =========================================
   1. INITIALIZATION
   ========================================= */

function initTeacherUI() {
    const layout = document.getElementById('teacher-layout');
    const studentLayout = document.getElementById('student-layout');

    // Show Teacher UI, Hide Student UI
    if (layout) layout.classList.remove('hidden');
    if (studentLayout) studentLayout.classList.add('hidden');

    // Setup Header Profile
    if (currentUser) {
        const nameEl = document.getElementById('t-profileName');
        const initEl = document.getElementById('t-profileInitials');
        if (nameEl) nameEl.innerText = currentUser.name;
        if (initEl) initEl.innerText = currentUser.name.slice(0,2).toUpperCase();
    }

    // Set Default Class (Skip 'Personal')
    if (!classes.includes(currentTeacherClass)) {
        currentTeacherClass = classes.find(c => c !== 'Personal') || classes[0];
    }

    // Initial Renders
    renderTeacherNav();
    renderRosterSidebar();

    // Delay switch slightly to ensure DOM is ready
    setTimeout(() => {
        if (typeof teacherSwitchClass === 'function') {
            teacherSwitchClass(currentTeacherClass);
        }
    }, 50);
}

/* =========================================
   2. SIDEBAR NAVIGATION (Classes & Roster)
   ========================================= */

function renderTeacherNav() {
    const list = document.getElementById('teacher-class-list');
    if (!list) return;

    list.innerHTML = '';

    classes.filter(c => c !== 'Personal').forEach(c => { 
        const color = classPreferences[c] || '#888';
        const isActive = c === currentTeacherClass;

        // Visual Style (Active vs Inactive)
        const baseClass = "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left mb-1";
        const styleClass = isActive 
            ? "bg-white/10 text-white border border-white/20 shadow-sm" 
            : "text-white/50 hover:bg-white/5 hover:text-white border border-transparent";

        list.innerHTML += `
        <button onclick="teacherSwitchClass('${c}')" class="${baseClass} ${styleClass}">
            <div class="w-2 h-2 rounded-full" style="background:${color}; box-shadow: 0 0 8px ${color}"></div>
            <span>${c}</span>
        </button>`; 
    });
}

function renderRosterSidebar() {
    const container = document.getElementById('student-roster-sidebar');
    if (!container) return;

    container.innerHTML = '';

    if (typeof studentRoster === 'undefined') return;

    studentRoster.forEach(s => {
        // Calculate "Online Status" based on lastActive time
        const lastActive = new Date(s.lastActive);
        const diffHours = (new Date() - lastActive) / 36e5;

        let color = 'bg-green-500';      // Active recently
        if (diffHours > 24) color = 'bg-yellow-500'; // Active yesterday
        if (diffHours > 72) color = 'bg-red-500';    // Offline 3+ days

        container.innerHTML += `
        <div class="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 group cursor-default border border-transparent hover:border-white/10 transition-colors">
            <div class="flex items-center gap-3">
                <div class="relative">
                    <div class="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-xs font-bold text-white border border-white/10">${s.name.substring(0,2)}</div>
                    <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${color} border-2 border-black/50"></div>
                </div>
                <div class="text-xs font-bold text-white/90">${s.name}</div>
            </div>
            <button onclick="enterObserverMode('${s.name}')" class="opacity-0 group-hover:opacity-100 text-[10px] bg-black/40 border border-white/20 px-2 py-1 rounded hover:bg-white/20 text-white transition-all font-bold">
                View
            </button>
        </div>`;
    });
}

/* =========================================
   3. WEEKLY PLANNER GRID (Main View)
   ========================================= */

function renderTeacherPlanner() {
    const grid = document.getElementById('teacher-planner-grid');
    const weekLabel = document.getElementById('t-current-week-label');
    const titleEl = document.getElementById('t-active-class-title');

    if (!grid) {
        // Retry if grid isn't ready
        setTimeout(renderTeacherPlanner, 100);
        return;
    }

    grid.innerHTML = '';

    // --- A. INJECT NAVIGATION ARROWS ---
    if (titleEl && !document.getElementById('planner-nav-controls')) {
        const navHtml = `
            <div id="planner-nav-controls" class="inline-flex items-center ml-4 bg-base rounded-lg border border-border overflow-hidden">
                <button onclick="changePlannerWeek(-1)" class="px-3 py-1 hover:bg-white/10 border-r border-border text-xs"><i class="fa-solid fa-chevron-left"></i></button>
                <button onclick="changePlannerWeek(0)" class="px-3 py-1 hover:bg-white/10 border-r border-border text-xs font-bold">Today</button>
                <button onclick="changePlannerWeek(1)" class="px-3 py-1 hover:bg-white/10 text-xs"><i class="fa-solid fa-chevron-right"></i></button>
            </div>`;
        if (!titleEl.innerHTML.includes('planner-nav-controls')) {
            titleEl.innerHTML += navHtml;
        }
    }

    // --- B. PREPARE DATA ---
    if (typeof classTopics === 'undefined') classTopics = {};
    if (!classTopics[currentTeacherClass]) classTopics[currentTeacherClass] = {};

    // Calculate Week Range
    const curr = new Date(); 
    curr.setDate(curr.getDate() + (currentPlannerOffset * 7));

    const first = curr.getDate() - curr.getDay() + 1; // Monday
    const weekStart = new Date(curr.setDate(first));
    const weekEnd = new Date(new Date(weekStart).setDate(weekStart.getDate() + 6));

    // Update Header Label
    if (weekLabel) {
        weekLabel.innerText = `${weekStart.toLocaleDateString(undefined, {month:'short', day:'numeric'})} - ${weekEnd.toLocaleDateString(undefined, {month:'short', day:'numeric'})}`;
    }

    // --- C. RENDER 7 COLUMNS ---
    for (let i = 0; i < 7; i++) {
        const loopDate = new Date(weekStart);
        loopDate.setDate(weekStart.getDate() + i);

        const dateKey = loopDate.toISOString().split('T')[0];
        const dayName = loopDate.toLocaleDateString('en-US', { weekday: 'short' });
        const shortDate = loopDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
        const topic = classTopics[currentTeacherClass][dateKey] || "";

        // Cycle Day Badge
        let cycleBadge = '';
        const cycleNum = (typeof getCycleDay === 'function') ? getCycleDay(loopDate) : null;

        if (cycleNum) {
            const cycleColors = [
                'border-red-500 text-red-500', 'border-orange-500 text-orange-500',
                'border-yellow-500 text-yellow-500', 'border-green-500 text-green-500',
                'border-blue-500 text-blue-500', 'border-indigo-500 text-indigo-500',
                'border-purple-500 text-purple-500'
            ];
            const cColor = cycleColors[cycleNum - 1] || 'border-gray-500 text-gray-500';
            cycleBadge = `<div class="mt-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${cColor} bg-base inline-block">Day ${cycleNum}</div>`;
        } else {
            cycleBadge = `<div class="mt-1 text-[10px] font-bold text-muted/30 uppercase tracking-wider">--</div>`;
        }

        // Get Tasks for this specific day
        const dayTasks = globalTasks.filter(t => {
            if (t.course !== currentTeacherClass) return false;
            const tDate = new Date(t.due);
            return tDate.getDate() === loopDate.getDate() && 
                   tDate.getMonth() === loopDate.getMonth() && 
                   tDate.getFullYear() === loopDate.getFullYear();
        });

        // Styling for Today vs Weekend vs Regular
        const isToday = new Date().toDateString() === loopDate.toDateString();
        const isWeekend = i > 4;

        let bgClass = isToday ? "bg-blue-900/40" : (isWeekend ? "bg-black/60" : "bg-black/30");
        let borderClass = isToday ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "border-white/10";
        let headerClass = isToday ? "bg-blue-600 text-white" : "bg-white/5 border-b border-white/5 text-white/90";

        grid.innerHTML += `
        <div class="flex flex-col h-full ${bgClass} backdrop-blur-md rounded-2xl border ${borderClass} overflow-hidden min-w-[200px] transition-all duration-300">

            <!-- Header -->
            <div class="p-3 ${headerClass} text-center flex flex-col items-center">
                <div class="text-sm font-bold uppercase tracking-widest">${dayName} <span class="opacity-50 text-xs ml-1">${shortDate}</span></div>
                ${cycleBadge}
            </div>

            <!-- Topic Input -->
            <div class="p-3 border-b border-white/5">
                <input type="text" value="${topic}" onblur="saveTopic('${dateKey}', this.value)" placeholder="Topic..." 
                class="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-sm font-medium focus:border-blue-500 outline-none text-center placeholder-white/20 text-white/90 transition-colors">
            </div>

            <!-- Task List -->
            <div class="flex-1 p-3 space-y-2 overflow-y-auto custom-scrollbar">
                ${dayTasks.map(t => createTeacherTaskCard(t)).join('')}
                ${dayTasks.length === 0 ? '<div class="text-center text-xs text-white/20 italic py-8 opacity-50 select-none">-</div>' : ''}
            </div>

            <!-- Add Button -->
            <div class="p-3 border-t border-white/5 bg-white/5">
                <button onclick="openTeacherModal('${dateKey}')" class="w-full py-2 rounded-lg border border-dashed border-white/20 text-white/40 text-xs font-bold hover:border-blue-500 hover:text-white hover:bg-blue-500/10 transition-all flex items-center justify-center gap-2">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
        </div>`;
    }
}

/* =========================================
   4. TASK CARD GENERATOR
   ========================================= */

function createTeacherTaskCard(t) {
    // 1. Color Coding by Type
    let typeColor = 'text-blue-300 border-blue-500/30 bg-blue-500/10';
    if (t.type === 'TEST') typeColor = 'text-red-400 border-red-500/30 bg-red-500/10';
    if (t.type === 'PROJECT') typeColor = 'text-orange-400 border-orange-500/30 bg-orange-500/10';
    if (t.type === 'LAB') typeColor = 'text-green-400 border-green-500/30 bg-green-500/10';

    // 2. Mock Analytics (Simulation)
    // In a production app, these values would come from the database.
    const mockDiff = ((t.id % 20) / 10) + 2.5; 
    const mockAvgTime = Math.max(5, (t.est || 30) + ((t.id % 30) - 15));
    const timeColor = mockAvgTime > (t.est || 30) ? "text-red-400" : "text-green-400";

    return `
    <div class="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-3 relative group hover:border-blue-500/50 transition-all shadow-sm flex flex-col gap-2">

        <!-- Header -->
        <div class="flex justify-between items-start">
            <span class="text-[9px] font-bold uppercase border px-1.5 py-0.5 rounded ${typeColor} tracking-wider">${t.type}</span>
            <button onclick="deleteTaskFromFeed(${t.id})" class="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs p-1 hover:bg-white/10 rounded">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <!-- Title -->
        <div class="font-bold text-sm leading-tight text-white/90">${t.title}</div>

        <!-- Meta Data -->
        <div class="text-[10px] text-white/50 flex justify-between items-center border-b border-white/5 pb-2">
            <span><i class="fa-regular fa-clock"></i> Est: ${t.est}m</span>
            ${t.tag ? `<span class="bg-black/30 border border-white/10 px-1.5 rounded text-[9px] text-white/70">${t.tag}</span>` : ''}
        </div>

        <!-- Analytics Dashboard -->
        <div class="flex justify-between items-center bg-white/5 rounded px-2 py-1.5">
            <div class="text-center">
                <div class="text-[9px] text-white/40 uppercase font-bold">Avg Rating</div>
                <div class="text-xs font-bold text-yellow-400 flex items-center gap-1">
                    <i class="fa-solid fa-star text-[9px]"></i> ${mockDiff.toFixed(1)}
                </div>
            </div>
            <div class="w-px h-6 bg-white/10"></div>
            <div class="text-center">
                <div class="text-[9px] text-white/40 uppercase font-bold">Avg Time</div>
                <div class="text-xs font-bold ${timeColor}">
                    ${mockAvgTime}m
                </div>
            </div>
        </div>
    </div>`;
}