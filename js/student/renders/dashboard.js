/* ==========================================================================
   STUDENT DASHBOARD: VIEW RENDERERS
   ==========================================================================
   PURPOSE: 
   1. Renders the four main dashboard views:
      - Matrix (Weekly Grid)
      - Planner (Simple Week List)
      - Stream (Linear Timeline)
      - Kanban (Todo / Doing / Done)
   ========================================================================== */

/* =========================================
   1. MATRIX VIEW (Weekly Time Grid)
   ========================================= */

function renderMatrix() {
    const body = document.getElementById('matrix-body');
    const headerRow = document.getElementById('matrix-header-row');
    if (!body || !headerRow) return;

    // --- 1. SETUP HEADER ---
    const dateLabel = (typeof txt === 'function') ? txt('Date') : 'Date';

    // Create the sticky "Date" column
    headerRow.innerHTML = `<th class="p-4 text-left text-muted font-bold w-32 bg-surface border-b border-border sticky left-0 z-10 shadow-lg">${dateLabel}</th>`;

    // Create columns for each enrolled class
    classes.forEach(c => { 
        const color = classPreferences[c] || '#888';
        headerRow.innerHTML += `<th class="p-4 text-left font-bold border-b border-border min-w-[180px]" style="color:${color}">${c}</th>`; 
    });

    body.innerHTML = '';
    const today = new Date();

    // --- 2. CALCULATE WEEK RANGE ---
    let weekStart;
    if (typeof getStartOfWeek === 'function') {
        weekStart = getStartOfWeek(today);
    } else {
        // Fallback: Find last Sunday
        const first = today.getDate() - today.getDay();
        weekStart = new Date(today.setDate(first)); 
    }

    // --- 3. RENDER ROWS (One per day) ---
    for (let i = 0; i < 7; i++) {
        const rowDate = new Date(weekStart);
        rowDate.setDate(weekStart.getDate() + i);

        const dayName = rowDate.toLocaleDateString('en-US', { weekday: 'short' });
        const dateKey = rowDate.toISOString().split('T')[0];
        const isToday = new Date().toDateString() === rowDate.toDateString();

        // Safe Date Formatting
        let dateStr;
        if (typeof formatShortDate === 'function') {
            dateStr = formatShortDate(rowDate);
        } else {
            dateStr = rowDate.toLocaleDateString(undefined, {month:'numeric', day:'numeric'});
        }

        // Cycle Day Badge Logic
        let cycleBadge = '';
        if (typeof getCycleDay === 'function') {
            const cycleNum = getCycleDay(rowDate);
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
                cycleBadge = `<span class="mt-1 block text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border w-fit ${style}">Day ${cycleNum}</span>`;
            }
        }

        // Row HTML Structure
        let rowHTML = `
        <tr class="${isToday ? "bg-primary/5" : "hover:bg-surface/30"} border-b border-border transition-colors">
            <!-- DATE CELL (Clickable) -->
            <td onclick="openDayDetail('${dateKey}')" class="p-4 bg-surface border-r border-border sticky left-0 z-10 cursor-pointer group hover:bg-base transition-colors relative align-top">
                <div class="${isToday ? "text-primary font-extrabold" : "font-bold text-muted"} group-hover:text-text">
                    ${isToday ? "Today" : dayName} <span class="text-xs opacity-70 block font-normal">${dateStr}</span>
                </div>
                ${cycleBadge}
                <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-xs text-primary"><i class="fa-solid fa-expand"></i></div>
            </td>`;

        // CLASS CELLS
        classes.forEach(cls => {
            // Find tasks for this class on this specific day
            const tasks = globalTasks.filter(t => {
                if (t.completed || t.course !== cls) return false;
                const d = new Date(t.due);
                return d.getDate() === rowDate.getDate() && 
                       d.getMonth() === rowDate.getMonth() && 
                       d.getFullYear() === rowDate.getFullYear();
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
    const buffer = (typeof settings !== 'undefined' && settings.buffer) ? parseInt(settings.buffer) : 0;

    // Apply buffer time (shift due date visually)
    const realDate = new Date(t.due);
    const displayDate = new Date(realDate.getTime() - (buffer * 60000));

    let timeStr;
    if (settings && settings.timeFormat24) {
        timeStr = displayDate.toLocaleTimeString([], {hour12: false, hour:'2-digit', minute:'2-digit'});
    } else {
        timeStr = displayDate.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});
    }

    // Progress Bar (Checklist)
    let progressHtml = '';
    if (t.checklist && t.checklist.length > 0) {
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

    // Stats (Completion History)
    let statsHtml = '';
    if (t.completed) {
        let stars = '★'.repeat(t.difficulty || 0);
        const timeSpent = t.actualTime ? `${t.actualTime}m` : '';
        if (stars || timeSpent) {
            statsHtml = `<div class="mt-2 pt-2 border-t border-border flex justify-between items-center text-[10px] font-bold"><span class="text-yellow-500 tracking-widest">${stars}</span><span class="text-muted">${timeSpent} spent</span></div>`;
        }
    }

    // Visual cues for Buffer time
    const timeClass = buffer > 0 ? "text-orange-500 font-bold" : "text-muted";
    const bufferIcon = buffer > 0 ? `<i class="fa-solid fa-clock-rotate-left mr-1" title="Buffer Active"></i>` : `<i class="fa-regular fa-clock mr-1"></i>`;
    const typeLabel = (typeof txt === 'function') ? txt(t.type) : t.type;

    return `
    <div onclick="openTaskDetails(${t.id})" class="bg-surface border border-border rounded-lg mb-2 shadow-sm p-3 hover:scale-[1.02] transition-all cursor-pointer group relative hover:border-primary/50">
        <div class="absolute top-0 left-0 right-0 h-1" style="background:${color}"></div>
        <div class="flex justify-between mb-1 mt-1">
            <span class="text-[9px] font-bold uppercase border border-border px-1.5 py-0.5 rounded text-muted bg-base">${typeLabel}</span>
            <button onclick="event.stopPropagation(); toggleComplete(${t.id})" class="text-muted hover:text-green-500"><i class="fa-regular fa-square"></i></button>
        </div>
        <div class="font-bold text-sm leading-tight mb-1 text-text ${t.completed ? 'line-through opacity-50' : ''}">${t.title}</div>
        <div class="text-xs ${timeClass} flex justify-between"><span class="flex items-center">${bufferIcon} ${timeStr}</span><span class="text-muted">${t.est}m</span></div>
        ${statsHtml} 
        ${progressHtml}
    </div>`;
}

/* =========================================
   2. PLANNER VIEW (Simple Vertical Columns)
   ========================================= */

function renderStudentPlanner() {
    const grid = document.getElementById('student-planner-grid');
    const label = document.getElementById('sp-week-label');
    if (!grid) return;

    grid.innerHTML = '';

    // Calculate Date Range
    const curr = new Date();
    if (typeof studentPlannerOffset === 'undefined') studentPlannerOffset = 0;
    curr.setDate(curr.getDate() + (studentPlannerOffset * 7));

    let weekStart;
    if (typeof getStartOfWeek === 'function') weekStart = getStartOfWeek(curr);
    else { 
        const f = curr.getDate() - curr.getDay(); 
        weekStart = new Date(curr.setDate(f)); 
    }
    const weekEnd = new Date(new Date(weekStart).setDate(weekStart.getDate() + 6));

    // Update Label
    if (label) {
        if (typeof formatShortDate === 'function') label.innerText = `${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}`;
        else label.innerText = weekStart.toLocaleDateString();
    }

    // Generate Columns
    for (let i = 0; i < 7; i++) {
        const loopDate = new Date(weekStart);
        loopDate.setDate(weekStart.getDate() + i);

        const dayName = loopDate.toLocaleDateString('en-US', { weekday: 'long' });
        const isToday = new Date().toDateString() === loopDate.toDateString();

        let shortDate;
        if (typeof formatShortDate === 'function') shortDate = formatShortDate(loopDate);
        else shortDate = loopDate.toLocaleDateString();

        // Cycle Badge
        let cycleBadge = '';
        if (typeof getCycleDay === 'function') {
            const cycleNum = getCycleDay(loopDate);
            if (cycleNum) {
                 const colors = ['text-red-500 bg-red-500/10 border-red-500/20', 'text-orange-500 bg-orange-500/10 border-orange-500/20', 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', 'text-green-500 bg-green-500/10 border-green-500/20', 'text-blue-500 bg-blue-500/10 border-blue-500/20', 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20', 'text-purple-500 bg-purple-500/10 border-purple-500/20'];
                 const style = colors[cycleNum - 1] || 'text-muted';
                 cycleBadge = `<span class="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border ${style}">Day ${cycleNum}</span>`;
            }
        }

        const dayTasks = globalTasks.filter(t => {
            if (t.completed) return false; 
            const d = new Date(t.due);
            return d.getDate() === loopDate.getDate() && 
                   d.getMonth() === loopDate.getMonth() && 
                   d.getFullYear() === loopDate.getFullYear();
        });

        // Today Highlights
        const borderClass = isToday ? "border-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]" : "border-border";
        const bgClass = isToday ? "bg-surface" : "bg-surface/50";
        const headClass = isToday ? "bg-primary text-white" : "bg-base border-b border-border";

        grid.innerHTML += `
        <div class="flex-1 min-w-[200px] flex flex-col h-full rounded-2xl border ${borderClass} ${bgClass} overflow-hidden">
            <div class="p-3 ${headClass} text-center">
                <div class="text-sm font-bold uppercase tracking-widest">${dayName}</div>
                <div class="flex justify-center items-center gap-2 mt-1"><span class="text-xs opacity-80">${shortDate}</span>${cycleBadge}</div>
            </div>
            <div class="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar bg-base/20">
                ${dayTasks.map(t => createPlannerTaskCard(t)).join('')}
                ${dayTasks.length === 0 ? '<div class="text-center text-xs text-muted italic py-10 opacity-50">Nothing Due</div>' : ''}
            </div>
        </div>`;
    }
}

function createPlannerTaskCard(t) {
    const color = classPreferences[t.course] || '#888';
    let typeColor = 'text-primary bg-primary/10 border-primary/20';
    if(t.type === 'TEST') typeColor = 'text-red-500 bg-red-500/10 border-red-500/20';

    const typeLabel = (typeof txt === 'function') ? txt(t.type) : t.type;

    return `
    <div onclick="openTaskDetails(${t.id})" class="bg-surface border border-border p-3 rounded-xl shadow-sm hover:scale-[1.02] hover:border-primary/50 transition-all cursor-pointer group">
        <div class="flex justify-between items-start mb-1">
            <span class="text-[9px] font-bold uppercase border px-1.5 py-0.5 rounded ${typeColor}">${typeLabel}</span>
            <div class="w-2 h-2 rounded-full" style="background:${color}"></div>
        </div>
        <div class="font-bold text-sm leading-tight text-text mb-1">${t.title}</div>
        <div class="text-[10px] text-muted truncate">${t.course}</div>
        <button onclick="event.stopPropagation(); toggleComplete(${t.id})" class="w-full mt-2 py-1 rounded bg-base border border-border text-xs font-bold text-muted hover:text-green-500 hover:border-green-500 transition-colors">Mark Done</button>
    </div>`;
}

/* =========================================
   3. STREAM VIEW (Linear Timeline)
   ========================================= */

function renderStream() {
    const container = document.getElementById('view-mode-stream');
    if (!container) return;
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

    // Sort into groups
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
        if (g.items.length === 0) return;

        let html = `<div><h3 class="text-sm font-bold uppercase tracking-wider mb-3 px-1 ${g.color}">${g.label}</h3><div class="space-y-2">`;

        g.items.forEach(t => {
            const color = classPreferences[t.course] || '#888';
            let timeStr;
            const d = new Date(t.due);
            if (settings && settings.timeFormat24) {
                timeStr = d.toLocaleTimeString([], {hour12: false, hour:'2-digit', minute:'2-digit', month:'short', day:'numeric'});
            } else {
                timeStr = d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', month:'short', day:'numeric'});
            }

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

    if (tasks.length === 0) container.innerHTML = `<div class="text-center text-muted py-20">No active assignments! 🎉</div>`;
}

/* =========================================
   4. KANBAN VIEW (Todo / Doing / Done)
   ========================================= */

function renderKanban() {
    const cols = { 
        todo: document.getElementById('kb-col-todo'), 
        doing: document.getElementById('kb-col-doing'), 
        done: document.getElementById('kb-col-done') 
    };
    if (!cols.todo) return;

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

    // Sort Tasks
    globalTasks.forEach(t => {
        let target = 'todo';
        if (t.completed) target = 'done';
        else if (t.plannedDate) target = 'doing'; // "Doing" means it is scheduled on the calendar

        counts[target]++;
        const color = classPreferences[t.course] || '#888';
        const dateStr = new Date(t.due).toLocaleDateString(undefined, {month:'numeric', day:'numeric'});

        lists[target].innerHTML += `
        <div onclick="openTaskDetails(${t.id})" class="bg-base border border-border p-3 rounded-xl shadow-sm hover:border-primary/50 cursor-pointer group transition-all">
            <div class="flex justify-between items-start mb-2">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-surface border border-border" style="color:${color}">${t.course}</span>
                ${target !== 'done' ? `<button onclick="event.stopPropagation(); toggleComplete(${t.id})" class="text-muted hover:text-green-500"><i class="fa-regular fa-square"></i></button>` : '<i class="fa-solid fa-check text-green-500"></i>'}
            </div>
            <div class="font-bold text-sm leading-tight mb-2 ${t.completed ? 'line-through text-muted' : ''}">${t.title}</div>
            <div class="flex justify-between items-center text-xs text-muted"><span><i class="fa-regular fa-clock"></i> ${dateStr}</span><span>${t.est}m</span></div>
        </div>`;
    });

    document.getElementById('kb-count-todo').innerText = counts.todo;
    document.getElementById('kb-count-doing').innerText = counts.doing;
    document.getElementById('kb-count-done').innerText = counts.done;
}