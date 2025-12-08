/* ==========================================================================
   STUDENT: CALENDAR RENDERER
   ==========================================================================
   PURPOSE: 
   1. Draws the weekly grid view.
   2. Renders time slots (Gutter).
   3. Renders scheduled tasks as absolute-positioned blocks.
   4. Renders the "Red Line" for current time.
   ========================================================================== */

// --- CONFIGURATION ---
const CAL_START_HOUR = 6;     // 6:00 AM
const CAL_END_HOUR = 24;      // Midnight
const PIXELS_PER_HOUR = 100;  // Vertical scale

/* =========================================
   1. MAIN RENDER FUNCTION
   ========================================= */

function renderCalendar() {
    const gridCols = document.getElementById('cal-grid-columns');
    const headerRow = document.getElementById('cal-header-row');
    const timeGutter = document.getElementById('cal-time-gutter');
    const label = document.getElementById('cal-week-label');

    if (!gridCols) return;

    // 1. CALCULATE DATE RANGE
    const curr = new Date();
    if (typeof calendarOffset === 'undefined') calendarOffset = 0;

    // Shift date by offset weeks
    curr.setDate(curr.getDate() + (calendarOffset * 7));

    // Find Monday of that week
    const first = curr.getDate() - curr.getDay() + 1; 
    const weekStart = new Date(curr.setDate(first));
    weekStart.setHours(0,0,0,0);

    const weekEnd = new Date(new Date(weekStart).setDate(weekStart.getDate() + 6));

    // Update Label (e.g. "12/1/2024 - 12/7/2024")
    label.innerText = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;

    // 2. RENDER TIME GUTTER (Left Side)
    const is24 = settings.timeFormat24 || false;
    timeGutter.innerHTML = '';

    for (let h = CAL_START_HOUR; h <= CAL_END_HOUR; h++) {
        let timeStr;

        if (is24) {
            timeStr = `${h}:00`;
        } else {
            // 12-hour format logic
            if (h === 12) timeStr = `12 PM`;
            else if (h === 24) timeStr = `12 AM`;
            else if (h > 12) timeStr = `${h-12} PM`;
            else timeStr = `${h} AM`;
        }

        timeGutter.innerHTML += `<div style="height:${PIXELS_PER_HOUR}px" class="flex items-start justify-center pt-1 border-b border-transparent">${timeStr}</div>`;
    }

    renderUnscheduledSidebar();

    // 3. RENDER DAY COLUMNS
    let headersHtml = '<div class="w-16 border-r border-border shrink-0 bg-base/50"></div>'; // Empty corner box
    let columnsHtml = '';

    for (let i = 0; i < 7; i++) {
        const loopDate = new Date(weekStart);
        loopDate.setDate(weekStart.getDate() + i);

        // --- CRITICAL FIX: USE TIMESTAMP ---
        // Passing a numeric timestamp avoids string parsing issues across browsers/timezones.
        const columnTimestamp = loopDate.getTime(); 

        // Highlight Today
        const isToday = new Date().toDateString() === loopDate.toDateString();
        const headClass = isToday ? "text-primary font-extrabold bg-primary/5" : "text-muted font-bold";

        // A. Header Cell
        headersHtml += `
        <div class="flex-1 text-center py-3 border-r border-border ${headClass}">
            <div class="text-xs uppercase tracking-widest">${loopDate.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div class="text-lg leading-none mt-1">${loopDate.getDate()}</div>
        </div>`;

        // B. Background Grid Lines
        let bgLines = '';
        for (let h = CAL_START_HOUR; h <= CAL_END_HOUR; h++) {
            bgLines += `<div style="height:${PIXELS_PER_HOUR}px" class="border-b border-border/30 w-full pointer-events-none"></div>`;
        }

        // C. Tasks for this Day
        const taskHtml = getTasksForCalendarColumn(loopDate);

        // D. Construct Column
        columnsHtml += `
        <div class="flex-1 border-r border-border relative bg-base/5 group transition-colors hover:bg-base/10"
             ondragover="allowDrop(event)"
             ondrop="handleCalendarDrop(event, ${columnTimestamp})">

            <!-- Grid Lines Layer -->
            <div class="absolute inset-0 z-0 pointer-events-none">${bgLines}</div>

            <!-- Task Blocks Layer -->
            ${taskHtml}
        </div>`;
    }

    headerRow.innerHTML = headersHtml;
    gridCols.innerHTML = columnsHtml;

    // 4. Update Red Line (Current Time)
    updateTimeLine();
}

/* =========================================
   2. SIDEBAR (Unscheduled Tasks)
   ========================================= */

function renderUnscheduledSidebar() {
    const container = document.getElementById('cal-unscheduled-list');
    container.innerHTML = '';

    // Find tasks that are NOT done and NOT scheduled
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

/* =========================================
   3. TASK BLOCK POSITIONING
   ========================================= */

function getTasksForCalendarColumn(dateObj) {
    let html = '';

    const tasks = globalTasks.filter(t => {
        if (t.completed || !t.plannedDate) return false;

        // Verify task belongs to this specific day
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

        // Calculate Position (Top) and Height
        let topPx = (planStartMins - gridStartMins) * (PIXELS_PER_HOUR / 60);
        let heightPx = duration * (PIXELS_PER_HOUR / 60);

        // Clip tasks that start before 6am so they don't float off-screen
        if (topPx < 0) { 
            heightPx += topPx; 
            topPx = 0; 
        }

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

/* =========================================
   4. CURRENT TIME INDICATOR
   ========================================= */

function updateTimeLine() {
    const line = document.getElementById('cal-current-time');

    // Only show line on the "Current Week" view
    if (typeof calendarOffset === 'undefined' || calendarOffset !== 0 || !line) { 
        if (line) line.classList.add('hidden'); 
        return; 
    }

    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();

    // Hide if outside of schedule hours
    if (h < CAL_START_HOUR || h > CAL_END_HOUR) { 
        line.classList.add('hidden'); 
        return; 
    }

    line.classList.remove('hidden');

    const gridStartMins = CAL_START_HOUR * 60;
    const currentTotalMins = (h * 60) + m;

    // Calculate vertical position
    const topPx = (currentTotalMins - gridStartMins) * (PIXELS_PER_HOUR / 60);
    line.style.top = `${topPx}px`;
}