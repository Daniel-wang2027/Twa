/* =========================================
   TEACHER RENDERER (Glassmorphism Fixed)
   ========================================= */

function initTeacherUI() {
    const layout = document.getElementById('teacher-layout');
    const studentLayout = document.getElementById('student-layout');

    if (layout) layout.classList.remove('hidden');
    if (studentLayout) studentLayout.classList.add('hidden');

    if (currentUser) {
        const nameEl = document.getElementById('t-profileName');
        const initEl = document.getElementById('t-profileInitials');
        if(nameEl) nameEl.innerText = currentUser.name;
        if(initEl) initEl.innerText = currentUser.name.slice(0,2).toUpperCase();
    }

    if (!classes.includes(currentTeacherClass)) {
        currentTeacherClass = classes.find(c => c !== 'Personal') || classes[0];
    }

    renderTeacherNav();
    renderRosterSidebar();

    setTimeout(() => {
        if(typeof teacherSwitchClass === 'function') {
            teacherSwitchClass(currentTeacherClass);
        }
    }, 50);
}

function renderTeacherNav() {
    const list = document.getElementById('teacher-class-list');
    if (!list) return;
    list.innerHTML = '';

    classes.filter(c => c !== 'Personal').forEach(c => { 
        const color = classPreferences[c] || '#888';
        const isActive = c === currentTeacherClass;

        // Using White/Black opacity instead of theme variables
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
    if(!container) return;
    container.innerHTML = '';

    if(typeof studentRoster === 'undefined') return;

    studentRoster.forEach(s => {
        const lastActive = new Date(s.lastActive);
        const diffHours = (new Date() - lastActive) / 36e5;
        let color = 'bg-green-500';
        if (diffHours > 24) color = 'bg-yellow-500';
        if (diffHours > 72) color = 'bg-red-500';

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

function renderTeacherPlanner() {
    const grid = document.getElementById('teacher-planner-grid');
    const weekLabel = document.getElementById('t-current-week-label');
    const titleEl = document.getElementById('t-active-class-title');

    if(!grid) {
        setTimeout(renderTeacherPlanner, 100);
        return;
    }

    grid.innerHTML = '';

    // Update Header with Navigation Buttons
    // We inject the arrows directly into the title area for easy access
    if(titleEl && !document.getElementById('planner-nav-controls')) {
        const navHtml = `
            <div id="planner-nav-controls" class="inline-flex items-center ml-4 bg-base rounded-lg border border-border overflow-hidden">
                <button onclick="changePlannerWeek(-1)" class="px-3 py-1 hover:bg-white/10 border-r border-border text-xs"><i class="fa-solid fa-chevron-left"></i></button>
                <button onclick="changePlannerWeek(0)" class="px-3 py-1 hover:bg-white/10 border-r border-border text-xs font-bold">Today</button>
                <button onclick="changePlannerWeek(1)" class="px-3 py-1 hover:bg-white/10 text-xs"><i class="fa-solid fa-chevron-right"></i></button>
            </div>`;
        // Only append if not already there to prevent duplicates
        if(!titleEl.innerHTML.includes('planner-nav-controls')) {
            titleEl.innerHTML += navHtml;
        }
    }

    // Init topics
    if(typeof classTopics === 'undefined') classTopics = {};
    if(!classTopics[currentTeacherClass]) classTopics[currentTeacherClass] = {};

    // 1. Calculate Date based on OFFSET
    const curr = new Date(); 
    // Shift by the offset (weeks * 7 days)
    curr.setDate(curr.getDate() + (currentPlannerOffset * 7));

    const first = curr.getDate() - curr.getDay() + 1; // Monday
    const weekStart = new Date(curr.setDate(first));

    // Header Label logic
    const weekEnd = new Date(new Date(weekStart).setDate(weekStart.getDate() + 6));
    if(weekLabel) weekLabel.innerText = `${weekStart.toLocaleDateString(undefined, {month:'short', day:'numeric'})} - ${weekEnd.toLocaleDateString(undefined, {month:'short', day:'numeric'})}`;

    // Loop 7 days
    for (let i = 0; i < 7; i++) {
        const loopDate = new Date(weekStart);
        loopDate.setDate(weekStart.getDate() + i);

        const dateKey = loopDate.toISOString().split('T')[0];
        const dayName = loopDate.toLocaleDateString('en-US', { weekday: 'short' });
        const shortDate = loopDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

        const topic = classTopics[currentTeacherClass][dateKey] || "";

        // --- CYCLE DAY LOGIC ---
        const cycleNum = getCycleDay(loopDate); // From actions.js
        let cycleBadge = '';
        if (cycleNum) {
            // Color code the cycle days for visual flair
            const cycleColors = [
                'border-red-500 text-red-500', 
                'border-orange-500 text-orange-500',
                'border-yellow-500 text-yellow-500',
                'border-green-500 text-green-500',
                'border-blue-500 text-blue-500',
                'border-indigo-500 text-indigo-500',
                'border-purple-500 text-purple-500'
            ];
            const cColor = cycleColors[cycleNum - 1] || 'border-gray-500 text-gray-500';
            cycleBadge = `<div class="mt-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${cColor} bg-base inline-block">Day ${cycleNum}</div>`;
        } else {
            // Weekend / Off Day
            cycleBadge = `<div class="mt-1 text-[10px] font-bold text-muted/30 uppercase tracking-wider">--</div>`;
        }

        const dayTasks = globalTasks.filter(t => {
            if(t.course !== currentTeacherClass) return false;
            const tDate = new Date(t.due);
            return tDate.getDate() === loopDate.getDate() && 
                   tDate.getMonth() === loopDate.getMonth() && 
                   tDate.getFullYear() === loopDate.getFullYear();
        });

        const isToday = new Date().toDateString() === loopDate.toDateString();
        const isWeekend = i > 4;

        let bgClass = isToday ? "bg-blue-900/40" : (isWeekend ? "bg-black/60" : "bg-black/30");
        let borderClass = isToday ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "border-white/10";
        let headerClass = isToday ? "bg-blue-600 text-white" : "bg-white/5 border-b border-white/5 text-white/90";

        grid.innerHTML += `
        <div class="flex flex-col h-full ${bgClass} backdrop-blur-md rounded-2xl border ${borderClass} overflow-hidden min-w-[200px] transition-all duration-300">

            <div class="p-3 ${headerClass} text-center flex flex-col items-center">
                <div class="text-sm font-bold uppercase tracking-widest">${dayName} <span class="opacity-50 text-xs ml-1">${shortDate}</span></div>
                ${cycleBadge}
            </div>

            <div class="p-3 border-b border-white/5">
                <input type="text" value="${topic}" onblur="saveTopic('${dateKey}', this.value)" placeholder="Topic..." 
                class="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-sm font-medium focus:border-blue-500 outline-none text-center placeholder-white/20 text-white/90 transition-colors">
            </div>

            <div class="flex-1 p-3 space-y-2 overflow-y-auto custom-scrollbar">
                ${dayTasks.map(t => createTeacherTaskCard(t)).join('')}
                ${dayTasks.length === 0 ? '<div class="text-center text-xs text-white/20 italic py-8 opacity-50 select-none">-</div>' : ''}
            </div>

            <div class="p-3 border-t border-white/5 bg-white/5">
                <button onclick="openTeacherModal('${dateKey}')" class="w-full py-2 rounded-lg border border-dashed border-white/20 text-white/40 text-xs font-bold hover:border-blue-500 hover:text-white hover:bg-blue-500/10 transition-all flex items-center justify-center gap-2">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
        </div>`;
    }
}

function createTeacherTaskCard(t) {
    let typeColor = 'text-blue-300 border-blue-500/30 bg-blue-500/10';
    if(t.type === 'TEST') typeColor = 'text-red-300 border-red-500/30 bg-red-500/10';

    return `
    <div class="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-2.5 relative group hover:border-blue-500/50 transition-colors shadow-sm">
        <div class="flex justify-between items-start mb-1">
            <span class="text-[9px] font-bold uppercase border px-1.5 py-0.5 rounded ${typeColor}">${t.type}</span>
            <button onclick="deleteTaskFromFeed(${t.id})" class="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs p-1 hover:bg-white/10 rounded"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="font-bold text-sm leading-tight text-white/90">${t.title}</div>
        <div class="text-[10px] text-white/50 mt-1.5 flex justify-between items-center">
            <span><i class="fa-regular fa-clock"></i> ${t.est}m</span>
            ${t.tag ? `<span class="bg-black/30 border border-white/10 px-1 rounded">${t.tag}</span>` : ''}
        </div>
    </div>`;
}