/* =========================================
   STUDENT UI RENDERER (Fixed Procrastination Buffer)
   ========================================= */

function initStudentUI() {
    document.getElementById('student-layout').classList.remove('hidden');

    // Profile Sidebar Data
    if(currentUser) {
        document.getElementById('s-profileInitials').innerText = currentUser.name.slice(0,2).toUpperCase();
        document.getElementById('s-profileName').innerText = currentUser.name;
    }
    document.getElementById('streak-count').innerText = `${streak} Day Streak`;
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString();
    function initStudentUI() {
        document.getElementById('student-layout').classList.remove('hidden');

        // Load Preference or Default
        if (typeof dashboardViewMode === 'undefined') dashboardViewMode = 'matrix';
        setDashboardView(dashboardViewMode); // This triggers the correct render function

        if(typeof renderBackpackList === 'function') renderBackpackList();
        if(typeof renderThemeButtons === 'function') renderThemeButtons('theme-selector');
    }
    // Renders
    renderMatrix();
    renderWelcomeBanner();
    renderStudentBulletins();

    if(typeof renderBackpackList === 'function') renderBackpackList();
    if(typeof renderThemeButtons === 'function') renderThemeButtons('theme-selector');
}

function switchStudentView(view) {
    if(typeof playSound === 'function') playSound('click');

    // 1. Hide ALL views
    ['dashboard', 'completed', 'profile', 'settings', 'class-detail', 'calendar'].forEach(v => {
        const el = document.getElementById(`s-view-${v}`);
        const btn = document.getElementById(`nav-s-${v}`);

        if (el) el.classList.add('hidden');
        if (btn) btn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-muted hover:text-text hover:bg-base border border-transparent";
    });

    if (view === 'calendar') {
        renderCalendar();
        // Re-scroll to 8:00 AM (approx) initially so they don't see just 6 AM
        setTimeout(() => {
            const scrollArea = document.getElementById('cal-scroll-area');
            if(scrollArea) scrollArea.scrollTop = 200; 
        }, 10);
    }

    // 2. Show TARGET view
    const targetEl = document.getElementById(`s-view-${view}`);
    const targetBtn = document.getElementById(`nav-s-${view}`);

    if (targetEl) {
        targetEl.classList.remove('hidden');

        // --- FIX: FORCE SCROLL TO TOP ---
        // Finds the main scrollable container and resets it
        const scroller = document.querySelector('.custom-scrollbar') || document.querySelector('.overflow-auto');
        if(scroller) scroller.scrollTop = 0;
    }

    if (targetBtn) {
        targetBtn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold bg-base text-primary border border-border shadow-sm";
    }

    // 3. Render Data
    if (view === 'dashboard') {
        if(typeof renderMatrix === 'function') renderMatrix();
        if(typeof renderWelcomeBanner === 'function') renderWelcomeBanner();
        if(typeof renderStudentBulletins === 'function') renderStudentBulletins();
    }
    if (view === 'completed') {
        if(typeof renderCompleted === 'function') renderCompleted();
    }
    if (view === 'profile') {
        if(typeof renderProfile === 'function') renderProfile();
    }
}

/* --- WELCOME BANNER --- */
function renderWelcomeBanner() {
    const nameEl = document.getElementById('banner-student-name');
    const msgEl = document.getElementById('banner-message');

    if(!nameEl || !msgEl) return;

    nameEl.innerText = currentUser.name.split(' ')[0]; 

    const today = new Date();
    const count = globalTasks.filter(t => {
        if (t.completed) return false;
        const d = new Date(t.due);
        return d.getDate() === today.getDate() && 
               d.getMonth() === today.getMonth() && 
               d.getFullYear() === today.getFullYear();
    }).length;

    if (count === 0) {
        msgEl.innerHTML = `You have <span class="font-bold text-green-500">0 assignments</span> due today. Clear skies! ☀️`;
    } else {
        msgEl.innerHTML = `You have <span class="font-bold text-primary text-xl">${count} assignment${count > 1 ? 's' : ''}</span> due today!!!`;
    }
}

/* --- MATRIX--- */
function renderMatrix() {
    const body = document.getElementById('matrix-body');
    const headerRow = document.getElementById('matrix-header-row');
    if(!body || !headerRow) return;

    headerRow.innerHTML = `<th class="p-4 text-left text-muted font-bold w-32 bg-surface border-b border-border sticky left-0 z-10 shadow-lg">Date</th>`;
    classes.forEach(c => { 
        headerRow.innerHTML += `<th class="p-4 text-left font-bold border-b border-border min-w-[180px]" style="color:${classPreferences[c] || '#888'}">${c}</th>`; 
    });

    body.innerHTML = '';
    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const rowDate = new Date(today);
        rowDate.setDate(today.getDate() + i);

        const dayName = rowDate.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = rowDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
        const isToday = i === 0;

        // 1. Calculate Cycle Day
        const cycleNum = getCycleDay(rowDate); // From utils.js
        let cycleBadge = '';

        if (cycleNum) {
            const colors = [
                'text-red-500 bg-red-500/10 border-red-500/20', 
                'text-orange-500 bg-orange-500/10 border-orange-500/20',
                'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
                'text-green-500 bg-green-500/10 border-green-500/20',
                'text-blue-500 bg-blue-500/10 border-blue-500/20',
                'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
                'text-purple-500 bg-purple-500/10 border-purple-500/20'
            ];
            const style = colors[cycleNum - 1] || 'text-muted';
            // Create the HTML for the badge
            cycleBadge = `<span class="mt-1 block text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border w-fit ${style}">Day ${cycleNum}</span>`;
        }

        const dateKey = rowDate.toISOString().split('T')[0];

        let rowHTML = `
        <tr class="${isToday ? "bg-primary/5" : "hover:bg-surface/30"} border-b border-border transition-colors">

            <td onclick="openDayDetail('${dateKey}')" class="p-4 bg-surface border-r border-border sticky left-0 z-10 cursor-pointer group hover:bg-base transition-colors relative align-top">
                <div class="${isToday ? "text-primary font-extrabold" : "font-bold text-muted"} group-hover:text-text">
                    ${isToday ? "Today" : dayName} 
                    <span class="text-xs opacity-70 block font-normal">${dateStr}</span>
                </div>

                <!-- 2. INSERT BADGE HERE (This was missing!) -->
                ${cycleBadge}

                <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-xs text-primary">
                    <i class="fa-solid fa-expand"></i>
                </div>
            </td>`;

        classes.forEach(cls => {
            const tasks = globalTasks.filter(t => {
                if(t.completed || t.course !== cls) return false;
                const d = new Date(t.due);
                return d.getDate() === rowDate.getDate() && d.getMonth() === rowDate.getMonth();
            });

            rowHTML += `<td class="p-2 align-top matrix-cell">`;
            tasks.forEach(t => rowHTML += createMatrixCard(t));
            rowHTML += `</td>`;
        });

        rowHTML += `</tr>`;
        body.innerHTML += rowHTML;
    }
}

function createMatrixCard(t) {
    const color = classPreferences[t.course] || '#888';

    // Buffer Math
    const buffer = (typeof settings !== 'undefined' && settings.buffer) ? parseInt(settings.buffer) : 0;
    const realDate = new Date(t.due);
    const displayDate = new Date(realDate.getTime() - (buffer * 60000));
    const timeStr = displayDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

    // Progress Bar
    let progressHtml = '';
    if(t.checklist && t.checklist.length > 0) {
        const done = t.checklist.filter(i=>i.done).length;
        const total = t.checklist.length;
        const pct = (done / total) * 100;
        progressHtml = `
        <div class="mt-3">
            <div class="flex justify-between items-end mb-1">
                <span class="text-[9px] font-bold text-muted uppercase tracking-wider">Progress</span>
                <span class="text-[9px] font-bold text-primary">${done}/${total}</span>
            </div>
            <div class="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full bg-primary transition-all duration-500 ease-out" style="width:${pct}%"></div>
            </div>
        </div>`;
    }

    // --- NEW: COMPLETED STATS ---
    let statsHtml = '';
    if (t.completed) {
        // Generate Star Rating if exists
        let stars = '';
        if(t.difficulty) {
            for(let i=0; i<t.difficulty; i++) stars += '★';
        }

        // Show actual time if recorded, else nothing
        const timeSpent = t.actualTime ? `${t.actualTime}m` : '';

        if(stars || timeSpent) {
            statsHtml = `
            <div class="mt-2 pt-2 border-t border-border flex justify-between items-center text-[10px] font-bold">
                <span class="text-yellow-500 tracking-widest">${stars}</span>
                <span class="text-muted">${timeSpent} spent</span>
            </div>`;
        }
    }

    // Time Class logic
    const timeClass = buffer > 0 ? "text-orange-500 font-bold" : "text-muted";
    const bufferIcon = buffer > 0 ? `<i class="fa-solid fa-clock-rotate-left mr-1" title="Buffer Active"></i>` : `<i class="fa-regular fa-clock mr-1"></i>`;

    return `
    <div onclick="openTaskDetails(${t.id})" class="bg-surface border border-border rounded-lg mb-2 shadow-sm p-3 hover:scale-[1.02] transition-all cursor-pointer group relative hover:border-primary/50">
        <div class="absolute top-0 left-0 right-0 h-1" style="background:${color}"></div>
        <div class="flex justify-between mb-1 mt-1">
            <i class="fa-solid fa-book text-[10px] text-muted"></i>
            <button onclick="event.stopPropagation(); toggleComplete(${t.id})" class="text-muted hover:text-green-500"><i class="fa-regular fa-square"></i></button>
        </div>

        <!-- Strikethrough if done -->
        <div class="font-bold text-sm leading-tight mb-1 text-text ${t.completed ? 'line-through opacity-50' : ''}">${t.title}</div>

        <div class="text-xs ${timeClass} flex justify-between">
            <span class="flex items-center">${bufferIcon} ${timeStr}</span>
            <span class="text-muted">${t.est}m est</span>
        </div>

        ${statsHtml}
        ${progressHtml}
    </div>`;
}

/* --- OTHER RENDERERS --- */
function renderCompleted() {
    const list = document.getElementById('list-completed');
    if(!list) return;
    list.innerHTML = '';

    const doneTasks = globalTasks.filter(t => t.completed).sort((a,b) => new Date(b.due) - new Date(a.due));
    if(doneTasks.length === 0) { list.innerHTML = `<div class="text-muted italic">No completed tasks yet.</div>`; return; }

    doneTasks.forEach(t => { 
        list.innerHTML += `
        <div class="flex items-center gap-4 bg-surface p-4 rounded-xl border border-border opacity-60">
            <i class="fa-solid fa-check-circle text-accent text-xl"></i>
            <div><div class="font-bold line-through">${t.title}</div><div class="text-xs text-muted">${t.course}</div></div>
        </div>`; 
    });
}

function renderProfile() {
    const list = document.getElementById('profile-list');
    if(!list) return;
    list.innerHTML = '';

    classes.forEach(c => { 
        const color = classPreferences[c] || '#888';
        const total = globalTasks.filter(t => t.course === c).length;
        const pending = globalTasks.filter(t => t.course === c && !t.completed).length;

        list.innerHTML += `
        <div onclick="openClassDetail('${c}')" class="bg-surface p-6 rounded-xl border border-border flex justify-between items-center shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1" style="background:${color}"></div>
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg" style="background:${color}">${c.substring(0,1)}</div>
                <div><span class="font-bold text-lg block group-hover:text-primary transition-colors">${c}</span><span class="text-xs text-muted">${pending} Active • ${total} Total</span></div>
            </div>
            <button onclick="event.stopPropagation(); openStudentClassSettings('${c}')" class="bg-base hover:bg-border text-text px-3 py-2 rounded-lg text-xs font-bold transition-colors border border-transparent hover:border-border z-10"><i class="fa-solid fa-palette"></i></button>
        </div>`; 
    });
}

function renderClassDetailList(className) {
    const container = document.getElementById('class-detail-list');
    if(!container) return;
    container.innerHTML = '';

    const tasks = globalTasks.filter(t => t.course === className).sort((a,b) => {
        if (a.completed === b.completed) return new Date(a.due) - new Date(b.due);
        return a.completed ? 1 : -1;
    });

    if(tasks.length === 0) { container.innerHTML = `<div class="p-8 text-center text-muted italic">No assignments found for ${className}.</div>`; return; }

    tasks.forEach(t => {
        const isLate = !t.completed && new Date(t.due) < new Date();
        const dateStr = new Date(t.due).toLocaleDateString() + ' ' + new Date(t.due).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

        container.innerHTML += `
        <div onclick="openTaskDetails(${t.id})" class="flex items-center justify-between p-3 rounded-lg hover:bg-base cursor-pointer border border-transparent hover:border-border transition-colors group">
            <div class="flex items-center gap-3">
                <div class="text-${t.completed ? 'green-500' : (isLate ? 'red-500' : 'muted')}"><i class="fa-${t.completed ? 'solid fa-circle-check' : 'regular fa-circle'}"></i></div>
                <div><div class="font-bold text-sm ${t.completed ? 'line-through text-muted' : ''}">${t.title}</div><div class="text-[10px] text-muted">${dateStr}</div></div>
            </div>
            <div class="text-xs font-bold ${t.completed ? 'text-green-500' : 'text-primary'}">${t.completed ? 'DONE' : 'ACTIVE'}</div>
        </div>`;
    });
}

function renderStudentBulletins() {
    const container = document.getElementById('student-bulletin-area');
    if (!container) return;
    container.innerHTML = '';
    let hasBulletins = false;
    if(typeof classBulletins !== 'undefined') {
        classes.forEach(cls => {
            const b = classBulletins[cls];
            if (b && b.active) {
                hasBulletins = true;
                const color = classPreferences[cls] || '#888';
                container.innerHTML += `
                <div class="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-xl flex items-start gap-4 shadow-sm mb-2 animate-pulse">
                    <div class="w-1 h-10 rounded-full" style="background:${color}"></div>
                    <div class="flex-1">
                        <div class="text-[10px] font-bold uppercase tracking-wider text-muted mb-1 flex items-center gap-2"><i class="fa-solid fa-thumbtack text-yellow-600"></i> ${cls} • Instructor Message</div>
                        <div class="font-bold text-yellow-700 dark:text-yellow-400 text-sm leading-relaxed">"${b.msg}"</div>
                    </div>
                </div>`;
            }
        });
    }
    if (hasBulletins) container.classList.remove('hidden'); else container.classList.add('hidden');
}

function renderBackpackList() {
    const container = document.getElementById('backpack-list');
    if (!container) return;
    if (!settings.backpack || settings.backpack.length === 0) settings.backpack = ["💻 Laptop & Charger", "📚 Homework Folder", "✏️ Pencil Case"];
    container.innerHTML = '';
    settings.backpack.forEach((item, index) => {
        container.innerHTML += `
        <div class="flex items-center justify-between bg-base p-2 rounded-lg border border-border group">
            <span class="text-sm ml-2">${item}</span>
            <button onclick="deleteBackpackItem(${index})" class="text-red-500 opacity-0 group-hover:opacity-100 hover:bg-surface w-6 h-6 rounded flex items-center justify-center transition-all"><i class="fa-solid fa-xmark"></i></button>
        </div>`;
    });
}

/* --- CALENDAR RENDERER --- */

const CAL_START_HOUR = 6; 
const CAL_END_HOUR = 24; // Extended to midnight
const PIXELS_PER_HOUR = 100;

function renderCalendar() {
    const gridCols = document.getElementById('cal-grid-columns');
    const headerRow = document.getElementById('cal-header-row');
    const timeGutter = document.getElementById('cal-time-gutter');
    const label = document.getElementById('cal-week-label');
    const unscheduledList = document.getElementById('cal-unscheduled-list');

    if(!gridCols) return;

    // 1. Setup Dates
    const curr = new Date();
    curr.setDate(curr.getDate() + (calendarOffset * 7));
    const first = curr.getDate() - curr.getDay() + 1;
    const weekStart = new Date(curr.setDate(first));
    const weekEnd = new Date(new Date(weekStart).setDate(weekStart.getDate() + 6));
    label.innerText = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;

    // 2. Render Time Gutter (With 12h/24h toggle)
    const is24 = settings.timeFormat24 || false;
    timeGutter.innerHTML = '';

    for(let h = CAL_START_HOUR; h <= CAL_END_HOUR; h++) {
        let timeStr = "";
        if (is24) {
            timeStr = `${h}:00`;
        } else {
            timeStr = h > 12 ? `${h-12} PM` : (h === 12 ? `12 PM` : (h === 24 ? `12 AM` : `${h} AM`));
        }
        timeGutter.innerHTML += `<div style="height:${PIXELS_PER_HOUR}px" class="flex items-start justify-center pt-1 border-b border-transparent">${timeStr}</div>`;
    }

    // 3. Render Unscheduled Sidebar
    renderUnscheduledSidebar();

    // 4. Render Grid Columns
    let headersHtml = '<div class="w-16 border-r border-border shrink-0 bg-base/50"></div>';
    let columnsHtml = '';

    for(let i=0; i<7; i++) {
        const loopDate = new Date(weekStart);
        loopDate.setDate(weekStart.getDate() + i);
        const dateStr = loopDate.toISOString().split('T')[0];

        // Headers
        const isToday = new Date().toDateString() === loopDate.toDateString();
        const headClass = isToday ? "text-primary font-extrabold bg-primary/5" : "text-muted font-bold";
        headersHtml += `
        <div class="flex-1 text-center py-3 border-r border-border ${headClass}">
            <div class="text-xs uppercase tracking-widest">${loopDate.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div class="text-lg leading-none mt-1">${loopDate.getDate()}</div>
        </div>`;

        // Grid Lines
        let bgLines = '';
        for(let h = CAL_START_HOUR; h <= CAL_END_HOUR; h++) {
            bgLines += `<div style="height:${PIXELS_PER_HOUR}px" class="border-b border-border/30 w-full pointer-events-none"></div>`;
        }

        // Tasks for this column
        const taskHtml = getTasksForCalendarColumn(loopDate);

        // DROP ZONE ATTRIBUTES ADDED HERE
        columnsHtml += `
        <div class="flex-1 border-r border-border relative bg-base/5 group transition-colors hover:bg-base/10"
             ondragover="allowDrop(event)"
             ondrop="handleCalendarDrop(event, '${dateStr}')">
            <div class="absolute inset-0 z-0 pointer-events-none">${bgLines}</div>
            ${taskHtml}
        </div>`;
    }

    headerRow.innerHTML = headersHtml;
    gridCols.innerHTML = columnsHtml;
    updateTimeLine();
}

function renderUnscheduledSidebar() {
    const container = document.getElementById('cal-unscheduled-list');
    container.innerHTML = '';

    // Filter: Not Completed AND No Planned Date
    const tasks = globalTasks.filter(t => !t.completed && !t.plannedDate);

    if (tasks.length === 0) {
        container.innerHTML = `<div class="text-center text-xs text-muted italic p-4">All active tasks scheduled!</div>`;
        return;
    }

    tasks.forEach(t => {
        const color = classPreferences[t.course] || '#888';
        const est = t.est || 30;

        // DRAG ATTRIBUTES ADDED
        container.innerHTML += `
        <div draggable="true" ondragstart="handleDragStart(event, ${t.id}, ${est})"
             onclick="openTaskDetails(${t.id})"
             class="bg-surface border border-border p-3 rounded-xl shadow-sm hover:scale-[1.02] cursor-grab active:cursor-grabbing transition-transform group">
            <div class="flex justify-between items-start mb-1">
                <div class="w-2 h-2 rounded-full" style="background:${color}"></div>
                <div class="text-[10px] text-muted font-mono">${est}m</div>
            </div>
            <div class="font-bold text-sm leading-tight">${t.title}</div>
            <div class="text-[10px] text-muted truncate">${t.course}</div>
        </div>`;
    });
}

function getTasksForCalendarColumn(dateObj) {
    let html = '';

    // Filter tasks that have a PLANNED DATE on this specific day
    const tasks = globalTasks.filter(t => {
        if(t.completed || !t.plannedDate) return false;
        const pDate = new Date(t.plannedDate);
        return pDate.getDate() === dateObj.getDate() && 
               pDate.getMonth() === dateObj.getMonth() &&
               pDate.getFullYear() === dateObj.getFullYear();
    });

    tasks.forEach(t => {
        const plan = new Date(t.plannedDate);
        const due = new Date(t.due);

        // Calculate Position
        const gridStartMins = CAL_START_HOUR * 60;
        const planStartMins = (plan.getHours() * 60) + plan.getMinutes();
        const duration = t.est || 30;

        let topPx = (planStartMins - gridStartMins) * (PIXELS_PER_HOUR / 60);
        let heightPx = duration * (PIXELS_PER_HOUR / 60);

        if (topPx < 0) { heightPx += topPx; topPx = 0; } // Clamp top

        const color = classPreferences[t.course] || '#888';
        const is24 = settings.timeFormat24 || false;

        // Format Time String for Card
        const timeStr = is24 
            ? plan.toLocaleTimeString([], {hour12: false, hour:'2-digit', minute:'2-digit'})
            : plan.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});

        html += `
        <div draggable="true" ondragstart="handleDragStart(event, ${t.id}, ${duration})"
             onclick="openTaskDetails(${t.id})" 
             class="absolute inset-x-1 rounded-lg border-l-4 shadow-sm hover:brightness-110 cursor-pointer overflow-hidden text-[10px] p-1 flex flex-col justify-start transition-all hover:scale-[1.02] hover:z-20"
             style="top:${topPx}px; height:${heightPx}px; background-color:${color}20; border-left-color:${color}; border: 1px solid ${color}40; border-left-width: 4px;">
            <div class="font-bold truncate text-text leading-tight">${t.title}</div>
            <div class="opacity-70 truncate">${timeStr} (${t.est}m)</div>
        </div>`;
    });

    return html;
}

function updateTimeLine() {
    const line = document.getElementById('cal-current-time');
    const now = new Date();

    // Only show if we are in the current week
    if(calendarOffset !== 0) {
        if(line) line.classList.add('hidden');
        return;
    }

    const h = now.getHours();
    const m = now.getMinutes();

    if(h < CAL_START_HOUR || h > CAL_END_HOUR) {
        if(line) line.classList.add('hidden');
        return;
    }

    if(line) {
        line.classList.remove('hidden');
        const gridStartMins = CAL_START_HOUR * 60;
        const currentTotalMins = (h * 60) + m;
        const topPx = (currentTotalMins - gridStartMins) * (PIXELS_PER_HOUR / 60);
        line.style.top = `${topPx}px`;
    }
}

/* --- STREAM VIEW (Chronological Agenda) --- */
function renderStream() {
    const container = document.getElementById('view-mode-stream');
    if(!container) return;
    container.innerHTML = '';

    const now = new Date();
    const tasks = globalTasks.filter(t => !t.completed).sort((a,b) => new Date(a.due) - new Date(b.due));

    // Groups
    const groups = {
        overdue: { label: "⚠️ Overdue", items: [], color: "text-red-500" },
        today: { label: "📅 Today", items: [], color: "text-green-500" },
        tomorrow: { label: "🚀 Tomorrow", items: [], color: "text-blue-500" },
        week: { label: "this Week", items: [], color: "text-purple-500" },
        later: { label: "🔮 Later", items: [], color: "text-muted" }
    };

    tasks.forEach(t => {
        const d = new Date(t.due);
        const isToday = d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
        const isTomorrow = d.getDate() === now.getDate()+1 && d.getMonth() === now.getMonth();
        const diffDays = (d - now) / (1000 * 60 * 60 * 24);

        if (d < now && !isToday) groups.overdue.items.push(t);
        else if (isToday) groups.today.items.push(t);
        else if (isTomorrow) groups.tomorrow.items.push(t);
        else if (diffDays < 7) groups.week.items.push(t);
        else groups.later.items.push(t);
    });

    // Render Groups
    Object.values(groups).forEach(g => {
        if(g.items.length === 0) return;

        let html = `
        <div>
            <h3 class="text-sm font-bold uppercase tracking-wider mb-3 px-1 ${g.color}">${g.label}</h3>
            <div class="space-y-2">`;

        g.items.forEach(t => {
            const color = classPreferences[t.course] || '#888';
            const timeStr = new Date(t.due).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', month:'short', day:'numeric'});

            html += `
            <div onclick="openTaskDetails(${t.id})" class="bg-surface border border-border p-4 rounded-xl flex items-center justify-between shadow-sm hover:scale-[1.01] transition-all cursor-pointer group">
                <div class="flex items-center gap-4">
                    <div class="w-1.5 h-12 rounded-full" style="background:${color}"></div>
                    <div>
                        <div class="font-bold text-base group-hover:text-primary transition-colors">${t.title}</div>
                        <div class="text-xs text-muted flex items-center gap-2">
                            <span class="font-bold" style="color:${color}">${t.course}</span>
                            <span>•</span>
                            <span>${timeStr}</span>
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="font-mono text-sm font-bold">${t.est}m</div>
                    <button onclick="event.stopPropagation(); toggleComplete(${t.id})" class="mt-1 text-muted hover:text-green-500"><i class="fa-regular fa-square text-xl"></i></button>
                </div>
            </div>`;
        });

        html += `</div></div>`;
        container.innerHTML += html;
    });

    if(tasks.length === 0) container.innerHTML = `<div class="text-center text-muted py-20">No active assignments! 🎉</div>`;
}

/* --- KANBAN VIEW (Board) --- */
function renderKanban() {
    const cols = {
        todo: document.getElementById('kb-col-todo'),
        doing: document.getElementById('kb-col-doing'),
        done: document.getElementById('kb-col-done')
    };

    if(!cols.todo) return;

    // Reset Columns
    cols.todo.innerHTML = `<div class="p-4 border-b border-border font-bold text-sm uppercase text-muted tracking-wider flex justify-between"><span>To Do</span><span class="bg-base px-2 rounded" id="kb-count-todo">0</span></div><div class="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar" id="kb-list-todo"></div>`;
    cols.doing.innerHTML = `<div class="p-4 border-b border-border font-bold text-sm uppercase text-blue-500 tracking-wider flex justify-between"><span>In Progress</span><span class="bg-base px-2 rounded" id="kb-count-doing">0</span></div><div class="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar" id="kb-list-doing"></div>`;
    cols.done.innerHTML = `<div class="p-4 border-b border-border font-bold text-sm uppercase text-green-500 tracking-wider flex justify-between"><span>Completed</span><span class="bg-base px-2 rounded" id="kb-count-done">0</span></div><div class="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar" id="kb-list-done"></div>`;

    const lists = {
        todo: cols.todo.querySelector('#kb-list-todo'),
        doing: cols.doing.querySelector('#kb-list-doing'),
        done: cols.done.querySelector('#kb-list-done')
    };

    let counts = { todo: 0, doing: 0, done: 0 };

    globalTasks.forEach(t => {
        let target = 'todo';
        if (t.completed) target = 'done';
        // Simple logic: If it has a plan date but isn't done, it's "Doing"
        else if (t.plannedDate) target = 'doing';

        counts[target]++;
        const color = classPreferences[t.course] || '#888';
        const dateObj = new Date(t.due);
        const dateStr = dateObj.toLocaleDateString(undefined, {month:'numeric', day:'numeric'});

        lists[target].innerHTML += `
        <div onclick="openTaskDetails(${t.id})" class="bg-base border border-border p-3 rounded-xl shadow-sm hover:border-primary/50 cursor-pointer group transition-all">
            <div class="flex justify-between items-start mb-2">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-surface border border-border" style="color:${color}">${t.course}</span>
                ${target !== 'done' ? `<button onclick="event.stopPropagation(); toggleComplete(${t.id})" class="text-muted hover:text-green-500"><i class="fa-regular fa-square"></i></button>` : '<i class="fa-solid fa-check text-green-500"></i>'}
            </div>
            <div class="font-bold text-sm leading-tight mb-2 ${t.completed ? 'line-through text-muted' : ''}">${t.title}</div>
            <div class="flex justify-between items-center text-xs text-muted">
                <span><i class="fa-regular fa-clock"></i> ${dateStr}</span>
                <span>${t.est}m</span>
            </div>
        </div>`;
    });

    // Update Counts
    document.getElementById('kb-count-todo').innerText = counts.todo;
    document.getElementById('kb-count-doing').innerText = counts.doing;
    document.getElementById('kb-count-done').innerText = counts.done;
}

/* --- PLANNER VIEW (Weekly Grid) --- */

function renderStudentPlanner() {
    const grid = document.getElementById('student-planner-grid');
    const label = document.getElementById('sp-week-label');
    if(!grid) return;

    grid.innerHTML = '';

    // 1. Calculate Dates
    const curr = new Date();
    curr.setDate(curr.getDate() + (studentPlannerOffset * 7));

    const first = curr.getDate() - curr.getDay() + 1; // Monday
    const weekStart = new Date(curr.setDate(first));
    const weekEnd = new Date(new Date(weekStart).setDate(weekStart.getDate() + 6));

    if(label) label.innerText = `${weekStart.toLocaleDateString(undefined, {month:'short', day:'numeric'})} - ${weekEnd.toLocaleDateString(undefined, {month:'short', day:'numeric'})}`;

    // 2. Loop 7 Days
    for(let i=0; i<7; i++) {
        const loopDate = new Date(weekStart);
        loopDate.setDate(weekStart.getDate() + i);

        const dayName = loopDate.toLocaleDateString('en-US', { weekday: 'long' });
        const shortDate = loopDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
        const isToday = new Date().toDateString() === loopDate.toDateString();

        // Cycle Day Logic
        const cycleNum = getCycleDay(loopDate);
        let cycleBadge = '';
        if(cycleNum) {
             const colors = ['text-red-500 bg-red-500/10 border-red-500/20', 'text-orange-500 bg-orange-500/10 border-orange-500/20', 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', 'text-green-500 bg-green-500/10 border-green-500/20', 'text-blue-500 bg-blue-500/10 border-blue-500/20', 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20', 'text-purple-500 bg-purple-500/10 border-purple-500/20'];
             const style = colors[cycleNum - 1] || 'text-muted';
             cycleBadge = `<span class="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border ${style}">Day ${cycleNum}</span>`;
        }

        // Get Tasks
        const dayTasks = globalTasks.filter(t => {
            if(t.completed) return false; // Optional: Show completed?
            const d = new Date(t.due);
            return d.getDate() === loopDate.getDate() && d.getMonth() === loopDate.getMonth();
        });

        // Styling
        const borderClass = isToday ? "border-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]" : "border-border";
        const bgClass = isToday ? "bg-surface" : "bg-surface/50";
        const headClass = isToday ? "bg-primary text-white" : "bg-base border-b border-border";

        grid.innerHTML += `
        <div class="flex-1 min-w-[200px] flex flex-col h-full rounded-2xl border ${borderClass} ${bgClass} overflow-hidden">
            <!-- Header -->
            <div class="p-3 ${headClass} text-center">
                <div class="text-sm font-bold uppercase tracking-widest">${dayName}</div>
                <div class="flex justify-center items-center gap-2 mt-1">
                    <span class="text-xs opacity-80">${shortDate}</span>
                    ${cycleBadge}
                </div>
            </div>

            <!-- List -->
            <div class="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar bg-base/20">
                ${dayTasks.map(t => createPlannerTaskCard(t)).join('')}
                ${dayTasks.length === 0 ? '<div class="text-center text-xs text-muted italic py-10 opacity-50">Nothing Due</div>' : ''}
            </div>
        </div>`;
    }
}

function createPlannerTaskCard(t) {
    const color = classPreferences[t.course] || '#888';

    // Type Badge Color
    let typeColor = 'text-primary bg-primary/10 border-primary/20';
    if(t.type === 'TEST') typeColor = 'text-red-500 bg-red-500/10 border-red-500/20';

    return `
    <div onclick="openTaskDetails(${t.id})" class="bg-surface border border-border p-3 rounded-xl shadow-sm hover:scale-[1.02] hover:border-primary/50 transition-all cursor-pointer group">
        <div class="flex justify-between items-start mb-1">
            <span class="text-[9px] font-bold uppercase border px-1.5 py-0.5 rounded ${typeColor}">${t.type}</span>
            <div class="w-2 h-2 rounded-full" style="background:${color}"></div>
        </div>
        <div class="font-bold text-sm leading-tight text-text mb-1">${t.title}</div>
        <div class="text-[10px] text-muted truncate">${t.course}</div>

        <button onclick="event.stopPropagation(); toggleComplete(${t.id})" class="w-full mt-2 py-1 rounded bg-base border border-border text-xs font-bold text-muted hover:text-green-500 hover:border-green-500 transition-colors">
            Mark Done
        </button>
    </div>`;
}