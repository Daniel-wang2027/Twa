/* =========================================
   STUDENT CALENDAR (Timestamp Fix)
   ========================================= */

const CAL_START_HOUR = 6; 
const CAL_END_HOUR = 24; 
const PIXELS_PER_HOUR = 100;

function renderCalendar() {
    const gridCols = document.getElementById('cal-grid-columns');
    const headerRow = document.getElementById('cal-header-row');
    const timeGutter = document.getElementById('cal-time-gutter');
    const label = document.getElementById('cal-week-label');

    if(!gridCols) return;

    // 1. Setup Dates
    const curr = new Date();
    if(typeof calendarOffset === 'undefined') calendarOffset = 0;
    curr.setDate(curr.getDate() + (calendarOffset * 7));

    const first = curr.getDate() - curr.getDay() + 1; // Monday
    const weekStart = new Date(curr.setDate(first));
    weekStart.setHours(0,0,0,0);
    const weekEnd = new Date(new Date(weekStart).setDate(weekStart.getDate() + 6));

    label.innerText = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;

    // 2. Render Time Gutter
    const is24 = settings.timeFormat24 || false;
    timeGutter.innerHTML = '';

    for(let h = CAL_START_HOUR; h <= CAL_END_HOUR; h++) {
        let timeStr = is24 ? `${h}:00` : (h > 12 ? `${h-12} PM` : (h === 12 ? `12 PM` : (h === 24 ? `12 AM` : `${h} AM`)));
        timeGutter.innerHTML += `<div style="height:${PIXELS_PER_HOUR}px" class="flex items-start justify-center pt-1 border-b border-transparent">${timeStr}</div>`;
    }

    renderUnscheduledSidebar();

    // 3. Render Columns
    let headersHtml = '<div class="w-16 border-r border-border shrink-0 bg-base/50"></div>';
    let columnsHtml = '';

    for(let i=0; i<7; i++) {
        const loopDate = new Date(weekStart);
        loopDate.setDate(weekStart.getDate() + i);

        // --- FIX: USE TIMESTAMP (No Timezone Errors) ---
        const columnTimestamp = loopDate.getTime(); 

        const isToday = new Date().toDateString() === loopDate.toDateString();
        const headClass = isToday ? "text-primary font-extrabold bg-primary/5" : "text-muted font-bold";

        headersHtml += `
        <div class="flex-1 text-center py-3 border-r border-border ${headClass}">
            <div class="text-xs uppercase tracking-widest">${loopDate.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div class="text-lg leading-none mt-1">${loopDate.getDate()}</div>
        </div>`;

        let bgLines = '';
        for(let h = CAL_START_HOUR; h <= CAL_END_HOUR; h++) {
            bgLines += `<div style="height:${PIXELS_PER_HOUR}px" class="border-b border-border/30 w-full pointer-events-none"></div>`;
        }

        const taskHtml = getTasksForCalendarColumn(loopDate);

        // Pass NUMBER to handleCalendarDrop
        columnsHtml += `
        <div class="flex-1 border-r border-border relative bg-base/5 group transition-colors hover:bg-base/10"
             ondragover="allowDrop(event)"
             ondrop="handleCalendarDrop(event, ${columnTimestamp})">
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
    const tasks = globalTasks.filter(t => !t.completed && !t.plannedDate);

    if (tasks.length === 0) {
        container.innerHTML = `<div class="text-center text-xs text-muted italic p-4">All tasks scheduled!</div>`;
        return;
    }

    tasks.forEach(t => {
        const color = classPreferences[t.course] || '#888';
        const est = t.est || 30;
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
    const tasks = globalTasks.filter(t => {
        if(t.completed || !t.plannedDate) return false;

        // Robust Date Comparison
        const pDate = new Date(t.plannedDate);
        return pDate.getDate() === dateObj.getDate() && 
               pDate.getMonth() === dateObj.getMonth() && 
               pDate.getFullYear() === dateObj.getFullYear();
    });

    tasks.forEach(t => {
        const plan = new Date(t.plannedDate);
        const gridStartMins = CAL_START_HOUR * 60;
        const planStartMins = (plan.getHours() * 60) + plan.getMinutes();
        const duration = t.est || 30;

        let topPx = (planStartMins - gridStartMins) * (PIXELS_PER_HOUR / 60);
        let heightPx = duration * (PIXELS_PER_HOUR / 60);
        if (topPx < 0) { heightPx += topPx; topPx = 0; }

        const color = classPreferences[t.course] || '#888';
        const is24 = settings.timeFormat24 || false;
        const timeStr = is24 
            ? plan.toLocaleTimeString([], {hour12: false, hour:'2-digit', minute:'2-digit'})
            : plan.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});

        html += `
        <div draggable="true" ondragstart="handleDragStart(event, ${t.id}, ${duration})"
             onclick="openTaskDetails(${t.id})" 
             class="absolute inset-x-1 rounded-lg border-l-4 shadow-sm hover:brightness-110 cursor-pointer overflow-hidden text-[10px] p-1 flex flex-col justify-start transition-all hover:scale-[1.02] hover:z-20 bg-surface"
             style="top:${topPx}px; height:${heightPx}px; background-color:${color}20; border-left-color:${color}; border: 1px solid ${color}40; border-left-width: 4px;">
            <div class="font-bold truncate text-text leading-tight">${t.title}</div>
            <div class="opacity-70 truncate">${timeStr} (${t.est}m)</div>
        </div>`;
    });
    return html;
}

function updateTimeLine() {
    const line = document.getElementById('cal-current-time');
    if(typeof calendarOffset === 'undefined' || calendarOffset !== 0 || !line) { if(line) line.classList.add('hidden'); return; }

    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    if(h < CAL_START_HOUR || h > CAL_END_HOUR) { line.classList.add('hidden'); return; }

    line.classList.remove('hidden');
    const gridStartMins = CAL_START_HOUR * 60;
    const currentTotalMins = (h * 60) + m;
    const topPx = (currentTotalMins - gridStartMins) * (PIXELS_PER_HOUR / 60);
    line.style.top = `${topPx}px`;
}