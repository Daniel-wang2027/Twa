/* ==========================================================================
   STUDENT: CALENDAR RENDERER
   ==========================================================================
   PURPOSE: 
   1. Draws the Weekly Time Grid (Time Blocker View).
   2. Renders the Time Gutter (left side).
   3. Renders Scheduled Tasks as absolute-positioned blocks.
   4. Renders the Unscheduled Sidebar.
   ========================================================================== */

// --- CONFIGURATION ---
// Determines the visual height and range of the calendar.
// If you change PIXELS_PER_HOUR, you must update the CSS or logic that relies on it.
const CAL_START_HOUR = 6;     // 6:00 AM
const CAL_END_HOUR = 24;      // Midnight
const PIXELS_PER_HOUR = 100;  // 1 hour = 100px height

/**
 * Main function to redraw the entire calendar grid.
 * Called whenever the week changes or a task is moved.
 */
function renderCalendar() {
    const gridCols = document.getElementById('cal-grid-columns');
    const headerRow = document.getElementById('cal-header-row');
    const timeGutter = document.getElementById('cal-time-gutter');
    const label = document.getElementById('cal-week-label');

    // Safety check: if the view isn't loaded, stop.
    if (!gridCols) return;

    // --- 1. DATE CALCULATIONS ---
    // Determine the Start/End of the currently viewed week.
    const curr = new Date();
    if (typeof calendarOffset === 'undefined') calendarOffset = 0;

    // Shift current date by the week offset (offset * 7 days)
    curr.setDate(curr.getDate() + (calendarOffset * 7));

    // Find the Monday of that week
    const first = curr.getDate() - curr.getDay() + 1; 
    const weekStart = new Date(curr.setDate(first));
    weekStart.setHours(0,0,0,0); // Normalize to midnight

    // Calculate Sunday (End of week)
    const weekEnd = new Date(new Date(weekStart).setDate(weekStart.getDate() + 6));

    // Update the Label (e.g. "12/01/2025 - 12/07/2025")
    if (label) label.innerText = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;

    // --- 2. RENDER TIME GUTTER ---
    // Draws the timestamps on the left side (6 AM, 7 AM...)
    const is24 = settings.timeFormat24 || false;
    timeGutter.innerHTML = '';

    for (let h = CAL_START_HOUR; h <= CAL_END_HOUR; h++) {
        let timeStr;
        // Format based on user preference
        if (is24) {
            timeStr = `${h}:00`;
        } else {
            timeStr = (h > 12) ? `${h-12} PM` : (h === 12 ? `12 PM` : (h === 24 ? `12 AM` : `${h} AM`));
        }

        // Render the tick mark
        timeGutter.innerHTML += `<div style="height:${PIXELS_PER_HOUR}px" class="flex items-start justify-center pt-1 border-b border-transparent">${timeStr}</div>`;
    }

    // Update the Sidebar list (Tasks waiting to be scheduled)
    renderUnscheduledSidebar();

    // --- 3. RENDER DAY COLUMNS ---
    // We render 7 columns (Mon-Sun), each containing grid lines and task blocks.
    let headersHtml = '<div class="w-16 border-r border-border shrink-0 bg-base/50"></div>'; // Corner Spacer
    let columnsHtml = '';

    for (let i = 0; i < 7; i++) {
        // Calculate the specific date for this column
        const loopDate = new Date(weekStart);
        loopDate.setDate(weekStart.getDate() + i);

        // IMPORTANT: We use the timestamp number for drop logic to avoid timezone string parsing issues.
        const columnTimestamp = loopDate.getTime(); 

        // Style "Today" differently
        const isToday = new Date().toDateString() === loopDate.toDateString();
        const headClass = isToday ? "text-primary font-extrabold bg-primary/5" : "text-muted font-bold";

        // Build Header Cell
        headersHtml += `
        <div class="flex-1 text-center py-3 border-r border-border ${headClass}">
            <div class="text-xs uppercase tracking-widest">${loopDate.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div class="text-lg leading-none mt-1">${loopDate.getDate()}</div>
        </div>`;

        // Build Background Lines (The horizontal lines for each hour)
        let bgLines = '';
        for (let h = CAL_START_HOUR; h <= CAL_END_HOUR; h++) {
            bgLines += `<div style="height:${PIXELS_PER_HOUR}px" class="border-b border-border/30 w-full pointer-events-none"></div>`;
        }

        // Get the HTML for tasks assigned to this day
        const taskHtml = getTasksForCalendarColumn(loopDate);

        // Build the Column
        // Note: ondrop passes 'columnTimestamp' so the logic knows which date received the task.
        columnsHtml += `
        <div class="flex-1 border-r border-border relative bg-base/5 group transition-colors hover:bg-base/10"
             ondragover="allowDrop(event)"
             ondrop="handleCalendarDrop(event, ${columnTimestamp})">

            <!-- Layer 1: Grid Lines -->
            <div class="absolute inset-0 z-0 pointer-events-none">${bgLines}</div>

            <!-- Layer 2: Task Blocks -->
            ${taskHtml}
        </div>`;
    }

    // Inject HTML into the DOM
    headerRow.innerHTML = headersHtml;
    gridCols.innerHTML = columnsHtml;

    // Draw the "Current Time" red line
    updateTimeLine();
}

/**
 * Renders the list of tasks on the left sidebar that haven't been scheduled yet.
 */
function renderUnscheduledSidebar() {
    const container = document.getElementById('cal-unscheduled-list');
    if (!container) return;
    container.innerHTML = '';

    // Filter: Not Completed AND No 'plannedDate' set
    const tasks = globalTasks.filter(t => !t.completed && !t.plannedDate);

    if (tasks.length === 0) {
        container.innerHTML = `<div class="text-center text-xs text-muted italic p-4">All tasks scheduled!</div>`;
        return;
    }

    tasks.forEach(t => {
        const color = classPreferences[t.course] || '#888';
        const est = t.est || 30;

        // CRITICAL FIX: Wrapped '${t.id}' in quotes.
        // If ID is "backpack-task-1", without quotes JS thinks it's a math operation (backpack minus task).
        container.innerHTML += `
        <div draggable="true" ondragstart="handleDragStart(event, '${t.id}', ${est})"
             onclick="openTaskDetails('${t.id}')"
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

/**
 * Generates the HTML for task blocks inside a specific day column.
 * Calculates 'top' (start time) and 'height' (duration) based on pixels.
 */
function getTasksForCalendarColumn(dateObj) {
    let html = '';

    // Find tasks scheduled for this specific date
    const tasks = globalTasks.filter(t => {
        if (t.completed || !t.plannedDate) return false;

        // Robust Date Comparison (ignoring time)
        const pDate = new Date(t.plannedDate);
        return pDate.getDate() === dateObj.getDate() && 
               pDate.getMonth() === dateObj.getMonth() && 
               pDate.getFullYear() === dateObj.getFullYear();
    });

    tasks.forEach(t => {
        const plan = new Date(t.plannedDate);
        const gridStartMins = CAL_START_HOUR * 60; // e.g. 6:00 AM = 360 mins
        const planStartMins = (plan.getHours() * 60) + plan.getMinutes();
        const duration = t.est || 30;

        // --- POSITION MATH ---
        // 1. Calculate how many minutes from the top of the grid.
        // 2. Convert minutes to pixels (100px per 60mins).
        let topPx = (planStartMins - gridStartMins) * (PIXELS_PER_HOUR / 60);
        let heightPx = duration * (PIXELS_PER_HOUR / 60);

        // Prevent blocks from floating off the top if scheduled before start time
        if (topPx < 0) { 
            heightPx += topPx; // Shrink height
            topPx = 0;         // Pin to top
        }

        const color = classPreferences[t.course] || '#888';
        const is24 = settings.timeFormat24 || false;
        const timeStr = is24 
            ? plan.toLocaleTimeString([], {hour12: false, hour:'2-digit', minute:'2-digit'})
            : plan.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});

        // CRITICAL FIX: Wrapped '${t.id}' in quotes here too
        html += `
        <div draggable="true" ondragstart="handleDragStart(event, '${t.id}', ${duration})"
             onclick="openTaskDetails('${t.id}')" 
             class="absolute inset-x-1 rounded-lg border-l-4 shadow-sm hover:brightness-110 cursor-pointer overflow-hidden text-[10px] p-1 flex flex-col justify-start transition-all hover:scale-[1.02] hover:z-20 bg-surface"
             style="top:${topPx}px; height:${heightPx}px; background-color:${color}20; border-left-color:${color}; border: 1px solid ${color}40; border-left-width: 4px;">
            <div class="font-bold truncate text-text leading-tight">${t.title}</div>
            <div class="opacity-70 truncate">${timeStr} (${t.est}m)</div>
        </div>`;
    });
    return html;
}

/**
 * Draws the red line indicating the current time.
 */
function updateTimeLine() {
    const line = document.getElementById('cal-current-time');

    // Only show line if we are on the Current Week view (Offset 0)
    if (typeof calendarOffset === 'undefined' || calendarOffset !== 0 || !line) { 
        if (line) line.classList.add('hidden'); 
        return; 
    }

    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();

    // Hide if current time is outside grid hours
    if (h < CAL_START_HOUR || h > CAL_END_HOUR) { 
        line.classList.add('hidden'); 
        return; 
    }

    line.classList.remove('hidden');

    // Calculate Position
    const gridStartMins = CAL_START_HOUR * 60;
    const currentTotalMins = (h * 60) + m;
    const topPx = (currentTotalMins - gridStartMins) * (PIXELS_PER_HOUR / 60);

    line.style.top = `${topPx}px`;
}